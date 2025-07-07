# 袁记商家系统 - 开发工作流

## 🔄 PM2 重启时机指南

### 场景1：添加新API接口
```bash
# 1. 修改 server.js 添加新路由
vim server.js

# 2. 重启服务器
pm2 restart merchant-system

# 3. 测试API
curl http://localhost:3001/api/new-endpoint
```

### 场景2：修改数据库结构
```bash
# 1. 修改数据库
mysql -u root -p merchant_system < new_schema.sql

# 2. 修改 server.js 中的查询语句
vim server.js

# 3. 重启服务器
pm2 restart merchant-system
```

### 场景3：添加新依赖
```bash
# 1. 安装新包
npm install --save express-validator

# 2. 修改代码使用新包
vim server.js

# 3. 重启服务器
pm2 restart merchant-system
```

### 场景4：修改前端（无需重启后端）
```bash
# 1. 修改前端组件
vim front-end/src/components/NewComponent.js

# 2. 前端会自动热重载
# 3. 不需要重启PM2
```

### 场景5：修改环境配置
```bash
# 1. 修改配置
vim ecosystem.config.js

# 2. 重新加载配置
pm2 delete merchant-system
pm2 start ecosystem.config.js
```

## 🚀 快速重启脚本

创建便捷的重启脚本：

```bash
#!/bin/bash
# 文件名：restart_dev.sh

echo "🔄 重启袁记商家系统..."
pm2 restart merchant-system

echo "📊 当前状态："
pm2 status

echo "📝 查看日志："
pm2 logs merchant-system --lines 10

echo "✅ 重启完成！"
```

## 🛡️ 生产环境注意事项

### 开发环境（可以随意重启）：
```bash
pm2 restart merchant-system
```

### 生产环境（建议零停机）：
```bash
pm2 reload merchant-system  # 推荐
```

## 📊 监控和调试

### 实时监控：
```bash
pm2 monit
```

### 查看日志：
```bash
pm2 logs merchant-system
pm2 logs merchant-system --lines 50
```

### 查看详细信息：
```bash
pm2 describe merchant-system
``` 