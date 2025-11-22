#!/bin/bash

# Fix MySQL Root User Permissions
# Grants all privileges to root user

echo "🔧 Fixing MySQL Root Permissions..."
echo ""

read -sp "Enter MySQL root password: " MYSQL_PASSWORD
echo ""

# Test connection first
if ! mysql -u root -p"${MYSQL_PASSWORD}" -e "SELECT 1;" 2>/dev/null; then
    echo "❌ Cannot connect with this password"
    exit 1
fi

echo "✅ Connected successfully!"
echo ""
echo "Granting all privileges to root@localhost..."

mysql -u root -p"${MYSQL_PASSWORD}" <<EOF
-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Also grant for root@127.0.0.1
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;

-- Grant for root@%
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Unlock account if locked
ALTER USER 'root'@'localhost' ACCOUNT UNLOCK;

-- Remove password expiration
ALTER USER 'root'@'localhost' PASSWORD EXPIRE NEVER;

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'root'@'localhost';
SELECT 'Permissions fixed!' as status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Permissions fixed!"
    echo ""
    echo "Now try creating a user:"
    echo "  mysql -u root -p"
    echo "  CREATE USER 'vocco_user'@'localhost' IDENTIFIED BY 'password';"
else
    echo ""
    echo "❌ Failed to fix permissions"
fi


