#!/usr/bin/env python3
"""Pack, verify, or unpack the complete immutable static runtime."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tarfile

sys.dont_write_bytecode = True

CONTRACT = Path(__file__).resolve().parent.parent / "deploy/static-artifact.json"
MANIFEST = "runtime-manifest.json"
MAX_FILES = 10_000
MAX_BYTES = 64 * 1024 * 1024
CHUNK = 1024 * 1024


def digest(path):
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(CHUNK), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_json_bytes(value):
    return json.loads(value, object_pairs_hook=unique_object)


def load_json(path):
    return load_json_bytes(path.read_text(encoding="utf-8"))


def permitted(name):
    parts = PurePosixPath(name).parts
    if (
        not parts
        or PurePosixPath(name).as_posix() != name
        or name.startswith("/")
        or "//" in name
    ):
        return False
    allowed = name == MANIFEST or (
        parts[0] == "front-end" and (len(parts) == 1 or parts[1] == "dist")
    )
    return allowed and all(
        part not in (".", "..", ".git", ".ai-work", ".npmrc", "credentials.json")
        and not part.startswith(".env")
        and not part.endswith((
            ".key",
            ".pem",
            ".p12",
            ".pfx",
            ".sqlite",
            ".sqlite3",
            ".sqlite3-shm",
            ".sqlite3-wal",
        ))
        for part in parts
    )


def inventory(root):
    files = {}
    total = 0
    for path in sorted(root.rglob("*")):
        name = path.relative_to(root).as_posix()
        metadata = path.lstat()
        if stat.S_ISLNK(metadata.st_mode) or not permitted(name):
            raise ValueError(f"forbidden artifact path: {name}")
        if stat.S_ISDIR(metadata.st_mode):
            continue
        if not stat.S_ISREG(metadata.st_mode):
            raise ValueError(f"not a regular file: {name}")
        if name == MANIFEST:
            continue
        mode = stat.S_IMODE(metadata.st_mode)
        if mode != 0o444:
            raise ValueError(f"artifact file mode must be 0444: {name}")
        total += metadata.st_size
        if len(files) >= MAX_FILES or total > MAX_BYTES:
            raise ValueError("artifact exceeds the bounded file or byte limit")
        files[name] = {
            "type": "file",
            "mode": "0444",
            "sha256": digest(path),
            "size": metadata.st_size,
        }
    return files


def validate(root, manifest, allow_legacy=False):
    contract = load_json(CONTRACT)
    if set(manifest) != {"format", "purpose", "commit", "contract", "files"}:
        raise ValueError("artifact manifest has unsupported fields")
    if manifest.get("format") != 1 or manifest.get("contract") != contract:
        raise ValueError("artifact does not match the independently trusted static contract")
    if not re.fullmatch(r"[0-9a-f]{40}", manifest.get("commit", "")):
        raise ValueError("an exact lowercase source commit is required")
    purpose = manifest.get("purpose")
    if purpose not in ("release", "legacy-rollback"):
        raise ValueError("artifact purpose is invalid")
    if purpose == "legacy-rollback" and not allow_legacy:
        raise ValueError("legacy rollback artifacts cannot be promoted as candidates")
    actual = inventory(root)
    if actual != manifest.get("files"):
        raise ValueError("artifact paths, types, modes, hashes, or sizes do not match")
    required = (
        contract["legacyRollback"]["required"]
        if purpose == "legacy-rollback"
        else contract["required"]
    )
    for name in required:
        if name not in actual:
            raise ValueError(f"required static path missing: {name}")

    release = load_json(root / "front-end/dist/release.json")
    deployment = load_json(root / "front-end/dist/deployment.json")
    expected_keys = {"commit", "ok", "ref", "runtime", "service", "version"}
    if set(release) != expected_keys or deployment != release:
        raise ValueError("static deployment identity is malformed or inconsistent")
    if (
        release.get("commit") != manifest["commit"]
        or release.get("ok") is not True
        or release.get("runtime") != "nuxt-static"
        or release.get("service") != "mariettaviolinwithcarla.com"
        or not re.fullmatch(r"\d+\.\d+\.\d+", release.get("version", ""))
        or not isinstance(release.get("ref"), str)
        or not release["ref"]
        or len(release["ref"]) > 160
    ):
        raise ValueError("static deployment identity does not match the artifact")
    if purpose == "legacy-rollback":
        version = tuple(int(value) for value in release["version"].split("."))
        maximum = tuple(
            int(value) for value in contract["legacyRollback"]["maximumVersion"].split(".")
        )
        if version > maximum:
            raise ValueError("release is too new for the bounded legacy rollback contract")

    homepage = (root / "front-end/dist/index.html").read_text(encoding="utf-8")
    if purpose == "release" and (
        'src="/vendor/umami-tracker.js"' not in homepage
        or 'data-host-url="https://analytics.mariettaviolinwithcarla.com"' not in homepage
        or 'src="https://analytics.mariettaviolinwithcarla.com' in homepage
    ):
        raise ValueError("static artifact does not preserve the reviewed analytics boundary")
    if any(name.endswith(".map") for name in actual):
        raise ValueError("source maps are not production static assets")
    return manifest


def write_manifest(root, commit, purpose="release", allow_legacy=False):
    manifest_path = root / MANIFEST
    if manifest_path.exists():
        manifest_path.chmod(0o644)
        manifest_path.unlink()
    manifest = {
        "format": 1,
        "purpose": purpose,
        "commit": commit,
        "contract": load_json(CONTRACT),
        "files": inventory(root),
    }
    validate(root, manifest, allow_legacy=allow_legacy)
    manifest_path.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    manifest_path.chmod(0o444)
    return manifest


def archive_members(archive):
    members = archive.getmembers()
    names = [member.name for member in members]
    if (
        len(names) != len(set(names))
        or len(names) > MAX_FILES + 1
        or sum(member.size for member in members) > MAX_BYTES + 1024 * 1024
        or any(
            not member.isfile()
            or not permitted(member.name)
            or stat.S_IMODE(member.mode) != 0o444
            or member.uid != 0
            or member.gid != 0
            for member in members
        )
        or names.count(MANIFEST) != 1
    ):
        raise ValueError("unsafe archive members")
    return members


def archived_manifest(archive_path):
    with tarfile.open(archive_path, "r:gz") as archive:
        archive_members(archive)
        stream = archive.extractfile(MANIFEST)
        if stream is None:
            raise ValueError("archive manifest is missing")
        return load_json_bytes(stream.read().decode("utf-8"))


def pack(root, archive_path, commit, allow_legacy=False):
    if archive_path.exists():
        raise ValueError("never overwrite an existing artifact")
    purpose = "legacy-rollback" if allow_legacy else "release"
    manifest = write_manifest(
        root,
        commit,
        purpose=purpose,
        allow_legacy=allow_legacy,
    )
    names = sorted([MANIFEST, *manifest["files"]])
    archive_path.parent.mkdir(parents=True, exist_ok=True)
    with archive_path.open("xb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0, compresslevel=9) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.PAX_FORMAT) as archive:
                for name in names:
                    source = root / name
                    info = tarfile.TarInfo(name)
                    info.size = source.stat().st_size
                    info.mode = 0o444
                    info.mtime = 0
                    info.uid = 0
                    info.gid = 0
                    info.uname = ""
                    info.gname = ""
                    with source.open("rb") as stream:
                        archive.addfile(info, stream)
    return {
        "archive": archive_path.name,
        "sha256": digest(archive_path),
        "commit": commit,
        "files": len(manifest["files"]),
    }


def unpack(root, archive_path, expected_sha, expected_commit, allow_legacy=False):
    if digest(archive_path) != expected_sha or any(root.iterdir()):
        raise ValueError("archive hash mismatch or destination not empty")
    with tarfile.open(archive_path, "r:gz") as archive:
        members = archive_members(archive)
        for member in members:
            target = root / member.name
            target.parent.mkdir(parents=True, exist_ok=True)
            stream = archive.extractfile(member)
            if stream is None:
                raise ValueError(f"archive file is unreadable: {member.name}")
            with target.open("xb") as output:
                while chunk := stream.read(CHUNK):
                    output.write(chunk)
            target.chmod(0o444)
    for directory in sorted(
        (path for path in root.rglob("*") if path.is_dir()),
        key=lambda item: len(item.parts),
        reverse=True,
    ):
        directory.chmod(0o555)
    manifest = validate(
        root,
        load_json(root / MANIFEST),
        allow_legacy=allow_legacy,
    )
    expected_purpose = "legacy-rollback" if allow_legacy else "release"
    if manifest["purpose"] != expected_purpose:
        raise ValueError(f"artifact purpose must be {expected_purpose}")
    if manifest["commit"] != expected_commit:
        raise ValueError("artifact source identity mismatch")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=["pack", "verify", "unpack"])
    parser.add_argument("tree", type=Path)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--commit")
    parser.add_argument("--sha256")
    parser.add_argument("--allow-legacy", action="store_true")
    args = parser.parse_args()
    root = args.tree.resolve(strict=True)

    if args.operation == "pack":
        if not args.archive or not args.commit:
            parser.error("pack requires --archive and --commit")
        result = pack(root, args.archive, args.commit, allow_legacy=args.allow_legacy)
    elif args.operation == "unpack":
        if not args.archive or not args.sha256 or not args.commit:
            parser.error("unpack requires --archive, --sha256 and --commit")
        result = unpack(
            root,
            args.archive,
            args.sha256,
            args.commit,
            allow_legacy=args.allow_legacy,
        )
        result = {"unpacked": True, "commit": result["commit"], "files": len(result["files"])}
    else:
        declared = load_json(root / MANIFEST)
        if args.archive or args.sha256:
            if not args.archive or not args.sha256 or digest(args.archive) != args.sha256:
                raise ValueError("trusted archive checksum mismatch")
            if declared != archived_manifest(args.archive):
                raise ValueError("staged manifest differs from trusted archive")
        result = validate(root, declared, allow_legacy=args.allow_legacy)
        if args.commit and result["commit"] != args.commit:
            raise ValueError("artifact source identity mismatch")
        result = {"verified": True, "commit": result["commit"], "files": len(result["files"])}
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
