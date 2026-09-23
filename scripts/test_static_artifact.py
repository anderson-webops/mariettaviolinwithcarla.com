#!/usr/bin/env python3
import gzip
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "static_artifact",
    Path(__file__).with_name("static-artifact.py"),
)
artifact = importlib.util.module_from_spec(spec)
spec.loader.exec_module(artifact)

COMMIT = "a" * 40


class StaticArtifactTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)

    def tearDown(self):
        for path in sorted(self.root.rglob("*"), reverse=True):
            try:
                path.chmod(0o755 if path.is_dir() else 0o644)
            except FileNotFoundError:
                pass
        self.temporary.cleanup()

    def fixture(self, name, version="1.6.0"):
        root = self.root / name
        output = root / "front-end/dist"
        output.mkdir(parents=True)
        metadata = {
            "commit": COMMIT,
            "ok": True,
            "ref": "v1.6.0",
            "runtime": "nuxt-static",
            "service": "mariettaviolinwithcarla.com",
            "version": version,
        }
        files = {
            "index.html": (
                '<!doctype html><script src="/vendor/umami-tracker.js" '
                'data-host-url="https://analytics.mariettaviolinwithcarla.com"></script>'
            ),
            "404.html": "not found",
            "deployment.json": json.dumps(metadata),
            "release.json": json.dumps(metadata),
            "robots.txt": "User-agent: *\nAllow: /\n",
            "sitemap.xml": "<urlset></urlset>",
            "vendor/umami-tracker.js": "/* reviewed */" + "x" * 2000,
            "_nuxt/app.js": "console.log('fixture')",
        }
        for relative, content in files.items():
            target = output / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            target.chmod(0o444)
        return root

    def test_pack_is_reproducible_and_unpacked_tree_is_exact(self):
        first = self.fixture("first")
        second = self.fixture("second")
        first_archive = self.root / "first.tar.gz"
        second_archive = self.root / "second.tar.gz"
        first_result = artifact.pack(first, first_archive, COMMIT)
        second_result = artifact.pack(second, second_archive, COMMIT)
        self.assertEqual(first_result["sha256"], second_result["sha256"])

        unpacked = self.root / "unpacked"
        unpacked.mkdir()
        artifact.unpack(unpacked, first_archive, first_result["sha256"], COMMIT)
        artifact.validate(unpacked, artifact.load_json(unpacked / artifact.MANIFEST))
        self.assertEqual(
            (unpacked / "front-end/dist/index.html").read_bytes(),
            (first / "front-end/dist/index.html").read_bytes(),
        )

    def test_trusted_archive_detects_post_pack_mutation(self):
        stage = self.fixture("stage")
        archive = self.root / "release.tar.gz"
        result = artifact.pack(stage, archive, COMMIT)
        target = stage / "front-end/dist/index.html"
        target.chmod(0o644)
        target.write_text("changed", encoding="utf-8")
        target.chmod(0o444)
        with self.assertRaisesRegex(ValueError, "paths, types, modes, hashes, or sizes"):
            artifact.validate(stage, artifact.load_json(stage / artifact.MANIFEST))
        with self.assertRaisesRegex(ValueError, "staged manifest differs|paths, types"):
            declared = artifact.load_json(stage / artifact.MANIFEST)
            if declared != artifact.archived_manifest(archive):
                raise ValueError("staged manifest differs from trusted archive")
            artifact.validate(stage, declared)
        self.assertEqual(artifact.digest(archive), result["sha256"])

    def test_unpack_rejects_traversal_members(self):
        archive_path = self.root / "unsafe.tar.gz"
        payload = b"escape"
        with archive_path.open("wb") as raw:
            with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as compressed:
                with tarfile.open(fileobj=compressed, mode="w") as archive:
                    info = tarfile.TarInfo("../escape")
                    info.size = len(payload)
                    info.mode = 0o444
                    info.uid = 0
                    info.gid = 0
                    archive.addfile(info, io.BytesIO(payload))
        destination = self.root / "unsafe-output"
        destination.mkdir()
        sha = hashlib.sha256(archive_path.read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError, "unsafe archive members"):
            artifact.unpack(destination, archive_path, sha, COMMIT)
        self.assertFalse((self.root / "escape").exists())

    def test_legacy_archive_requires_explicit_pack_and_unpack_mode(self):
        fixture = self.fixture("legacy-fixture", version="1.5.1")
        archive = self.root / "legacy.tar.gz"
        result = artifact.pack(fixture, archive, COMMIT, allow_legacy=True)
        self.assertEqual(
            artifact.archived_manifest(archive)["purpose"],
            "legacy-rollback",
        )

        candidate = self.root / "candidate-rejected"
        candidate.mkdir()
        with self.assertRaisesRegex(
            ValueError,
            "legacy rollback artifacts cannot be promoted as candidates",
        ):
            artifact.unpack(candidate, archive, result["sha256"], COMMIT)

        rollback = self.root / "legacy-unpacked"
        rollback.mkdir()
        manifest = artifact.unpack(
            rollback,
            archive,
            result["sha256"],
            COMMIT,
            allow_legacy=True,
        )
        self.assertEqual(manifest["purpose"], "legacy-rollback")
        artifact.validate(
            rollback,
            artifact.load_json(rollback / artifact.MANIFEST),
            allow_legacy=True,
        )

    def test_legacy_unpack_rejects_a_normal_release_archive(self):
        fixture = self.fixture("release-fixture")
        archive = self.root / "release.tar.gz"
        result = artifact.pack(fixture, archive, COMMIT)
        rollback = self.root / "release-as-rollback"
        rollback.mkdir()
        with self.assertRaisesRegex(
            ValueError,
            "artifact purpose must be legacy-rollback",
        ):
            artifact.unpack(
                rollback,
                archive,
                result["sha256"],
                COMMIT,
                allow_legacy=True,
            )

    def test_pack_rejects_symlinks_inside_artifact_tree(self):
        fixture = self.fixture("artifact-symlink", version="1.5.1")
        source = fixture / "front-end/dist"
        (source / "linked").symlink_to(source / "index.html")
        with self.assertRaisesRegex(ValueError, "forbidden artifact path"):
            artifact.pack(
                fixture,
                self.root / "symlink-rejected.tar.gz",
                COMMIT,
                allow_legacy=True,
            )


if __name__ == "__main__":
    unittest.main()
