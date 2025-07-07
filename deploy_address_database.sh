#!/bin/bash

# 袁记商家系统 - 地址数据库功能部署脚本
# 将地址存储从localStorage迁移到数据库

SERVER_IP="175.178.164.216"
SERVER_USER="root"
DB_PASSWORD="Zky199205211022."

echo "🚀 开始部署地址数据库功能到远程服务器..."

# 1. 上传数据库迁移文件
echo "📤 上传数据库迁移文件..."
scp add_user_addresses_table.sql $SERVER_USER@$SERVER_IP:/root/merchant-system/

# 2. 上传更新后的后端代码
echo "📤 上传后端代码..."
scp server.js $SERVER_USER@$SERVER_IP:/root/merchant-system/

# 3. 上传更新后的前端组件
echo "📤 上传前端代码..."
scp front-end/src/components/AddressSelector.js $SERVER_USER@$SERVER_IP:/root/merchant-system/front-end/src/components/
scp front-end/src/components/OrderForm.js $SERVER_USER@$SERVER_IP:/root/merchant-system/front-end/src/components/

# 4. 远程执行部署
echo "🔧 远程执行部署..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /root/merchant-system

# 执行数据库迁移
echo "🗄️ 执行数据库迁移..."
mysql -u root -pZky199205211022. merchant_system < add_user_addresses_table.sql

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart server || (pkill -f "node server.js" && nohup node server.js > server.log 2>&1 &)

# 重新构建前端
echo "🏗️ 重新构建前端..."
cd front-end
npm run build

# 重启前端服务
echo "🔄 重启前端服务..."
pm2 restart frontend || (pkill -f "serve.*build" && nohup npx serve -s build -l 3000 > frontend.log 2>&1 &)

echo "✅ 地址数据库功能部署完成！"
EOF

echo "🎉 部署成功！"
echo "📋 新功能："
echo "  ✨ 地址存储已迁移到数据库"
echo "  🌐 支持跨浏览器、跨设备地址同步"
echo "  🔄 自动迁移现有localStorage地址到云端"
echo "  📝 支持地址的增删改查操作"
echo "  🔒 地址与用户账号绑定，更安全"
echo ""
echo "🌐 访问地址："
echo "  - 前端：http://$SERVER_IP:3000"
echo "  - 后端：http://$SERVER_IP:3001"
echo ""
echo "🔧 API接口："
echo "  - GET /api/addresses/:userId - 获取用户地址"
echo "  - POST /api/addresses - 添加地址"
echo "  - PUT /api/addresses/:id - 更新地址"
echo "  - DELETE /api/addresses/:id - 删除地址" 