import os
import re
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, render_template, request, jsonify, redirect, Response
from dotenv import load_dotenv

load_dotenv()

import db
import llm
import seed_data

app = Flask(__name__)


# --- Initialize DB and seed data on startup ---
db.init_db()
if db.spaces_empty():
    seed_data.load()
    print("[Groven] Seed data loaded.")


# ============================================================
# Page Routes
# ============================================================

@app.route("/")
def index():
    """Forest overview — all spaces."""
    spaces = db.list_spaces()
    return render_template("index.html", spaces=spaces)


@app.route("/space/<space_id>")
def space_view(space_id):
    """Single space with graph + contribution form."""
    space = db.get_space(space_id)
    if not space:
        return "Space not found", 404
    nodes = db.list_nodes(space_id)
    synthesis_nodes = db.get_synthesis_nodes(space_id) if space["status"] == "ready" else []
    # Sort by net support (support - oppose) descending so leading proposal is first
    synthesis_nodes.sort(key=lambda s: (s.get("vote_support", 0) - s.get("vote_oppose", 0)), reverse=True)
    return render_template("space.html", space=space, nodes=nodes,
                           synthesis_nodes=synthesis_nodes)


@app.route("/node/<node_id>")
def node_view(node_id):
    """Single node detail view."""
    node = db.get_node(node_id)
    if not node:
        return "Node not found", 404
    space = db.get_space(node["space_id"])
    ancestors = db.get_node_ancestors(node_id)
    children = db.get_node_children(node_id)
    votes = db.get_votes_for_node(node_id) if node["branch_type"] == "synthesis" else []
    return render_template("node.html", node=node, space=space,
                           ancestors=ancestors, children=children, votes=votes)


# ============================================================
# API Routes
# ============================================================

@app.route("/api/space", methods=["POST"])
def api_create_space():
    """Create a new deliberation space with its first seed."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    title = (data.get("title") or "").strip()
    author = (data.get("author") or "").strip()
    seed_title = (data.get("seed_title") or "").strip()
    seed_body = (data.get("seed_body") or "").strip()

    if not title or not author or not seed_title or not seed_body:
        return jsonify({"error": "Topic, author, seed title, and contribution are required"}), 400

    # Generate slug from title
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:60]
    if not slug:
        slug = "space"

    # Ensure uniqueness
    base_slug = slug
    counter = 2
    while db.get_space(slug):
        slug = f"{base_slug}-{counter}"
        counter += 1

    db.create_space(id=slug, title=title)
    db.create_node(
        space_id=slug,
        author=author,
        title=seed_title,
        body=seed_body,
        node_type="seed"
    )
    return jsonify({"id": slug}), 201


@app.route("/api/node", methods=["POST"])
def api_create_node():
    """Create a new node (seed or branch)."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    space_id = data.get("space_id")
    author = (data.get("author") or "").strip()
    body = (data.get("body") or "").strip()
    parent_id = data.get("parent_id")
    title = (data.get("title") or "").strip()

    # Validation
    if not space_id or not author or not title or not body:
        return jsonify({"error": "space_id, author, title, and body are required"}), 400

    space = db.get_space(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if space["status"] != "open":
        return jsonify({"error": "This space is closed for new contributions"}), 403

    # Determine node type
    branch_type = None
    llm_proposed_type = None
    llm_explanation = None
    lineage_desc = None
    contested = 0
    is_question = 0

    if parent_id:
        node_type = "branch"
        parent_node = db.get_node(parent_id)
        if not parent_node:
            return jsonify({"error": "Parent node not found"}), 404

        # Check if client already provides reviewed LLM data (from review modal)
        reviewed_branch_type = (data.get("branch_type") or "").strip() or None
        reviewed_lineage = (data.get("lineage_desc") or "").strip() or None
        reviewed_llm_proposed = (data.get("llm_proposed_type") or "").strip() or None
        reviewed_llm_explanation = (data.get("llm_explanation") or "").strip() or None

        if reviewed_branch_type:
            # User already reviewed via modal
            branch_type = reviewed_branch_type
            llm_proposed_type = reviewed_llm_proposed
            llm_explanation = reviewed_llm_explanation
            lineage_desc = reviewed_lineage
            contested = 1 if (reviewed_llm_proposed and branch_type != llm_proposed_type) else 0
            is_question = 1 if data.get("is_question") else 0
        else:
            # Fallback: auto-classify (for direct API calls without modal)
            proposal = llm.propose_branch_type(
                parent_body=parent_node["body"],
                branch_body=body,
                lineage_desc=None
            )
            if proposal:
                branch_type = proposal["proposed_type"]
                llm_proposed_type = proposal["proposed_type"]
                llm_explanation = proposal.get("explanation")
                is_question = 1 if proposal.get("is_question") else 0
            else:
                branch_type = "extension"
                llm_proposed_type = None

            lineage_desc = llm.generate_lineage(
                parent_body=parent_node["body"],
                branch_body=body,
                branch_type=branch_type
            )
    else:
        node_type = "seed"

    proposal_summary = (data.get("proposal_summary") or "").strip() or None

    node_id = db.create_node(
        space_id=space_id,
        author=author,
        body=body,
        parent_id=parent_id,
        node_type=node_type,
        branch_type=branch_type,
        title=title,
        lineage_desc=lineage_desc,
        llm_proposed_type=llm_proposed_type,
        llm_explanation=llm_explanation,
        contested=contested,
        proposal_summary=proposal_summary,
        is_question=is_question
    )

    return jsonify({
        "id": node_id,
        "node_type": node_type,
        "branch_type": branch_type,
        "contested": contested,
        "is_question": bool(is_question)
    }), 201


@app.route("/api/node/preview", methods=["POST"])
def api_preview_node():
    """Run LLM analysis on a branch — streamed via SSE.

    Events:
      classification  — {proposed_type, is_question, confidence, explanation}
      title           — {suggested_title}
      lineage         — {lineage_desc}
      done            — empty (signals all fields are sent)
      error           — {error}
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    body = (data.get("body") or "").strip()
    parent_id = data.get("parent_id")

    if not parent_id or not body:
        return jsonify({"error": "parent_id and body are required"}), 400

    parent_node = db.get_node(parent_id)
    if not parent_node:
        return jsonify({"error": "Parent node not found"}), 404

    parent_body = parent_node["body"]

    # Werkzeug buffers ~4KB before flushing; pad SSE events to force flush
    PAD = ":" + " " * 4096 + "\n"

    def generate():
        # Step 1: Classification (must complete first — title & lineage depend on it)
        proposal = llm.propose_branch_type(
            parent_body=parent_body,
            branch_body=body,
            lineage_desc=None
        )

        proposed_type = None
        confidence = None
        explanation = None
        is_question = False
        if proposal:
            proposed_type = proposal["proposed_type"]
            confidence = proposal.get("confidence")
            explanation = proposal.get("explanation")
            is_question = proposal.get("is_question", False)

        yield f"event: classification\ndata: {json.dumps({'proposed_type': proposed_type, 'is_question': is_question, 'confidence': confidence, 'explanation': explanation})}\n\n" + PAD

        # Step 2: Lineage + Title in parallel (both depend on classification, independent of each other)
        branch_type = proposed_type or "extension"

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_lineage = executor.submit(
                llm.generate_lineage, parent_body, body, branch_type
            )
            future_title = executor.submit(
                llm.generate_title, parent_body, body, branch_type, is_question
            )

            for future in as_completed([future_lineage, future_title]):
                try:
                    result = future.result()
                    if future is future_title:
                        yield f"event: title\ndata: {json.dumps({'suggested_title': result})}\n\n" + PAD
                    else:
                        yield f"event: lineage\ndata: {json.dumps({'lineage_desc': result})}\n\n" + PAD
                except Exception as e:
                    print(f"[Preview] Parallel task error: {e}")

        yield f"event: done\ndata: {json.dumps({})}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@app.route("/api/node/reclassify", methods=["POST"])
def api_reclassify_node():
    """Re-analyse a branch after the author overrides the classification."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    parent_id = data.get("parent_id")
    body = (data.get("body") or "").strip()
    chosen_type = (data.get("chosen_type") or "").strip()
    original_type = data.get("original_type")
    original_explanation = data.get("original_explanation")

    if not parent_id or not body or not chosen_type:
        return jsonify({"error": "parent_id, body, and chosen_type are required"}), 400

    parent_node = db.get_node(parent_id)
    if not parent_node:
        return jsonify({"error": "Parent node not found"}), 404

    result = llm.reclassify(
        parent_body=parent_node["body"],
        branch_body=body,
        original_type=original_type,
        original_explanation=original_explanation,
        chosen_type=chosen_type
    )

    if result:
        return jsonify({
            "explanation": result.get("explanation", ""),
            "is_question": result.get("is_question", False),
            "lineage_desc": result.get("lineage_desc", ""),
            "suggested_title": result.get("suggested_title", "")
        })
    else:
        return jsonify({
            "explanation": "",
            "is_question": False,
            "lineage_desc": "",
            "suggested_title": ""
        })


@app.route("/api/node/regenerate-text", methods=["POST"])
def api_regenerate_text():
    """Regenerate title and lineage description for a new branch type."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    parent_id = data.get("parent_id")
    body = (data.get("body") or "").strip()
    branch_type = (data.get("branch_type") or "").strip()
    is_question = data.get("is_question", False)

    if not parent_id or not body or not branch_type:
        return jsonify({"error": "parent_id, body, and branch_type are required"}), 400

    parent_node = db.get_node(parent_id)
    if not parent_node:
        return jsonify({"error": "Parent node not found"}), 404

    parent_body = parent_node["body"]

    # Generate title and lineage in parallel
    with ThreadPoolExecutor(max_workers=2) as pool:
        title_future = pool.submit(llm.generate_title, parent_body, body, branch_type, is_question)
        lineage_future = pool.submit(llm.generate_lineage, parent_body, body, branch_type)

    return jsonify({
        "suggested_title": title_future.result(),
        "lineage_desc": lineage_future.result()
    })


# --- Governance transitions ---------------------------------------------------

@app.route("/api/space/<space_id>/transition", methods=["POST"])
def api_space_transition(space_id):
    """Transition a space to Ready status. Streams a discussion summary via SSE."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    target = (data.get("target_status") or "").strip()
    author = (data.get("author") or "").strip()

    if target != "ready":
        return jsonify({"error": "Only open → ready transition is supported"}), 400
    if not author:
        return jsonify({"error": "author is required"}), 400

    space = db.get_space(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404
    if space["status"] != "open":
        return jsonify({"error": "Space is not open"}), 409

    # Set status immediately so new contributions are blocked
    db.update_space_status(space_id, "ready")

    nodes = db.get_tree(space_id)
    tallies = db.get_vote_tallies(space_id)

    def stream():
        full_summary = ""
        yield f"data: {json.dumps({'event': 'status', 'status': 'ready'})}\n\n"

        for event_type, payload in llm.generate_discussion_summary_stream(
            space["title"], nodes, tallies
        ):
            if event_type == "chunk":
                full_summary += payload
                yield f"data: {json.dumps({'event': 'chunk', 'text': payload})}\n\n"
            elif event_type == "done":
                full_summary = payload
                db.update_space_summary(space_id, full_summary)
                yield f"data: {json.dumps({'event': 'done', 'summary': full_summary})}\n\n"
            elif event_type == "error":
                yield f"data: {json.dumps({'event': 'error', 'message': payload})}\n\n"

        # If streaming completed without a done event, store whatever we got
        if full_summary and not db.get_space(space_id).get("discussion_summary"):
            db.update_space_summary(space_id, full_summary)

    return Response(stream(), mimetype="text/event-stream",
                    headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})


@app.route("/api/space/<space_id>/decide", methods=["POST"])
def api_decide_space(space_id):
    """Record a decision on a ready space. Creates a Decision node."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    selected_node_id = (data.get("selected_node_id") or "").strip()
    author = (data.get("author") or "").strip()
    justification = (data.get("justification") or "").strip()

    if not selected_node_id or not author or not justification:
        return jsonify({"error": "selected_node_id, author, and justification are required"}), 400

    space = db.get_space(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404
    if space["status"] != "ready":
        return jsonify({"error": "Space must be in ready status to record a decision"}), 409

    # Validate the selected node is a synthesis in this space
    selected = db.get_node(selected_node_id)
    if not selected or selected["space_id"] != space_id or selected["branch_type"] != "synthesis":
        return jsonify({"error": "Selected node must be a synthesis proposal in this space"}), 400

    # Snapshot votes
    votes = db.get_votes_for_node(selected_node_id)
    support = sum(1 for v in votes if v["position"] == "support")
    oppose = sum(1 for v in votes if v["position"] == "oppose")
    minority = [{"author": v["author"], "position": v["position"],
                 "justification": v["justification"]}
                for v in votes if v["position"] == "oppose"]

    decision_meta = json.dumps({
        "resolved_node_id": selected_node_id,
        "vote_breakdown": {"support": support, "oppose": oppose},
        "votes": [{"author": v["author"], "position": v["position"],
                    "justification": v["justification"]} for v in votes],
        "minority_positions": minority
    })

    # Create the Decision node
    decision_id = db.create_node(
        space_id=space_id,
        parent_id=selected_node_id,
        node_type="decision",
        author=author,
        title="Decision: " + (selected.get("title") or "Accepted proposal"),
        body=justification,
        proposal_summary=selected.get("proposal_summary") or "",
        decision_meta=decision_meta
    )

    # Update space status
    db.update_space_status(space_id, "decided")

    return jsonify({"id": decision_id, "status": "decided"}), 201


@app.route("/api/llm-propose")
def api_llm_propose():
    """Get LLM type proposal for a branch."""
    parent_id = request.args.get("parent_id")
    body = request.args.get("body", "").strip()

    if not parent_id or not body:
        return jsonify({"error": "parent_id and body are required"}), 400

    parent = db.get_node(parent_id)
    if not parent:
        return jsonify({"error": "Parent node not found"}), 404

    result = llm.propose_branch_type(
        parent_body=parent["body"],
        branch_body=body,
        lineage_desc=None
    )

    if result is None:
        return jsonify({"error": "LLM unavailable", "proposed_type": None}), 200

    return jsonify(result)


@app.route("/api/tree/<space_id>")
def api_tree(space_id):
    """Return all nodes in a space as JSON for D3."""
    if not db.get_space(space_id):
        return jsonify({"error": "Space not found"}), 404
    nodes = db.get_tree(space_id)
    tallies = db.get_vote_tallies(space_id)
    for node in nodes:
        if node["id"] in tallies:
            node["vote_support"] = tallies[node["id"]]["support"]
            node["vote_oppose"] = tallies[node["id"]]["oppose"]
    return jsonify(nodes)


def _enrich_suggestions(suggestions, node_map):
    """Enrich raw suggestions with node titles, authors, and proposal summaries."""
    enriched = []
    for s in suggestions:
        parent = node_map.get(s["parent_id"])
        refs = [node_map.get(rid) for rid in s.get("referenced_ids", []) if node_map.get(rid)]

        summary = llm.generate_proposal_summary(s["body"])

        enriched.append({
            "parent_id": s["parent_id"],
            "parent_title": parent["title"] if parent else "Unknown",
            "parent_author": parent["author"] if parent else "Unknown",
            "referenced_ids": s.get("referenced_ids", []),
            "referenced_nodes": [
                {"id": r["id"], "title": r["title"], "author": r["author"]}
                for r in refs
            ],
            "title": s["title"],
            "body": s["body"],
            "reasoning": s["reasoning"],
            "proposal_summary": summary
        })
    return enriched


@app.route("/api/space/<space_id>/suggest-synthesis", methods=["POST"])
def api_suggest_synthesis(space_id):
    """Ask the LLM to suggest synthesis opportunities for a space (SSE stream)."""
    space = db.get_space(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if space["status"] != "open":
        return jsonify({"error": "This space is closed for new contributions"}), 403

    nodes = db.get_tree(space_id)
    if len(nodes) < 3:
        return jsonify({"error": "Need at least 3 contributions before suggesting syntheses"}), 400

    node_map = {n["id"]: n for n in nodes}

    # Werkzeug buffers ~4KB before flushing; pad SSE events to force flush
    PAD = ":" + " " * 4096 + "\n"

    def generate():
        suggestions = None
        for event_type, data in llm.suggest_synthesis_stream(space["title"], nodes):
            if event_type == "reasoning":
                yield f"event: reasoning\ndata: {json.dumps(data)}\n\n" + PAD
            elif event_type == "done":
                suggestions = data
            elif event_type == "error":
                yield f"event: error\ndata: {json.dumps({'error': data})}\n\n" + PAD
                return

        if not suggestions:
            yield f"event: error\ndata: {json.dumps({'error': 'No suggestions generated'})}\n\n" + PAD
            return

        yield f"event: status\ndata: {json.dumps('Generating proposal summaries...')}\n\n" + PAD

        enriched = _enrich_suggestions(suggestions, node_map)
        yield f"event: suggestions\ndata: {json.dumps({'suggestions': enriched})}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@app.route("/api/vote", methods=["POST"])
def api_vote():
    """Cast a Support/Oppose vote on a synthesis node."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    node_id = (data.get("node_id") or "").strip()
    author = (data.get("author") or "").strip()
    position = (data.get("position") or "").strip()
    justification = (data.get("justification") or "").strip()

    if not node_id or not author or not position or not justification:
        return jsonify({"error": "node_id, author, position, and justification are required"}), 400

    if position not in ("support", "oppose"):
        return jsonify({"error": "position must be 'support' or 'oppose'"}), 400

    node = db.get_node(node_id)
    if not node:
        return jsonify({"error": "Node not found"}), 404
    if node["branch_type"] != "synthesis":
        return jsonify({"error": "Only synthesis nodes (proposals) can be voted on"}), 400

    vote_id = db.create_vote(node_id, author, position, justification)
    return jsonify({"id": vote_id, "position": position, "justification": justification}), 201


@app.route("/api/votes/<node_id>")
def api_get_votes(node_id):
    """Return all votes for a node."""
    node = db.get_node(node_id)
    if not node:
        return jsonify({"error": "Node not found"}), 404
    votes = db.get_votes_for_node(node_id)
    return jsonify(votes)


# ============================================================
# Admin Routes
# ============================================================

@app.route("/admin/seed")
def admin_seed():
    """Reload seed data (dev only)."""
    # Drop existing data
    import sqlite3
    conn = db.get_db()
    conn.execute("DELETE FROM votes")
    conn.execute("DELETE FROM nodes")
    conn.execute("DELETE FROM spaces")
    conn.commit()
    conn.close()

    seed_data.load()
    return jsonify({"status": "Seed data reloaded"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
