import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("reference_package_io", ROOT / "scripts/package-native-providers.py")
PACKAGE_IO = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PACKAGE_IO)
SOURCE = ROOT / "vendor/framework-parents"
REQUIRED = {
    "braces": {"package.json", "LICENSE", "index.js", "lib/assert-depth.js", "lib/parse.js", "lib/expand.js"},
    "deepmerge": {"package.json", "license.txt", "dist/cjs.js", "dist/umd.js", "index.d.ts"},
    "listhen": {"package.json", "LICENSE", "dist/index.mjs", "dist/index.cjs", "dist/cli.mjs", "bin/listhen.mjs", "cli.d.ts"},
}


def git_blob(contents):
    return hashlib.sha1(b"blob " + str(len(contents)).encode() + b"\0" + contents, usedforsecurity=False).hexdigest()


class OriginalLocalInputTests(unittest.TestCase):
    def test_complete_original_source_metadata_licenses_modes_and_archive_integrity(self):
        record = json.loads((SOURCE / "LOCAL-PARENTS.json").read_text())
        self.assertEqual(record["schemaVersion"], 1)
        self.assertEqual(record["reviewedSourceCommit"], "185318d2620f6595a6238aec83430cb17aa63620")
        self.assertEqual(set(record["packages"]), set(REQUIRED))
        for name, information in record["packages"].items():
            with self.subTest(name=name):
                expected = "inputs/" + name + "-" + information["package"]["version"] + ".tgz"
                self.assertEqual(information["archive"], expected)
                payload = PACKAGE_IO.regular_bytes(SOURCE / "upstream" / expected, PACKAGE_IO.MAX_COMPRESSED)
                self.assertEqual(hashlib.sha256(payload).hexdigest(), information["sha256"])
                self.assertEqual(PACKAGE_IO.integrity(payload), information["integrity"])
                files = PACKAGE_IO.archive_files(payload)
                with tarfile.open(fileobj=io.BytesIO(payload), mode="r:gz") as archive:
                    modes = {member.name: member.mode for member in archive if member.isfile()}
                self.assertEqual(set(files), {"package/" + filename for filename in information["files"]})
                self.assertTrue(REQUIRED[name] <= set(information["files"]))
                self.assertEqual(json.loads(files["package/package.json"]), information["package"])
                self.assertEqual(json.loads(information["sourcePackageJson"]), information["package"])
                for filename, original in information["files"].items():
                    contents = files["package/" + filename]
                    self.assertEqual(original["sourcePath"], "vendor/" + name + "/" + filename)
                    self.assertEqual(hashlib.sha256(contents).hexdigest(), original["sha256"])
                    source = information["sourcePackageJson"].encode() if filename == "package.json" else contents
                    self.assertEqual(git_blob(source), original["sourceGitBlob"])
                    self.assertIn(original["mode"], {0o644, 0o755})
                    self.assertEqual(modes["package/" + filename], original["mode"])
                if name == "listhen":
                    self.assertEqual(information["files"]["bin/listhen.mjs"]["mode"], 0o755)


if __name__ == "__main__":
    unittest.main()
