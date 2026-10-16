"""NEXUS accessibility checks with computed contrast and explicit audit limitations."""
import asyncio
import json
import os
from pathlib import Path
import logging
import re
from typing import Dict
from urllib.parse import urlsplit

logger = logging.getLogger(__name__)
_HEX = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


def _luminance(color: str) -> float:
    if not isinstance(color, str):
        raise ValueError("invalid_hex_color")
    m = _HEX.fullmatch(color)
    if not m:
        raise ValueError("invalid_hex_color")
    h = m.group(1)
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    channels = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return sum(a * b for a, b in zip(linear, (0.2126, 0.7152, 0.0722)))


class AccessibilityEngine:
    def __init__(self, db=None):
        self.db = db

    async def audit_page(self, url: str) -> Dict:
        """A page audit needs an actual browser/axe or pa11y runner."""
        try:
            parsed = urlsplit(url)
            if parsed.scheme not in ("https", "http") or not parsed.hostname:
                raise ValueError("invalid_url")
        except (TypeError, ValueError):
            return {"success": False, "error": "invalid_url", "url": url}
        origins = os.getenv("NEXUS_AUDIT_ORIGINS", "").split(",")
        if not any(origins):
            return {"success": False, "error": "page_audit_runner_not_configured",
                    "url": url, "score": None, "issues": None}
        if parsed.username or parsed.password or f"{parsed.scheme}://{parsed.netloc}" not in origins:
            return {"success": False, "error": "target_not_allowed"}
        process = None
        try:
            process = await asyncio.create_subprocess_exec(
                "node", str(Path(__file__).with_name("axe_runner.cjs")), url,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
            output, _ = await asyncio.wait_for(process.communicate(), timeout=45)
            result = json.loads(output)
            if not isinstance(result, dict) or not result.get("success") or process.returncode:
                return {"success": False, "error": "browser_audit_failed"}
            if not isinstance(result.get("issues"), list) or not result.get("engine_version"):
                return {"success": False, "error": "invalid_audit_evidence"}
            return {**result, "url": url}
        except (OSError, ValueError, asyncio.TimeoutError):
            return {"success": False, "error": "browser_audit_failed"}
        finally:
            if process is not None and process.returncode is None:
                process.kill()
                await process.wait()

    async def check_contrast(self, fg: str, bg: str) -> Dict:
        try:
            a, b = _luminance(fg), _luminance(bg)
        except ValueError:
            return {"success": False, "error": "invalid_hex_color", "foreground": fg, "background": bg}
        ratio = (max(a, b) + 0.05) / (min(a, b) + 0.05)
        return {"success": True, "foreground": fg, "background": bg,
                "ratio": f"{ratio:.2f}:1", "ratio_numeric": round(ratio, 4),
                "wcag_aa": ratio >= 4.5, "wcag_aaa": ratio >= 7,
                "wcag_aa_large": ratio >= 3, "wcag_aaa_large": ratio >= 4.5}

    def get_capabilities(self) -> Dict:
        return {"name": "Web Accessibility Hybrid", "version": "1.0.1",
                "checks": {"contrast": "implemented", "page_audit": "not_configured"}}


hybrid_accessibility = AccessibilityEngine(db=None)


def create_accessibility_engine(db):
    global hybrid_accessibility
    hybrid_accessibility = AccessibilityEngine(db)
    return hybrid_accessibility
