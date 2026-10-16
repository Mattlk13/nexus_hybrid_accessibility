import asyncio
import os
import unittest
from unittest.mock import patch
from nexus_hybrid_accessibility import AccessibilityEngine
class AuditPolicyTests(unittest.TestCase):
    def test_unapproved_origin_is_rejected(self):
        with patch.dict(os.environ, {'NEXUS_AUDIT_ORIGINS':'https://staging.example'}):
            result=asyncio.run(AccessibilityEngine().audit_page('http://169.254.169.254/latest'))
            self.assertEqual(result['error'],'target_not_allowed')
    def test_embedded_credentials_rejected(self):
        with patch.dict(os.environ, {'NEXUS_AUDIT_ORIGINS':'https://user:pass@staging.example'}):
            result=asyncio.run(AccessibilityEngine().audit_page('https://user:pass@staging.example'))
            self.assertFalse(result['success'])
