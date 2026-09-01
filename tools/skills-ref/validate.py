"""JSON transport for the pinned upstream API; contains no copied spec rules."""

import json
import sys
import tempfile
from pathlib import Path

from skills_ref import validate


def validate_request(request):
    if "directory" in request:
        return validate(Path(request["directory"]))

    folder_name = request["folderName"]
    if (
        not isinstance(folder_name, str)
        or not folder_name
        or folder_name in {".", ".."}
        or "/" in folder_name
        or "\\" in folder_name
    ):
        raise ValueError("folderName must be one directory name")

    # Preserve raw YAML so the upstream parser, not a JS reserialization, decides
    # whether a document is valid. This also validates files read from archives.
    with tempfile.TemporaryDirectory(prefix="skills-ref-") as temporary:
        skill_directory = Path(temporary) / folder_name
        skill_directory.mkdir()
        (skill_directory / "SKILL.md").write_text(request["content"], encoding="utf-8")
        return validate(skill_directory)


def main():
    requests = json.load(sys.stdin)
    results = [validate_request(request) for request in requests]
    json.dump(results, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
