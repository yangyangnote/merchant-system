#!/bin/bash

# 袁记商家系统健康检查脚本
# 功能：检查服务状态，自动重启失败的服务

LOG_FILE="/root/merchant-system/health_check.log"
API_URL="http://localhost:3001/api/menu"
HTTPS_API_URL="https://localhost:3443/api/menu"

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# 检查API是否响应
check_api() {
    local url=$1
    curl -s -f -m 10 "$url" > /dev/null 2>&1
    return $?
}

# 检查PM2进程
check_pm2() {
    pm2 list | grep -q "merchant-system.*online"
    return $?
}

# 主检查逻辑
main() {
    log "开始健康检查..."
    
    # 检查PM2进程状态
    if ! check_pm2; then
        log "警告：PM2进程不在线，尝试重启..."
        pm2 restart merchant-system
        sleep 5
        
        if check_pm2; then
            log "成功：PM2进程已重启"
        else
            log "错误：PM2进程重启失败"
            return 1
        fi
    fi
    
    # 检查API响应
    if ! check_api "$HTTPS_API_URL" && ! check_api "$API_URL"; then
        log "警告：API无响应，尝试重启服务..."
        pm2 restart merchant-system
        sleep 10
        
        if check_api "$HTTPS_API_URL" || check_api "$API_URL"; then
            log "成功：API服务已恢复"
        else
            log "严重：API服务重启后仍无响应"
            # 可以在这里添加更多恢复措施，如发送告警邮件
        fi
    else
        log "正常：服务运行正常"
    fi
}

# 执行检查
main 