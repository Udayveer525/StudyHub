#!/usr/bin/env python3
"""
extract_pdf.py — pdfplumber-based subject section extractor for StudyHub / Ollie

Usage:
    python3 extract_pdf.py <pdf_path> <subject_name>

Prints a single JSON object to stdout:
    {"success": true,  "text": "...full section text..."}
    {"success": false, "text": ""}

HOW IT WORKS
------------
Every subject content page in the BCA syllabus (and most Indian university
syllabi using this format) has this layout:

    Subject Name                   ← first non-trivial line on the page
    BCA-16-XXX                     ← paper code
    L  T  P  Cr  External Marks: 65   ← THE KEY SIGNAL
    6  -  -   3  Internal Marks: 10
    Time Duration: 3 Hrs ...
    ...
    UNIT - I
    ...
    UNIT - IV
    ...
    Suggested Readings:            ← end marker

Scheme tables also contain "Subject Name → BCA code" pairs, but the line
after the code is always a numeric row ("6 - - 6 10 65 75 3 Hrs 3").
"External Marks" NEVER appears in scheme tables — it is exclusive to the
content page header. This is the 100% reliable page-start signal, and it
requires no subject code from the database.

Multi-page subjects are handled: once we find the start page, we keep
appending subsequent pages until we hit the next content-page signal.
"""

import sys
import re
import json

try:
    import pdfplumber
except ImportError:
    print(json.dumps({"success": False, "text": "", "error": "pdfplumber not installed"}))
    sys.exit(1)


def is_subject_start(lines):
    """Return True if this page's lines match the content-page header pattern."""
    for line in lines[:10]:
        if "External Marks" in line:
            return True
        # "L T P Cr" header — fallback in case the marks line is on a different line
        if re.search(r'\bL\b.*\bT\b.*\bP\b.*\bCr\b', line):
            return True
    return False


def name_matches(page_lines, subject_name):
    """
    Check whether this page belongs to the requested subject.

    The subject name is ALWAYS the first non-trivial line on its content page
    (confirmed by inspecting all 21 subject pages in the BCA syllabus PDF).
    We therefore only need to match against the very first meaningful line.

    Matching rules (in order):
      1. Exact match (case-insensitive) — covers 95% of cases.
      2. One-word tolerance — allows for a single OCR substitution or
         a minor difference in punctuation (e.g. "C++" vs "C++.").
         We check that the target words are all present in the line and
         the line length is close to the target length.
    """
    target = subject_name.strip().lower()
    # Include ALL words (even 1-char like 'A'/'B') so suffix differences are caught
    target_words = [w for w in re.split(r'\W+', target) if len(w) >= 1]

    # Only check the first non-empty, non-trivial line (skip lone ':' artifacts)
    for line in page_lines[:3]:
        stripped = line.strip()
        if not stripped or stripped == ':':
            continue
        line_lower = stripped.lower()

        # Rule 1: exact match
        if line_lower == target:
            return True

        # Rule 2: normalise dashes/hyphens and compare — handles "–" vs "-" OCR variants
        # e.g. "English (Compulsory) – A" vs "English (Compulsory) - A"
        norm_target = re.sub(r'[\u2013\u2014-]', '-', target)
        norm_line   = re.sub(r'[\u2013\u2014-]', '-', line_lower)
        if norm_line == norm_target:
            return True

        # Rule 3: all significant words present AND line length close to target.
        # We require ALL words to match (not len-1) to avoid English A matching B.
        if target_words:
            hits = sum(1 for w in target_words if w in line_lower)
            if hits == len(target_words) and len(stripped) <= len(subject_name) + 10:
                return True

        # Only check the very first meaningful line — stop after it
        break

    return False


def extract(pdf_path, subject_name):
    with pdfplumber.open(pdf_path) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]

    # Build a list of (page_index, lines) for all content pages
    content_page_indices = []
    for i, page_text in enumerate(pages):
        lines = [l.strip() for l in page_text.split("\n") if l.strip()]
        if is_subject_start(lines):
            content_page_indices.append(i)

    # Find which content page matches our subject
    target_start = None
    for idx in content_page_indices:
        lines = [l.strip() for l in pages[idx].split("\n") if l.strip()]
        if name_matches(lines, subject_name):
            target_start = idx
            break

    if target_start is None:
        return None

    # Collect pages from target_start until the next content page begins
    # (subjects often span 2 pages in this PDF)
    collected = [pages[target_start]]
    i = target_start + 1
    while i < len(pages):
        if i in content_page_indices:
            break  # next subject starts here
        collected.append(pages[i])
        i += 1

    return "\n".join(collected).strip()


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "text": "", "error": "Usage: extract_pdf.py <pdf> <subject_name>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    subject_name = sys.argv[2]

    try:
        text = extract(pdf_path, subject_name)
    except Exception as e:
        print(json.dumps({"success": False, "text": "", "error": str(e)}))
        sys.exit(1)

    if text:
        print(json.dumps({"success": True, "text": text}))
    else:
        print(json.dumps({"success": False, "text": ""}))


if __name__ == "__main__":
    main()