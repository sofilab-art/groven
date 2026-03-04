import sqlite3
import uuid
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "groven.db")


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS spaces (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT,
            status      TEXT DEFAULT 'open',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS nodes (
            id                TEXT PRIMARY KEY,
            space_id          TEXT NOT NULL REFERENCES spaces(id),
            parent_id         TEXT REFERENCES nodes(id),
            node_type         TEXT NOT NULL DEFAULT 'seed',
            branch_type       TEXT,
            author            TEXT NOT NULL,
            title             TEXT,
            body              TEXT NOT NULL,
            lineage_desc      TEXT,
            llm_proposed_type TEXT,
            llm_explanation   TEXT,
            contested         BOOLEAN DEFAULT 0,
            created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS votes (
            id          TEXT PRIMARY KEY,
            space_id    TEXT NOT NULL REFERENCES spaces(id),
            author      TEXT NOT NULL,
            choice      TEXT NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


# --- Spaces ---

def list_spaces():
    """Return all spaces with node counts."""
    conn = get_db()
    rows = conn.execute("""
        SELECT s.*, COUNT(n.id) as node_count
        FROM spaces s
        LEFT JOIN nodes n ON n.space_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_space(space_id):
    """Return a single space by id."""
    conn = get_db()
    row = conn.execute("SELECT * FROM spaces WHERE id = ?", (space_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_space(id, title, description=None, status="open"):
    """Create a new space."""
    conn = get_db()
    conn.execute(
        "INSERT INTO spaces (id, title, description, status) VALUES (?, ?, ?, ?)",
        (id, title, description, status)
    )
    conn.commit()
    conn.close()


# --- Nodes ---

def list_nodes(space_id):
    """Return all nodes in a space, ordered by creation time."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM nodes WHERE space_id = ? ORDER BY created_at ASC",
        (space_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_node(node_id):
    """Return a single node by id."""
    conn = get_db()
    row = conn.execute("SELECT * FROM nodes WHERE id = ?", (node_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_node_children(node_id):
    """Return direct children of a node."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM nodes WHERE parent_id = ? ORDER BY created_at ASC",
        (node_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_node_ancestors(node_id):
    """Return the ancestor chain from root to this node (inclusive)."""
    ancestors = []
    current_id = node_id
    conn = get_db()
    while current_id:
        row = conn.execute("SELECT * FROM nodes WHERE id = ?", (current_id,)).fetchone()
        if row:
            ancestors.append(dict(row))
            current_id = row["parent_id"]
        else:
            break
    conn.close()
    ancestors.reverse()
    return ancestors


def create_node(space_id, author, body, parent_id=None, node_type="seed",
                branch_type=None, title=None, lineage_desc=None,
                llm_proposed_type=None, llm_explanation=None, contested=0, id=None):
    """Create a new node and return its id."""
    node_id = id or str(uuid.uuid4())
    conn = get_db()
    conn.execute("""
        INSERT INTO nodes (id, space_id, parent_id, node_type, branch_type,
                           author, title, body, lineage_desc,
                           llm_proposed_type, llm_explanation, contested)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (node_id, space_id, parent_id, node_type, branch_type,
          author, title, body, lineage_desc,
          llm_proposed_type, llm_explanation, contested))
    conn.commit()
    conn.close()
    return node_id


def get_tree(space_id):
    """Return all nodes in a space as a list of dicts for D3 visualization."""
    conn = get_db()
    rows = conn.execute("""
        SELECT id, space_id, parent_id, node_type, branch_type,
               author, title, body, lineage_desc,
               llm_proposed_type, llm_explanation, contested, created_at
        FROM nodes
        WHERE space_id = ?
        ORDER BY created_at ASC
    """, (space_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def spaces_empty():
    """Check if the spaces table has any rows."""
    conn = get_db()
    row = conn.execute("SELECT COUNT(*) as cnt FROM spaces").fetchone()
    conn.close()
    return row["cnt"] == 0
