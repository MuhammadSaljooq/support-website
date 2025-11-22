-- Test MySQL Connection and View Data
-- Run: mysql -u root -p < mysql-connection-test.sql

USE vocco_talk_db;

-- Show all tables
SHOW TABLES;

-- View all users
SELECT id, username, email, role, created_at FROM users;

-- View recent login logs
SELECT 
    ll.id,
    u.username,
    ll.login_time,
    ll.login_date,
    ll.ip_address,
    ll.login_status,
    ll.failure_reason
FROM login_logs ll
LEFT JOIN users u ON ll.user_id = u.id
ORDER BY ll.login_time DESC
LIMIT 10;

-- View active sessions
SELECT 
    us.id,
    u.username,
    us.login_time,
    us.last_activity,
    us.expires_at,
    us.is_active
FROM user_sessions us
LEFT JOIN users u ON us.user_id = u.id
WHERE us.is_active = TRUE
ORDER BY us.last_activity DESC;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Count login attempts by status
SELECT login_status, COUNT(*) as count FROM login_logs GROUP BY login_status;


