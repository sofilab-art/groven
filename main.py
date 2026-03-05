import os
import re
from flask import Flask, render_template, request, jsonify, redirect
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
    return render_template("space.html", space=space, nodes=nodes)


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

    if not db.get_space(space_id):
        return jsonify({"error": "Space not found"}), 404

    # Determine node type
    branch_type = None
    llm_proposed_type = None
    llm_explanation = None
    lineage_desc = None
    contested = 0

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
        proposal_summary=proposal_summary
    )

    return jsonify({
        "id": node_id,
        "node_type": node_type,
        "branch_type": branch_type,
        "contested": contested
    }), 201


@app.route("/api/node/preview", methods=["POST"])
def api_preview_node():
    """Run LLM analysis on a branch without saving."""
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

    proposal = llm.propose_branch_type(
        parent_body=parent_node["body"],
        branch_body=body,
        lineage_desc=None
    )

    proposed_type = None
    confidence = None
    explanation = None
    if proposal:
        proposed_type = proposal["proposed_type"]
        confidence = proposal.get("confidence")
        explanation = proposal.get("explanation")

    lineage_desc = llm.generate_lineage(
        parent_body=parent_node["body"],
        branch_body=body,
        branch_type=proposed_type or "extension"
    )

    suggested_title = llm.generate_title(
        parent_body=parent_node["body"],
        branch_body=body,
        branch_type=proposed_type or "extension"
    )

    return jsonify({
        "proposed_type": proposed_type,
        "confidence": confidence,
        "explanation": explanation,
        "lineage_desc": lineage_desc,
        "suggested_title": suggested_title
    })


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
            "lineage_desc": result.get("lineage_desc", ""),
            "suggested_title": result.get("suggested_title", "")
        })
    else:
        return jsonify({
            "explanation": "",
            "lineage_desc": "",
            "suggested_title": ""
        })


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


@app.route("/api/space/<space_id>/suggest-synthesis", methods=["POST"])
def api_suggest_synthesis(space_id):
    """Ask the LLM to suggest synthesis opportunities for a space."""
    space = db.get_space(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    nodes = db.get_tree(space_id)
    if len(nodes) < 3:
        return jsonify({"error": "Need at least 3 contributions before suggesting syntheses"}), 400

    suggestions = llm.suggest_synthesis(space["title"], nodes)
    if suggestions is None:
        return jsonify({"error": "LLM unavailable. Please try again."}), 503

    # Enrich suggestions with node titles for display
    node_map = {n["id"]: n for n in nodes}
    enriched = []
    for s in suggestions:
        parent = node_map.get(s["parent_id"])
        refs = [node_map.get(rid) for rid in s.get("referenced_ids", []) if node_map.get(rid)]

        # Generate a one-sentence proposal summary
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

    return jsonify({"suggestions": enriched})


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
