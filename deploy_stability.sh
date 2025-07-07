#!/bin/bash

# 袁记商家系统稳定性部署脚本
# 使用方法：在远程服务器上运行此脚本

echo "=== 袁记商家系统稳定性部署开始 ==="

# 进入项目目录
cd /root/merchant-system

# 创建必要目录
mkdir -p logs

# 上传配置文件（需要先将文件传输到服务器）
echo "1. 配置PM2..."
if [ -f "ecosystem.config.js" ]; then
    # 重启PM2服务
    pm2 delete merchant-system 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    echo "   ✓ PM2配置完成"
else
    echo "   ✗ 未找到ecosystem.config.js文件"
fi

# 设置健康检查
echo "2. 设置健康检查..."
if [ -f "health_check.sh" ]; then
    chmod +x health_check.sh
    # 添加到crontab（每5分钟检查一次）
    (crontab -l 2>/dev/null; echo "*/5 * * * * /root/merchant-system/health_check.sh") | crontab -
    echo "   ✓ 健康检查已设置（每5分钟执行一次）"
else
    echo "   ✗ 未找到health_check.sh文件"
fi

# 设置系统服务（可选）
echo "3. 设置系统服务..."
if [ -f "merchant-system.service" ]; then
    cp merchant-system.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable merchant-system
    echo "   ✓ 系统服务已设置"
else
    echo "   ⚠ 未找到merchant-system.service文件，跳过系统服务设置"
fi

# 设置PM2开机自启
echo "4. 设置开机自启..."
PM2_STARTUP_SCRIPT=$(pm2 startup | grep "sudo" | head -1)
if [ ! -z "$PM2_STARTUP_SCRIPT" ]; then
    eval $PM2_STARTUP_SCRIPT
    echo "   ✓ PM2开机自启已设置"
fi

# 显示当前状态
echo "5. 当前服务状态："
pm2 status

echo ""
echo "=== 部署完成！==="
echo "🎯 访问地址：http://175.178.164.216:8080"
echo "📊 监控命令：pm2 monit"
echo "📝 查看日志：pm2 logs merchant-system"
echo "🔍 健康检查日志：tail -f /root/merchant-system/health_check.log"
echo ""
echo "🛡️ 稳定性保障已启用："
echo "   - PM2自动重启（内存超限、崩溃）"
echo "   - 每5分钟健康检查"
echo "   - 开机自启动"
echo "   - 系统级服务保护" 