#!/bin/bash

# 袁记商家系统 - GitHub同步部署脚本
# 确保服务器代码与GitHub完全一致

SERVER_IP="175.178.164.216"
SERVER_USER="root"
GITHUB_REPO="https://github.com/yangyangnote/merchant-system.git"

echo "🚀 开始从GitHub同步部署到远程服务器..."
echo "📋 同步功能：地址管理数据库 + 订单分页"
echo ""

# 远程执行完整同步
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /root

echo "📂 备份当前版本..."
if [ -d "merchant-system" ]; then
    mv merchant-system merchant-system-backup-$(date +%Y%m%d_%H%M%S)
fi

echo "📥 从GitHub克隆最新代码..."
git clone https://github.com/yangyangnote/merchant-system.git
cd merchant-system

echo "🗄️ 执行数据库迁移..."
echo "  1️⃣ 创建订单号字段..."
mysql -u root -pZky199205211022. merchant_system < add_order_number.sql 2>/dev/null || echo "订单号字段已存在"

echo "  2️⃣ 创建用户地址表..."
mysql -u root -pZky199205211022. merchant_system < add_user_addresses_table.sql 2>/dev/null || echo "地址表已存在"

echo "🔧 安装依赖..."
cd /root/merchant-system
npm install --production

echo "🔧 前端依赖..."
cd front-end
npm install --production

echo "🔧 配置前端API地址..."
echo "REACT_APP_API_URL=http://175.178.164.216:3001" > .env.production

echo "🏗️ 构建前端..."
npm run build

echo "🔄 停止旧服务..."
pm2 delete server 2>/dev/null || true
pm2 delete frontend 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
pkill -f "serve.*build" 2>/dev/null || true

echo "🚀 启动新服务..."
cd /root/merchant-system

# 启动后端
pm2 start server.js --name "server" || nohup node server.js > server.log 2>&1 &

# 启动前端
cd front-end
pm2 start "npx serve -s build -l 8080" --name "frontend" || nohup npx serve -s build -l 8080 > frontend.log 2>&1 &

echo "✅ 服务器同步完成！"
echo ""
echo "📊 服务状态："
pm2 status || ps aux | grep -E "(node|serve)" | grep -v grep
echo ""
echo "🌐 访问地址："
echo "  - 前端：http://175.178.164.216:8080"
echo "  - 后端：https://175.178.164.216:3443"
EOF

echo ""
echo "🎉 GitHub同步部署完成！"
echo ""
echo "📋 已同步功能："
echo "  ✨ 地址管理数据库功能"
echo "    - 用户地址表 (user_addresses)"
echo "    - 5个地址管理API接口"
echo "    - 跨浏览器地址同步"
echo ""
echo "  ✨ 订单分页功能" 
echo "    - 订单列表分页"
echo "    - 专业订单号系统"
echo "    - 优化的用户界面"
echo ""
echo "🔧 数据库变更："
echo "  - orders 表新增 order_no 字段"
echo "  - 新增 user_addresses 表"
echo ""
echo "⚠️  重要提醒："
echo "  - 现有用户数据完全保留"
echo "  - 首次登录会自动迁移本地地址到云端"
echo "  - 所有功能向下兼容" 