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
- extension: builds on and supports the parent's direction, carrying it into new territory the parent did not anticipate; does NOT raise objections or concerns about the parent
- reframing: same observation, fundamentally different interpretive angle; does not contradict
- contradiction: challenges, objects to, or undermines the parent's proposal; this includes raising concerns, objections, or practical problems that call the parent's viability into question, even if the objection introduces new considerations
- synthesis: connects two or more existing lines of thought; reconciles divergent Branches

Additionally, determine whether the Branch is asking a question rather than making
a statement. A question *requests* information, clarification, or justification
from the parent — it does not itself provide an answer. Classify the underlying
type (e.g., a question requesting clarification is type "clarification") AND set
is_question to true. If the Branch makes a statement, set is_question to false.

Respond ONLY with valid JSON. No preamble, no explanation outside the JSON.

{
  "proposed_type": "<one of the five types>",
  "is_question": <true|false>,
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
            "is_question": bool(result.get("is_question", False)),
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


TITLE_SYSTEM_PROMPT = """You are a title generator for Groven, a structured deliberation platform.

Given a parent contribution and a new branch contribution, write a short descriptive title for the branch.
The title should be concise (max 8 words) and capture the branch's main point or stance.
People will read this title in a node diagram to understand where the discussion is going.

If the branch is a question (is_question = true), the title MUST be phrased as a question
ending with a question mark. A question title directly sparks conversation — e.g.
"How long is each phase?" rather than "Clarify phased approach duration".

Respond ONLY with the title, no quotes, no preamble."""

TITLE_USER_TEMPLATE = """Parent contribution:
---
{parent_body}
---

New branch:
---
{branch_body}
---

Branch type: {branch_type}
is_question: {is_question}

Write a short descriptive title."""


def generate_title(parent_body, branch_body, branch_type, is_question=False):
    """
    Auto-generate a node title using gpt-5-mini.
    When is_question is True, the title is phrased as a question.
    Returns a string, or a fallback on error.
    """
    try:
        cl = _get_client()
        user_message = TITLE_USER_TEMPLATE.format(
            parent_body=parent_body,
            branch_body=branch_body,
            branch_type=branch_type or "unknown",
            is_question="true" if is_question else "false"
        )

        response = cl.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": TITLE_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=2048,
            timeout=15
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[LLM] Title generation error: {e}")
        return "Untitled branch"


PROPOSAL_SUMMARY_SYSTEM_PROMPT = """You summarise proposals for a deliberation platform.

Given a synthesis proposal, write a single sentence (max 30 words) that captures the core
actionable recommendation. Start with a verb. Do not add quotes or preamble."""

PROPOSAL_SUMMARY_USER_TEMPLATE = """Proposal:
---
{body}
---

Write a one-sentence summary."""


def generate_proposal_summary(body):
    """
    Summarise a synthesis proposal in one sentence using gpt-5-mini.
    Returns a string, or a truncated fallback on error.
    """
    try:
        cl = _get_client()
        user_message = PROPOSAL_SUMMARY_USER_TEMPLATE.format(body=body)

        response = cl.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": PROPOSAL_SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=512,
            timeout=10
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[LLM] Proposal summary error: {e}")
        return body[:150] + "..." if len(body) > 150 else body


RECLASSIFY_SYSTEM_PROMPT = """You are a semantic classification assistant for Groven,
a structured deliberation platform.

The author of a Branch disagrees with the initial classification and has chosen a different type.
Your task: reconsider the classification from the author's perspective and explain why the author's
chosen type is a reasonable reading.

The five Branch types are:
- clarification: sharpens or makes precise what the parent said, without adding new content
- extension: builds on and supports the parent's direction, carrying it into new territory; does NOT raise objections
- reframing: same observation, fundamentally different interpretive angle; does not contradict
- contradiction: challenges, objects to, or undermines the parent's proposal; includes raising concerns or practical problems
- synthesis: connects two or more existing lines of thought; reconciles divergent Branches

Additionally, determine whether the Branch is asking a question rather than making
a statement. A question *requests* information, clarification, or justification
from the parent — it does not itself provide an answer. Set is_question to true
if the Branch is primarily a question; false if it makes a statement.

Respond ONLY with valid JSON:
{
  "explanation": "<exactly three sentences: first sentence briefly states the original classification and why it was proposed; second sentence states that the author chose a different type; third sentence explains why the author's reading is reasonable and how the contribution should be interpreted under that type>",
  "is_question": <true|false>
}"""

RECLASSIFY_USER_TEMPLATE = """Parent node:
---
{parent_body}
---

New Branch:
---
{branch_body}
---

The LLM initially classified this as: {original_type}
Original reasoning: {original_explanation}

The author chose: {chosen_type}

Reconsider the analysis from the author's perspective."""


def reclassify(parent_body, branch_body, original_type, original_explanation, chosen_type):
    """
    Re-analyse a branch after the author overrides the classification.
    Returns dict: {explanation, lineage_desc, suggested_title}
    Returns None on error.
    """
    try:
        cl = _get_client()
        user_message = RECLASSIFY_USER_TEMPLATE.format(
            parent_body=parent_body,
            branch_body=branch_body,
            original_type=original_type or "unknown",
            original_explanation=original_explanation or "(none)",
            chosen_type=chosen_type
        )

        response = cl.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": RECLASSIFY_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=2048,
            timeout=15
        )

        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        return json.loads(content)

    except Exception as e:
        print(f"[LLM] Reclassify error: {e}")
        return None


SYNTHESIS_SUGGEST_SYSTEM_PROMPT = """You are a synthesis advisor for Groven, a structured deliberation platform.

Your task: analyse a complete discussion tree and suggest 1-3 opportunities where
a synthesis node could connect divergent or complementary threads.

A synthesis connects two or more existing lines of thought, reconciling or
integrating divergent branches into a coherent position.

Your response MUST have two parts, in this exact order:

PART 1 — Analysis (wrapped in <analysis> tags):
Think step by step. Map the tree structure, identify which threads diverge or
complement each other. For each pair or cluster of threads, ask: can these be
reconciled into a single actionable proposal? Write 3-6 sentences of analysis.
This analysis will be shown to the user in real time.

PART 2 — JSON (after the closing </analysis> tag):
Output ONLY valid JSON with your suggestions. No markdown fences.

Each suggestion must:
1. Identify a primary parent node (the node it most directly responds to)
2. Identify 1-3 other referenced nodes whose ideas it integrates
3. Propose a body text for the synthesis (2-4 sentences). IMPORTANT: the body must
   synthesize the referenced threads into a clear, actionable proposal — a concrete
   position or recommendation that participants can support or oppose. Do not merely
   summarise the threads; state what should be done.
4. Propose a short title (max 8 words) that captures the proposal
5. Explain why this synthesis makes sense (1-2 sentences)

Only suggest syntheses where genuinely different perspectives can be connected.
Do NOT suggest syntheses between nodes that already agree.
Do NOT suggest a synthesis if one already exists that covers the same connection.

Example response format:
<analysis>
The discussion splits into three threads...
</analysis>
{
  "suggestions": [
    {
      "parent_id": "<id of the primary parent node>",
      "referenced_ids": ["<id1>", "<id2>"],
      "title": "<max 8 words>",
      "body": "<2-4 sentences synthesising the referenced threads>",
      "reasoning": "<1-2 sentences explaining why this synthesis is valuable>"
    }
  ]
}"""

SYNTHESIS_SUGGEST_USER_TEMPLATE = """Discussion space: {space_title}

Here is the complete discussion tree. Each node has an id, parent_id (null for seeds),
branch_type, author, title, and body.

{nodes_json}

Existing synthesis nodes (do not re-suggest these connections):
{existing_syntheses}

Suggest 1-3 synthesis opportunities."""


def _build_synthesis_prompt(space_title, nodes):
    """Build the prompt components for synthesis suggestion (shared by sync and streaming)."""
    node_descriptions = []
    existing_syntheses = []
    valid_ids = {n["id"] for n in nodes}

    for n in nodes:
        body = n["body"][:300] + "..." if len(n["body"]) > 300 else n["body"]
        node_descriptions.append({
            "id": n["id"],
            "parent_id": n["parent_id"],
            "branch_type": n["branch_type"] or "seed",
            "author": n["author"],
            "title": n["title"] or "(untitled)",
            "body": body
        })
        if n["branch_type"] == "synthesis":
            existing_syntheses.append(
                f"- {n['title']} (id: {n['id']}, connects to parent {n['parent_id']})"
            )

    nodes_json = json.dumps(node_descriptions, indent=2)
    syntheses_text = "\n".join(existing_syntheses) if existing_syntheses else "(none yet)"

    user_message = SYNTHESIS_SUGGEST_USER_TEMPLATE.format(
        space_title=space_title,
        nodes_json=nodes_json,
        existing_syntheses=syntheses_text
    )

    return user_message, valid_ids


def _parse_synthesis_response(content, valid_ids):
    """Parse and validate the LLM's synthesis JSON response."""
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

    result = json.loads(content)
    suggestions = result.get("suggestions", [])

    validated = []
    for s in suggestions:
        if s.get("parent_id") not in valid_ids:
            continue
        s["referenced_ids"] = [rid for rid in s.get("referenced_ids", []) if rid in valid_ids]
        validated.append(s)

    return validated if validated else None


def suggest_synthesis(space_title, nodes):
    """
    Analyse all nodes in a space and suggest 1-3 synthesis opportunities.
    Uses gpt-5.2 with reasoning enabled for deeper analytical thinking.
    Returns list of suggestion dicts, or None on error.
    """
    try:
        cl = _get_client()
        user_message, valid_ids = _build_synthesis_prompt(space_title, nodes)

        response = cl.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": SYNTHESIS_SUGGEST_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=4096,
            reasoning_effort="low",
            timeout=30
        )

        content = response.choices[0].message.content.strip()
        # Strip <analysis> section if present
        if "</analysis>" in content:
            content = content.split("</analysis>", 1)[1].strip()
        return _parse_synthesis_response(content, valid_ids)

    except Exception as e:
        print(f"[LLM] Synthesis suggestion error: {e}")
        return None


def suggest_synthesis_stream(space_title, nodes):
    """
    Streaming version of suggest_synthesis().
    The prompt asks the model to output <analysis>...</analysis> first (streamed to
    the user in real-time), then JSON suggestions.
    Yields (event_type, data) tuples:
      ("reasoning", "token text...")   — analysis text chunks as they arrive
      ("done", [suggestions])          — validated suggestions list
      ("error", "message")             — on failure
    """
    try:
        cl = _get_client()
        user_message, valid_ids = _build_synthesis_prompt(space_title, nodes)

        stream = cl.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": SYNTHESIS_SUGGEST_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=4096,
            reasoning_effort="low",
            timeout=60,
            stream=True
        )

        full_content = ""
        analysis_yielded = 0  # how many chars of the analysis we've yielded so far

        for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if not delta.content:
                continue

            full_content += delta.content

            # Stream the <analysis> section to the user
            if "<analysis>" in full_content and "</analysis>" not in full_content:
                # We're inside the analysis block — yield new text
                analysis_text = full_content.split("<analysis>", 1)[1]
                new_text = analysis_text[analysis_yielded:]
                if new_text:
                    yield ("reasoning", new_text)
                    analysis_yielded += len(new_text)

        if not full_content:
            yield ("error", "No response content from LLM")
            return

        # Extract JSON after </analysis>
        if "</analysis>" in full_content:
            json_part = full_content.split("</analysis>", 1)[1].strip()
        else:
            json_part = full_content

        validated = _parse_synthesis_response(json_part, valid_ids)
        if validated:
            yield ("done", validated)
        else:
            yield ("error", "No valid synthesis suggestions found")

    except Exception as e:
        print(f"[LLM] Synthesis stream error: {e}")
        yield ("error", str(e))
