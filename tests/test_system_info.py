import unittest
from backend.system_info import build_payload

class PayloadTests(unittest.TestCase):
    def test_empty_inventory_is_safe(self):
        payload = build_payload({})
        self.assertEqual(payload["drivers"], [])
        self.assertEqual(payload["hardware"], [])
        self.assertEqual(payload["overview"][3]["main"], "0 detected")

if __name__ == "__main__":
    unittest.main()
