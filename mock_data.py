"""
Mock data for QueryLens — schema definitions, history, saved queries, and query results.
"""

from datetime import datetime, timedelta

# ─── Table Schemas ───────────────────────────────────────────────────────────

MOCK_SCHEMAS = [
    {
        "name": "users",
        "rowCount": 142830,
        "description": "Core user accounts and profile information",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "email", "type": "VARCHAR(255)", "nullable": False},
            {"name": "username", "type": "VARCHAR(100)", "nullable": False},
            {"name": "first_name", "type": "VARCHAR(100)", "nullable": True},
            {"name": "last_name", "type": "VARCHAR(100)", "nullable": True},
            {"name": "created_at", "type": "TIMESTAMP", "nullable": False},
            {"name": "last_login", "type": "TIMESTAMP", "nullable": True},
            {"name": "is_active", "type": "BOOLEAN", "nullable": False},
            {"name": "plan_id", "type": "INTEGER", "nullable": True, "isForeign": True, "references": "plans.id"},
        ],
    },
    {
        "name": "orders",
        "rowCount": 891240,
        "description": "Customer purchase orders and transactions",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "user_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "users.id"},
            {"name": "status", "type": "VARCHAR(50)", "nullable": False},
            {"name": "total_amount", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "currency", "type": "VARCHAR(3)", "nullable": False},
            {"name": "created_at", "type": "TIMESTAMP", "nullable": False},
            {"name": "shipped_at", "type": "TIMESTAMP", "nullable": True},
            {"name": "shipping_address_id", "type": "INTEGER", "nullable": True, "isForeign": True, "references": "addresses.id"},
        ],
    },
    {
        "name": "products",
        "rowCount": 12540,
        "description": "Product catalog with inventory data",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "sku", "type": "VARCHAR(100)", "nullable": False},
            {"name": "name", "type": "VARCHAR(255)", "nullable": False},
            {"name": "description", "type": "TEXT", "nullable": True},
            {"name": "price", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "stock_quantity", "type": "INTEGER", "nullable": False},
            {"name": "category_id", "type": "INTEGER", "nullable": True, "isForeign": True, "references": "categories.id"},
            {"name": "created_at", "type": "TIMESTAMP", "nullable": False},
            {"name": "is_active", "type": "BOOLEAN", "nullable": False},
        ],
    },
    {
        "name": "order_items",
        "rowCount": 2341000,
        "description": "Line items belonging to each order",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "order_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "orders.id"},
            {"name": "product_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "products.id"},
            {"name": "quantity", "type": "INTEGER", "nullable": False},
            {"name": "unit_price", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "discount", "type": "DECIMAL(5,2)", "nullable": True},
        ],
    },
    {
        "name": "categories",
        "rowCount": 238,
        "description": "Product category hierarchy",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "name", "type": "VARCHAR(100)", "nullable": False},
            {"name": "slug", "type": "VARCHAR(100)", "nullable": False},
            {"name": "parent_id", "type": "INTEGER", "nullable": True, "isForeign": True, "references": "categories.id"},
            {"name": "description", "type": "TEXT", "nullable": True},
        ],
    },
    {
        "name": "plans",
        "rowCount": 5,
        "description": "Subscription plan definitions",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "name", "type": "VARCHAR(100)", "nullable": False},
            {"name": "price_monthly", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "price_yearly", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "max_users", "type": "INTEGER", "nullable": True},
            {"name": "features", "type": "JSONB", "nullable": True},
        ],
    },
    {
        "name": "addresses",
        "rowCount": 310540,
        "description": "User shipping and billing addresses",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "user_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "users.id"},
            {"name": "line1", "type": "VARCHAR(255)", "nullable": False},
            {"name": "line2", "type": "VARCHAR(255)", "nullable": True},
            {"name": "city", "type": "VARCHAR(100)", "nullable": False},
            {"name": "state", "type": "VARCHAR(100)", "nullable": True},
            {"name": "country", "type": "VARCHAR(2)", "nullable": False},
            {"name": "postal_code", "type": "VARCHAR(20)", "nullable": True},
        ],
    },
    {
        "name": "reviews",
        "rowCount": 459200,
        "description": "Product reviews and ratings by users",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "product_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "products.id"},
            {"name": "user_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "users.id"},
            {"name": "rating", "type": "INTEGER", "nullable": False},
            {"name": "title", "type": "VARCHAR(255)", "nullable": True},
            {"name": "body", "type": "TEXT", "nullable": True},
            {"name": "created_at", "type": "TIMESTAMP", "nullable": False},
            {"name": "is_verified", "type": "BOOLEAN", "nullable": False},
        ],
    },
    {
        "name": "sessions",
        "rowCount": 5821000,
        "description": "User session tracking and analytics",
        "columns": [
            {"name": "id", "type": "UUID", "nullable": False, "isPrimary": True},
            {"name": "user_id", "type": "INTEGER", "nullable": True, "isForeign": True, "references": "users.id"},
            {"name": "ip_address", "type": "INET", "nullable": True},
            {"name": "user_agent", "type": "TEXT", "nullable": True},
            {"name": "started_at", "type": "TIMESTAMP", "nullable": False},
            {"name": "ended_at", "type": "TIMESTAMP", "nullable": True},
            {"name": "page_views", "type": "INTEGER", "nullable": False},
        ],
    },
    {
        "name": "payments",
        "rowCount": 1023440,
        "description": "Payment transactions and gateway records",
        "columns": [
            {"name": "id", "type": "SERIAL", "nullable": False, "isPrimary": True},
            {"name": "order_id", "type": "INTEGER", "nullable": False, "isForeign": True, "references": "orders.id"},
            {"name": "amount", "type": "DECIMAL(10,2)", "nullable": False},
            {"name": "currency", "type": "VARCHAR(3)", "nullable": False},
            {"name": "gateway", "type": "VARCHAR(50)", "nullable": False},
            {"name": "gateway_tx_id", "type": "VARCHAR(255)", "nullable": True},
            {"name": "status", "type": "VARCHAR(50)", "nullable": False},
            {"name": "created_at", "type": "TIMESTAMP", "nullable": False},
        ],
    },
]


# ─── Query History ───────────────────────────────────────────────────────────

def get_mock_history():
    """Returns fresh mock history with relative timestamps."""
    now = datetime.now()
    return [
        {
            "id": "1",
            "naturalLanguage": "Show me all users who signed up in the last 30 days",
            "sql": "SELECT id, email, username, created_at\nFROM users\nWHERE created_at >= NOW() - INTERVAL '30 days'\nORDER BY created_at DESC;",
            "timestamp": now - timedelta(minutes=5),
            "executionTime": 142,
            "rowCount": 1243,
            "status": "success",
        },
        {
            "id": "2",
            "naturalLanguage": "What are the top 10 best-selling products by revenue?",
            "sql": "SELECT p.name, p.sku,\n  SUM(oi.quantity) AS total_units,\n  SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nJOIN orders o ON oi.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY p.id, p.name, p.sku\nORDER BY total_revenue DESC\nLIMIT 10;",
            "timestamp": now - timedelta(minutes=18),
            "executionTime": 378,
            "rowCount": 10,
            "status": "success",
        },
        {
            "id": "3",
            "naturalLanguage": "Average order value grouped by subscription plan",
            "sql": "SELECT pl.name AS plan_name,\n  COUNT(o.id) AS total_orders,\n  ROUND(AVG(o.total_amount), 2) AS avg_order_value\nFROM orders o\nJOIN users u ON o.user_id = u.id\nJOIN plans pl ON u.plan_id = pl.id\nWHERE o.status != 'cancelled'\nGROUP BY pl.id, pl.name\nORDER BY avg_order_value DESC;",
            "timestamp": now - timedelta(hours=1),
            "executionTime": 512,
            "rowCount": 5,
            "status": "success",
        },
        {
            "id": "4",
            "naturalLanguage": "Find all users with more than 3 failed payments",
            "sql": "SELECT u.id, u.email, COUNT(p.id) AS failed_payments\nFROM users u\nJOIN orders o ON u.id = o.user_id\nJOIN payments p ON o.id = p.order_id\nWHERE p.status = 'failed'\nGROUP BY u.id, u.email\nHAVING COUNT(p.id) > 3\nORDER BY failed_payments DESC;",
            "timestamp": now - timedelta(hours=3),
            "executionTime": 289,
            "rowCount": 87,
            "status": "success",
        },
        {
            "id": "5",
            "naturalLanguage": "Monthly revenue for the current year",
            "sql": "SELECT DATE_TRUNC('month', o.created_at) AS month,\n  SUM(o.total_amount) AS revenue\nFROM orders o\nWHERE o.status = 'completed'\n  AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW())\nGROUP BY month\nORDER BY month;",
            "timestamp": now - timedelta(hours=5),
            "executionTime": 203,
            "rowCount": 6,
            "status": "success",
        },
        {
            "id": "6",
            "naturalLanguage": "Get the review count for product skus",
            "sql": "SELECT p.sku, p.nme, COUNT(r.id) AS review_count\nFROM products p\nLEFT JOIN reviews r ON p.id = r.product_id\nGROUP BY p.sku, p.nme\nORDER BY review_count DESC;",
            "timestamp": now - timedelta(hours=8),
            "executionTime": 0,
            "rowCount": 0,
            "status": "error",
            "error": 'ERROR: column "p.nme" does not exist — did you mean "p.name"?',
        },
    ]


# ─── Saved Queries ───────────────────────────────────────────────────────────

def get_mock_saved_queries():
    """Returns fresh mock saved queries with relative timestamps."""
    now = datetime.now()
    return [
        {
            "id": "s1",
            "name": "Monthly Revenue Report",
            "naturalLanguage": "Monthly revenue for the current year broken down by month",
            "sql": "SELECT DATE_TRUNC('month', o.created_at) AS month,\n  SUM(o.total_amount) AS revenue,\n  COUNT(o.id) AS order_count\nFROM orders o\nWHERE o.status = 'completed'\n  AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW())\nGROUP BY month\nORDER BY month;",
            "createdAt": now - timedelta(days=3),
            "tags": ["revenue", "monthly", "reporting"],
        },
        {
            "id": "s2",
            "name": "Top Customers by LTV",
            "naturalLanguage": "Top 20 customers by lifetime value with their order count",
            "sql": "SELECT u.id, u.email, u.username,\n  COUNT(o.id) AS total_orders,\n  SUM(o.total_amount) AS lifetime_value\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.email, u.username\nORDER BY lifetime_value DESC\nLIMIT 20;",
            "createdAt": now - timedelta(days=7),
            "tags": ["customers", "ltv", "retention"],
        },
        {
            "id": "s3",
            "name": "Low Stock Alert",
            "naturalLanguage": "Products with stock quantity below 20 that are still active",
            "sql": "SELECT id, sku, name, stock_quantity, price\nFROM products\nWHERE stock_quantity < 20\n  AND is_active = TRUE\nORDER BY stock_quantity ASC;",
            "createdAt": now - timedelta(days=14),
            "tags": ["inventory", "alerts", "products"],
        },
        {
            "id": "s4",
            "name": "Churn Risk Users",
            "naturalLanguage": "Active users who have not logged in for more than 60 days",
            "sql": "SELECT id, email, username, last_login,\n  NOW() - last_login AS days_inactive\nFROM users\nWHERE is_active = TRUE\n  AND last_login < NOW() - INTERVAL '60 days'\nORDER BY last_login ASC\nLIMIT 500;",
            "createdAt": now - timedelta(days=2),
            "tags": ["churn", "users", "engagement"],
        },
    ]


# ─── Query Results ───────────────────────────────────────────────────────────

MOCK_QUERY_RESULTS = {
    "default": {
        "columns": ["id", "email", "username", "created_at", "is_active"],
        "rows": [
            {"id": 1, "email": "alice@example.com", "username": "alice92", "created_at": "2025-12-01 09:14:32", "is_active": True},
            {"id": 2, "email": "bob.smith@corp.io", "username": "bobsmith", "created_at": "2025-12-03 14:22:11", "is_active": True},
            {"id": 3, "email": "carol@startup.dev", "username": "carol_dev", "created_at": "2025-12-05 08:01:44", "is_active": False},
            {"id": 4, "email": "dan@mail.com", "username": "dan_99", "created_at": "2025-12-07 17:45:00", "is_active": True},
            {"id": 5, "email": "eve@design.co", "username": "eveui", "created_at": "2025-12-09 11:30:22", "is_active": True},
            {"id": 6, "email": "frank@techco.com", "username": "franktech", "created_at": "2025-12-11 09:05:15", "is_active": True},
            {"id": 7, "email": "grace@hello.io", "username": "graceH", "created_at": "2025-12-14 13:20:55", "is_active": False},
            {"id": 8, "email": "henry@company.com", "username": "henry_m", "created_at": "2025-12-16 16:00:00", "is_active": True},
        ],
    },
    "revenue": {
        "columns": ["month", "revenue", "order_count"],
        "rows": [
            {"month": "2025-07-01", "revenue": "$142,340.00", "order_count": 1823},
            {"month": "2025-08-01", "revenue": "$158,920.50", "order_count": 2041},
            {"month": "2025-09-01", "revenue": "$171,880.00", "order_count": 2204},
            {"month": "2025-10-01", "revenue": "$189,440.75", "order_count": 2389},
            {"month": "2025-11-01", "revenue": "$224,310.25", "order_count": 2891},
            {"month": "2025-12-01", "revenue": "$131,040.00", "order_count": 1688},
        ],
    },
    "products": {
        "columns": ["name", "sku", "total_units", "total_revenue"],
        "rows": [
            {"name": "Pro Wireless Headphones", "sku": "AUDIO-001", "total_units": 8421, "total_revenue": "$1,262,550.00"},
            {"name": "Mechanical Keyboard RGB", "sku": "KBD-042", "total_units": 7830, "total_revenue": "$939,600.00"},
            {"name": "4K Webcam Ultra", "sku": "CAM-018", "total_units": 6210, "total_revenue": "$869,400.00"},
            {"name": "USB-C Hub 7-Port", "sku": "HUB-009", "total_units": 12340, "total_revenue": "$740,400.00"},
            {"name": "Ergonomic Mouse", "sku": "MSE-033", "total_units": 9880, "total_revenue": "$692,600.00"},
            {"name": '27" 4K Monitor', "sku": "MON-007", "total_units": 2100, "total_revenue": "$629,790.00"},
            {"name": "Laptop Stand Pro", "sku": "STD-011", "total_units": 15200, "total_revenue": "$608,000.00"},
            {"name": "Cable Management Kit", "sku": "CBL-055", "total_units": 21000, "total_revenue": "$420,000.00"},
        ],
    },
    "users": {
        "columns": ["id", "email", "username", "plan_name", "total_orders", "lifetime_value"],
        "rows": [
            {"id": 2834, "email": "david.rich@bigco.com", "username": "davidr", "plan_name": "Enterprise", "total_orders": 142, "lifetime_value": "$48,330.00"},
            {"id": 1092, "email": "lisa.k@ventures.io", "username": "lisakv", "plan_name": "Pro", "total_orders": 98, "lifetime_value": "$31,280.00"},
            {"id": 4471, "email": "marco@techstart.com", "username": "marco_t", "plan_name": "Enterprise", "total_orders": 87, "lifetime_value": "$29,100.00"},
            {"id": 998, "email": "sarah.jones@corp.com", "username": "sarah_j", "plan_name": "Pro", "total_orders": 76, "lifetime_value": "$24,880.00"},
            {"id": 3310, "email": "mike@mikedev.net", "username": "mikedev", "plan_name": "Pro", "total_orders": 65, "lifetime_value": "$21,450.00"},
        ],
    },
}
