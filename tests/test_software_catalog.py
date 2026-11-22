import unittest

from backend.software_catalog import CATALOG, _find_installed, _is_allowed_host


class SoftwareCatalogTests(unittest.TestCase):
    def test_catalog_has_official_https_installers(self):
        self.assertGreaterEqual(len(CATALOG), 8)
        for item in CATALOG:
            self.assertTrue(item["url"].startswith("https://"), item["id"])
            self.assertTrue(item["publisher"], item["id"])
            self.assertTrue(item["hosts"], item["id"])

    def test_installed_program_detection_uses_display_name_patterns(self):
        item = next(x for x in CATALOG if x["id"] == "steam")
        match = _find_installed(item, [{"name": "Steam", "version": "2.10.91.91"}])
        self.assertIsNotNone(match)
        self.assertEqual(match["version"], "2.10.91.91")

    def test_unrelated_program_is_not_detected(self):
        item = next(x for x in CATALOG if x["id"] == "steam")
        self.assertIsNone(_find_installed(item, [{"name": "SteamVR Tools", "version": "1.0"}]))

    def test_redirect_host_must_be_allowlisted(self):
        self.assertTrue(_is_allowed_host("download.visualstudio.microsoft.com", ["microsoft.com"]))
        self.assertFalse(_is_allowed_host("microsoft.com.attacker.example", ["microsoft.com"]))


if __name__ == "__main__":
    unittest.main()
