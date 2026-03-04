import os
import json
from openai import OpenAI

client = None


def _get_client():
    global client
    if client is None:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return client


SYSTEM_PROMPT = """You are a semantic classification assistant for Groven,
a structured deliberation platform.

Your task: classify how a new Branch relates to its parent node.

The five Branch types are:
- clarification: sharpens or makes precise what the parent said, without adding new content
- extension: carries the idea into new territory the parent did not anticipate
- reframing: same observation, fundamentally different interpretive angle; does not contradict
- contradiction: identifies a conflict, proposes a divergent direction
- synthesis: connects two or more existing lines of thought; reconciles divergent Branches

Respond ONLY with valid JSON. No preamble, no explanation outside the JSON.

{
  "proposed_type": "<one of the five types>",
  "confidence": <0.0–1.0>,
  "explanation": "<exactly two sentences: first sentence states what the Branch does; second sentence states why that matches the proposed type>"
}"""

USER_TEMPLATE = """Parent node:
---
{parent_body}
---

New Branch:
---
{branch_body}
---

Lineage description provided by author:
{lineage_desc}

Classify the Branch type."""


def propose_branch_type(parent_body, branch_body, lineage_desc):
    """
    Call OpenAI gpt-5-mini to classify the branch type.
    Returns dict: {proposed_type, confidence, explanation}
    Returns None on any error or timeout — never raises, never blocks.
    """
    try:
        cl = _get_client()
        user_message = USER_TEMPLATE.format(
            parent_body=parent_body,
            branch_body=branch_body,
            lineage_desc=lineage_desc or "(none provided)"
        )

        response = cl.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=2048,
            timeout=15
        )

        content = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        result = json.loads(content)

        # Validate required fields
        valid_types = {"clarification", "extension", "reframing", "contradiction", "synthesis"}
        if result.get("proposed_type") not in valid_types:
            return None

        return {
            "proposed_type": result["proposed_type"],
            "confidence": float(result.get("confidence", 0.0)),
            "explanation": result.get("explanation", "")
        }

    except Exception as e:
        print(f"[LLM] Error: {e}")
        return None


LINEAGE_SYSTEM_PROMPT = """You are a lineage summariser for Groven, a structured deliberation platform.

Given a parent contribution and a new branch contribution, write a one-sentence lineage description.
The sentence should explain what the branch builds on from the parent and where it takes the argument.

Respond ONLY with the single sentence, no quotes, no preamble."""

LINEAGE_USER_TEMPLATE = """Parent contribution:
---
{parent_body}
---

New branch:
---
{branch_body}
---

Branch type: {branch_type}

Write a one-sentence lineage description."""


def generate_lineage(parent_body, branch_body, branch_type):
    """
    Auto-generate a lineage description using gpt-5-mini.
    Returns a string, or a fallback sentence on error.
    """
    try:
        cl = _get_client()
        user_message = LINEAGE_USER_TEMPLATE.format(
            parent_body=parent_body,
            branch_body=branch_body,
            branch_type=branch_type or "unknown"
        )

        response = cl.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": LINEAGE_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=2048,
            timeout=15
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[LLM] Lineage generation error: {e}")
        return "Builds on the parent contribution."
