#!/usr/bin/env python3
"""Reject mutable administrative paths. Run only from a trusted installation."""
import argparse
import os
from pathlib import Path
import stat


def protected(path, tree=False):
    raw = os.fspath(path)
    if not os.path.isabs(raw) or any(part in (".", "..") for part in raw.split(os.sep)):
        raise ValueError(f"administrative input must be absolute without dot components: {raw}")
    path = Path(raw)
    for item in [path, *path.parents]:
        metadata = item.lstat()
        if (
            stat.S_ISLNK(metadata.st_mode)
            or metadata.st_uid != 0
            or metadata.st_mode & 0o022
        ):
            raise ValueError(f"administrative input is not protected: {item}")
        if not (stat.S_ISDIR(metadata.st_mode) or stat.S_ISREG(metadata.st_mode)):
            raise ValueError(f"administrative input has an unsafe type: {item}")
    if tree:
        for item in path.rglob("*"):
            metadata = item.lstat()
            if (
                stat.S_ISLNK(metadata.st_mode)
                or metadata.st_uid != 0
                or metadata.st_mode & 0o022
                or not (
                    stat.S_ISDIR(metadata.st_mode)
                    or stat.S_ISREG(metadata.st_mode)
                )
            ):
                raise ValueError(f"release tree is not protected: {item}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tree", action="append", default=[])
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args()
    if os.geteuid() != 0:
        raise SystemExit("administrative path validation requires root")
    for value in args.paths:
        protected(value)
    for value in args.tree:
        protected(value, tree=True)
