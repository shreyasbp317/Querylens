"""
QueryLens — Natural Language SQL Builder
Flask application entry point.
"""

import json
import time
import random
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session

from mock_data import MOCK_SCHEMAS, get_mock_history, get_mock_saved_queries, MOCK_QUERY_RESULTS
from query_engine import generate_sql, get_result_set

app = Flask(__name__)
app.secret_key = "querylens-secret-key-2025"


def get_history():
    if "history" not in session:
        history = get_mock_history()
        for item in history:
            item["timestamp"] = item["timestamp"].isoformat()
        session["history"] = history
    return session["history"]


def get_saved():
    if "saved" not in session:
        saved = get_mock_saved_queries()
        for item in saved:
            item["createdAt"] = item["createdAt"].isoformat()
        session["saved"] = saved
    return session["saved"]


def time_ago(iso_str):
    dt = datetime.fromisoformat(iso_str)
    seconds = int((datetime.now() - dt).total_seconds())
    if seconds < 60:
        return f"{seconds}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    return f"{hours // 24}d ago"


def format_date(iso_str):
    dt = datetime.fromisoformat(iso_str)
    return dt.strftime("%b %d, %Y")


def format_row_count(n):
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n // 1_000}K"
    return str(n)


app.jinja_env.globals.update(
    time_ago=time_ago,
    format_date=format_date,
    format_row_count=format_row_count,
)


@app.route("/")
def index():
    history = get_history()
    saved = get_saved()
    success_items = [h for h in history if h["status"] == "success"]
    success_count = len(success_items)
    avg_exec = round(sum(h["executionTime"] for h in success_items) / success_count) if success_count else 0
    return render_template(
        "base.html",
        active_tab="query",
        schemas=MOCK_SCHEMAS,
        history=history,
        saved=saved,
        success_count=success_count,
        avg_exec=avg_exec,
    )


@app.route("/api/query", methods=["POST"])
def api_query():
    data = request.get_json()
    nl = data.get("naturalLanguage", "").strip()
    if not nl:
        return jsonify({"error": "Query cannot be empty"}), 400
    sql = generate_sql(nl)
    time.sleep(1.2 + random.random() * 0.9)
    exec_time = random.randint(150, 600)
    result_set = get_result_set(sql)
    history = get_history()
    new_item = {
        "id": str(int(time.time() * 1000)),
        "naturalLanguage": nl,
        "sql": sql,
        "timestamp": datetime.now().isoformat(),
        "executionTime": exec_time,
        "rowCount": len(result_set["rows"]),
        "status": "success",
    }
    history.insert(0, new_item)
    session["history"] = history
    session.modified = True
    return jsonify({
        "sql": sql,
        "columns": result_set["columns"],
        "rows": result_set["rows"],
        "rowCount": len(result_set["rows"]),
        "executionTime": exec_time,
    })


@app.route("/api/save", methods=["POST"])
def api_save():
    data = request.get_json()
    name = data.get("name", "").strip()
    nl = data.get("naturalLanguage", "").strip()
    sql = data.get("sql", "").strip()
    tags = data.get("tags", [])
    if not name or not sql:
        return jsonify({"error": "Name and SQL required"}), 400
    saved = get_saved()
    new_item = {
        "id": f"s{int(time.time() * 1000)}",
        "name": name,
        "naturalLanguage": nl,
        "sql": sql,
        "createdAt": datetime.now().isoformat(),
        "tags": tags,
    }
    saved.insert(0, new_item)
    session["saved"] = saved
    session.modified = True
    return jsonify({"success": True, "query": new_item})


@app.route("/api/history/<item_id>", methods=["DELETE"])
def api_delete_history(item_id):
    history = get_history()
    session["history"] = [h for h in history if h["id"] != item_id]
    session.modified = True
    return jsonify({"success": True})


@app.route("/api/saved/<item_id>", methods=["DELETE"])
def api_delete_saved(item_id):
    saved = get_saved()
    session["saved"] = [s for s in saved if s["id"] != item_id]
    session.modified = True
    return jsonify({"success": True})


@app.route("/api/history", methods=["GET"])
def api_get_history():
    return jsonify(get_history())


@app.route("/api/saved", methods=["GET"])
def api_get_saved():
    return jsonify(get_saved())


@app.route("/api/schemas", methods=["GET"])
def api_get_schemas():
    return jsonify(MOCK_SCHEMAS)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
