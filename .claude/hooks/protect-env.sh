#!/usr/bin/env bash
# PreToolUse hook: block edits to environment files (.env, .env.local).
#
# Reads the tool call as JSON on stdin, extracts the target file path, and
# rejects the edit when it points at a protected env file.
#
# Exit code 2 is special for PreToolUse hooks: it BLOCKS the tool call before
# it runs and feeds whatever we print to stderr back to Claude as the reason.
# (Exit 0 = allow; any other non-zero = non-blocking error.)

input=$(cat)

# The path lives at .tool_input.file_path for Edit/Write/MultiEdit and at
# .tool_input.notebook_path for NotebookEdit.
path=$(printf '%s' "$input" | /usr/bin/python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)
ti = data.get("tool_input", {}) or {}
print(ti.get("file_path") or ti.get("notebook_path") or "")
')

# Match on the basename so nested paths (e.g. app/.env.local) are covered too.
base=$(basename "$path")

if [ "$base" = ".env" ] || [ "$base" = ".env.local" ]; then
  echo "Blocked: $base is a protected environment file. Ask me first before editing it." >&2
  exit 2
fi

exit 0
