import unittest

from backend.optimization import _gamebar_key_path, _run_key_path


class OptimizationPathTests(unittest.TestCase):
    def test_game_mode_uses_real_windows_registry_path(self):
        self.assertEqual(_gamebar_key_path(), r"Software\Microsoft\GameBar")

    def test_startup_uses_current_user_run_registry_path(self):
        self.assertEqual(_run_key_path(), r"Software\Microsoft\Windows\CurrentVersion\Run")


if __name__ == "__main__":
    unittest.main()
