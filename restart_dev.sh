#!/bin/bash

# 袁记商家系统 - 开发重启脚本
# 使用方法：./restart_dev.sh

echo "🔄 重启袁记商家系统开发服务器..."

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 重启PM2服务
echo "📦 重启PM2进程..."
pm2 restart merchant-system

# 等待服务启动
sleep 2

# 显示当前状态
echo ""
echo "📊 当前PM2状态："
pm2 status

# 测试API连接
echo ""
echo "🔍 测试API连接..."
if curl -s -f http://localhost:3001/api/menu > /dev/null; then
    echo "✅ API连接正常"
else
    echo "❌ API连接失败，请检查日志"
fi

# 显示最新日志
echo ""
echo "📝 最新日志（最后10行）："
pm2 logs merchant-system --lines 10

echo ""
echo "✅ 重启完成！"
echo "🌐 本地开发地址：http://localhost:3000"
echo "🔧 服务器地址：http://localhost:3001"
echo "📊 实时监控：pm2 monit" 