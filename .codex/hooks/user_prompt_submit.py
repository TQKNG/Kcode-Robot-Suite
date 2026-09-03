#!/usr/bin/env python3

import json
import sys

payload = json.loads(sys.stdin.read() or "{}")
prompt = payload.get("prompt", "").lower()

if "block_test" in prompt:
    print(json.dumps({
        "decision": "block",
        "reason": "Blocked by UserPromptSubmit test hook because prompt contains BLOCK_TEST."
    }))
    sys.exit(0)
