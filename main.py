import os
from flask import Flask, render_template, request, jsonify
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
    return render_template("node.html", node=node, space=space,
                           ancestors=ancestors, children=children)


# ============================================================
# API Routes
# ============================================================

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
    title = (data.get("title") or "").strip() or None
    lineage_desc = (data.get("lineage_desc") or "").strip() or None
    branch_type = data.get("branch_type")
    llm_proposed_type = data.get("llm_proposed_type")
    llm_explanation = data.get("llm_explanation")

    # Validation
    if not space_id or not author or not body:
        return jsonify({"error": "space_id, author, and body are required"}), 400

    if not db.get_space(space_id):
        return jsonify({"error": "Space not found"}), 404

    # Determine node type
    if parent_id:
        node_type = "branch"
        if not lineage_desc:
            return jsonify({"error": "lineage_desc is required for branches"}), 400
        if not branch_type:
            return jsonify({"error": "branch_type is required for branches"}), 400
        if not db.get_node(parent_id):
            return jsonify({"error": "Parent node not found"}), 404
    else:
        node_type = "seed"
        branch_type = None

    # Calculate contested flag
    contested = 0
    if llm_proposed_type and branch_type and llm_proposed_type != branch_type:
        contested = 1

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
        contested=contested
    )

    return jsonify({
        "id": node_id,
        "node_type": node_type,
        "branch_type": branch_type,
        "contested": contested
    }), 201


@app.route("/api/llm-propose")
def api_llm_propose():
    """Get LLM type proposal for a branch."""
    parent_id = request.args.get("parent_id")
    body = request.args.get("body", "").strip()
    lineage_desc = request.args.get("lineage_desc", "").strip()

    if not parent_id or not body:
        return jsonify({"error": "parent_id and body are required"}), 400

    parent = db.get_node(parent_id)
    if not parent:
        return jsonify({"error": "Parent node not found"}), 404

    result = llm.propose_branch_type(
        parent_body=parent["body"],
        branch_body=body,
        lineage_desc=lineage_desc
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
    return jsonify(nodes)


@app.route("/api/vote", methods=["POST"])
def api_vote():
    """Cast a vote (placeholder)."""
    return jsonify({"status": "not implemented"}), 501


# ============================================================
# Admin Routes
# ============================================================

@app.route("/admin/seed")
def admin_seed():
    """Reload seed data (dev only)."""
    # Drop existing data
    import sqlite3
    conn = db.get_db()
    conn.execute("DELETE FROM nodes")
    conn.execute("DELETE FROM spaces")
    conn.commit()
    conn.close()

    seed_data.load()
    return jsonify({"status": "Seed data reloaded"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
