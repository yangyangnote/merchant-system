#!/bin/bash

# 袁记商家系统 - 远程数据库修复脚本
# 使用正确的数据库密码

SERVER_IP="175.178.164.216"
SERVER_USER="root"
CORRECT_DB_PASSWORD="YuanJi@8888zky199205211022."

echo "🔧 修复远程数据库配置..."

# 远程执行数据库修复
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /root/merchant-system

echo "🗄️ 更新数据库配置文件..."
# 更新 db.js 文件中的密码
cat > db.js << 'DBJS'
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YuanJi@8888zky199205211022.',
  database: 'merchant_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; 
DBJS

echo "🔍 测试数据库连接..."
mysql -u root -p'YuanJi@8888zky199205211022.' -e "USE merchant_system; SHOW TABLES;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
    mysql -u root -p'YuanJi@8888zky199205211022.' -e "USE merchant_system; SELECT COUNT(*) as menu_count FROM menu; SELECT COUNT(*) as orders_count FROM orders;"
else
    echo "❌ 数据库连接失败"
    exit 1
fi

echo "🔄 重启服务..."
pm2 restart merchant-system

echo "⏳ 等待服务启动..."
sleep 5

echo "🔍 测试API..."
curl -s http://localhost:8080/api/menu | head -c 200
echo ""

echo "✅ 数据库修复完成！"
EOF

echo ""
echo "🎉 数据库配置修复完成！"
echo "🌐 请访问：http://175.178.164.216:8080" 