"""
Query engine for QueryLens — converts natural language to SQL using keyword matching
and returns simulated result sets.
"""

import random
import time
from mock_data import MOCK_QUERY_RESULTS

# ─── SQL Templates ───────────────────────────────────────────────────────────

SQL_TEMPLATES = {
    "last 30 days": (
        "SELECT id, email, username, created_at, is_active\n"
        "FROM users\n"
        "WHERE created_at >= NOW() - INTERVAL '30 days'\n"
        "ORDER BY created_at DESC;"
    ),
    "best-selling": (
        "SELECT p.name, p.sku,\n"
        "  SUM(oi.quantity) AS total_units,\n"
        "  SUM(oi.quantity * oi.unit_price) AS total_revenue\n"
        "FROM products p\n"
        "JOIN order_items oi ON p.id = oi.product_id\n"
        "JOIN orders o ON oi.order_id = o.id\n"
        "WHERE o.status = 'completed'\n"
        "GROUP BY p.id, p.name, p.sku\n"
        "ORDER BY total_revenue DESC\n"
        "LIMIT 10;"
    ),
    "top product": (
        "SELECT p.name, p.sku,\n"
        "  SUM(oi.quantity) AS total_units,\n"
        "  SUM(oi.quantity * oi.unit_price) AS total_revenue\n"
        "FROM products p\n"
        "JOIN order_items oi ON p.id = oi.product_id\n"
        "JOIN orders o ON oi.order_id = o.id\n"
        "WHERE o.status = 'completed'\n"
        "GROUP BY p.id, p.name, p.sku\n"
        "ORDER BY total_revenue DESC\n"
        "LIMIT 10;"
    ),
    "revenue": (
        "SELECT DATE_TRUNC('month', o.created_at) AS month,\n"
        "  SUM(o.total_amount) AS revenue,\n"
        "  COUNT(o.id) AS order_count\n"
        "FROM orders o\n"
        "WHERE o.status = 'completed'\n"
        "  AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW())\n"
        "GROUP BY month\n"
        "ORDER BY month;"
    ),
    "lifetime": (
        "SELECT u.id, u.email, u.username,\n"
        "  pl.name AS plan_name,\n"
        "  COUNT(o.id) AS total_orders,\n"
        "  SUM(o.total_amount) AS lifetime_value\n"
        "FROM users u\n"
        "JOIN orders o ON u.id = o.user_id\n"
        "JOIN plans pl ON u.plan_id = pl.id\n"
        "WHERE o.status = 'completed'\n"
        "GROUP BY u.id, u.email, u.username, pl.name\n"
        "ORDER BY lifetime_value DESC\n"
        "LIMIT 20;"
    ),
    "default": (
        "SELECT id, email, username, created_at, is_active\n"
        "FROM users\n"
        "WHERE is_active = TRUE\n"
        "ORDER BY created_at DESC\n"
        "LIMIT 100;"
    ),
}


def generate_sql(natural_language: str) -> str:
    """Convert natural language to SQL using keyword matching."""
    lower = natural_language.lower()
    for key, sql in SQL_TEMPLATES.items():
        if key in lower:
            return sql
    return SQL_TEMPLATES["default"]


def get_result_set(sql: str) -> dict:
    """Return the appropriate mock result set based on SQL content."""
    lower = sql.lower()
    if "revenue" in lower or "month" in lower:
        return MOCK_QUERY_RESULTS["revenue"]
    if "product" in lower and "revenue" in lower:
        return MOCK_QUERY_RESULTS["products"]
    if "lifetime" in lower or "plan_name" in lower:
        return MOCK_QUERY_RESULTS["users"]
    if "total_units" in lower or "best" in lower:
        return MOCK_QUERY_RESULTS["products"]
    return MOCK_QUERY_RESULTS["default"]


def run_query(natural_language: str) -> dict:
    """
    Simulate running a natural language query:
    1. Generate SQL from NL
    2. Get mock result set
    3. Return SQL + results + execution time
    """
    # Simulate processing delay (1.2–2.1s)
    time.sleep(1.2 + random.random() * 0.9)

    sql = generate_sql(natural_language)

    # Simulate DB execution (200–600ms)
    time.sleep(0.2 + random.random() * 0.4)
    exec_time = random.randint(150, 600)

    result_set = get_result_set(sql)

    return {
        "sql": sql,
        "columns": result_set["columns"],
        "rows": result_set["rows"],
        "rowCount": len(result_set["rows"]),
        "executionTime": exec_time,
    }
