#!/usr/bin/env python3
"""Render M21's OKF bundle with Google Cloud's reference visualizer.

The reference viewer discovers edges from Markdown links. M21's typed
relationships are canonical frontmatter extensions, so this command creates a
temporary standards-compatible projection that adds those links to each body
before invoking the upstream viewer. Source concepts are never modified.
"""

from __future__ import annotations

import argparse
import os
import shutil
import tempfile
from pathlib import Path

import yaml
from reference_agent.viewer.generator import generate_visualization


def parse_document(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}, text
    _, frontmatter, body = text.split("---\n", 2)
    return yaml.safe_load(frontmatter) or {}, body


def relationship_projection(bundle: Path, destination: Path) -> None:
    shutil.copytree(bundle, destination, dirs_exist_ok=True)
    # OKF reserves log.md, but the upstream proof-of-concept viewer currently
    # excludes only index.md. Remove logs from the temporary projection so they
    # do not appear as "Unknown" concepts.
    for log_file in destination.rglob("log.md"):
        log_file.unlink()

    titles: dict[str, str] = {}

    for source in bundle.rglob("*.md"):
        if source.name in {"index.md", "log.md"}:
            continue
        frontmatter, _ = parse_document(source)
        concept_path = "/" + source.relative_to(bundle).as_posix()
        titles[concept_path] = str(frontmatter.get("title") or source.stem)

    for source in bundle.rglob("*.md"):
        if source.name in {"index.md", "log.md"}:
            continue
        frontmatter, body = parse_document(source)
        relationships = frontmatter.get("relationships") or []
        if not relationships:
            continue

        projected_source = destination / source.relative_to(bundle)
        lines = ["", "# Relationships", ""]
        for relationship in relationships:
            target = relationship.get("target")
            relation_type = relationship.get("type")
            if not target or not relation_type:
                continue
            target_path = bundle / target.lstrip("/")
            relative_target = os.path.relpath(target_path, start=source.parent)
            label = titles.get(target, Path(target).stem)
            line = f"- **{relation_type}** [{label}]({Path(relative_target).as_posix()})"
            if rationale := relationship.get("rationale"):
                line += f" — {rationale}"
            lines.append(line)

        original = projected_source.read_text(encoding="utf-8").rstrip()
        projected_source.write_text(original + "\n" + "\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Visualize M21's OKF knowledge graph")
    parser.add_argument("--bundle", type=Path, default=Path("okf"))
    parser.add_argument("--out", type=Path, default=Path("okf/viz.html"))
    parser.add_argument("--name", default="M21 Product Knowledge")
    args = parser.parse_args()

    bundle = args.bundle.resolve()
    output = args.out.resolve()
    with tempfile.TemporaryDirectory(prefix="m21-okf-view-") as temporary:
        projected = Path(temporary) / "bundle"
        relationship_projection(bundle, projected)
        stats = generate_visualization(projected, output, bundle_name=args.name)

    print(
        f"Generated {output} "
        f"({stats['concepts']} concepts, {stats['edges']} edges, {stats['bytes']} bytes)"
    )


if __name__ == "__main__":
    main()
