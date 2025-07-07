#!/bin/bash

# 袁记商家系统 - 订单号功能部署脚本
# 将订单号功能部署到远程服务器

SERVER_IP="175.178.164.216"
SERVER_USER="root"
DB_PASSWORD="Zky199205211022."

echo "🚀 开始部署订单号功能到远程服务器..."

# 1. 上传SQL迁移文件
echo "📤 上传数据库迁移文件..."
scp add_order_number.sql $SERVER_USER@$SERVER_IP:/root/merchant-system/

# 2. 上传更新后的后端代码
echo "📤 上传后端代码..."
scp server.js $SERVER_USER@$SERVER_IP:/root/merchant-system/

# 3. 上传更新后的前端代码
echo "📤 上传前端代码..."
scp -r front-end/src/components/ $SERVER_USER@$SERVER_IP:/root/merchant-system/front-end/src/

# 4. 远程执行部署
echo "🔧 远程执行部署..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /root/merchant-system

# 执行数据库迁移
echo "🗄️ 执行数据库迁移..."
mysql -u root -pZky199205211022. < add_order_number.sql

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

echo "✅ 订单号功能部署完成！"
EOF

echo "🎉 部署成功！"
echo "📋 新功能："
echo "  - 每个订单都有专业的订单号（格式：YJ + 日期时间 + 随机数）"
echo "  - 前端界面显示订单号"
echo "  - 现有订单已自动生成订单号"
echo "  - 数据库已添加 order_no 字段"
echo ""
echo "🌐 访问地址："
echo "  - 前端：http://$SERVER_IP:3000"
echo "  - 后端：http://$SERVER_IP:3001" 