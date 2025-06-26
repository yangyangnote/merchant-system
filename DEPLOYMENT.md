# 部署指南

## 推荐架构：前后端分离部署

### 前端部署（Vercel）
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 零配置部署
- ✅ 免费额度充足

### 后端部署（腾讯云）
- ✅ 就近数据库访问
- ✅ 稳定的网络环境
- ✅ 灵活的服务器配置
- ✅ 成本可控

## 部署步骤

### 1. 后端部署（腾讯云）

#### 1.1 服务器配置
```bash
# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 克隆项目
git clone https://github.com/yangyangnote/merchant-system.git
cd merchant-system

# 安装依赖
npm install
```

#### 1.2 数据库配置
```bash
# 安装 MySQL（如果还没安装）
sudo apt update
sudo apt install mysql-server

# 创建数据库和表
mysql -u root -p
CREATE DATABASE merchant_system;
USE merchant_system;
# 执行 db_schema.sql 中的建表语句
```

#### 1.3 启动服务
```bash
# 使用 PM2 启动服务
pm2 start server.js --name "merchant-api"

# 设置开机自启
pm2 startup
pm2 save
```

#### 1.4 配置防火墙和端口
```bash
# 开放3001端口
sudo ufw allow 3001

# 或者配置腾讯云安全组，开放3001端口
```

### 2. 前端部署（Vercel）

#### 2.1 配置环境变量
在 `front-end/.env.production` 中设置：
```
REACT_APP_API_URL=https://你的腾讯云公网IP:3001
```

#### 2.2 在 Vercel 中配置
1. 连接 GitHub 仓库
2. 选择 `front-end` 目录作为根目录
3. 在环境变量中设置：
   - `REACT_APP_API_URL` = `https://你的腾讯云公网IP:3001`
4. 部署

#### 2.3 更新后端CORS配置
在 `server.js` 中更新允许的域名：
```javascript
const allowedOrigins = [
  'http://localhost:3000',           // 开发环境
  'https://你的vercel域名.vercel.app', // 生产环境
];
```

## 安全配置建议

### 1. 使用HTTPS
- 为腾讯云服务器配置SSL证书
- 或者使用Nginx反向代理配置HTTPS

### 2. 环境变量
将敏感信息（如数据库密码）放在环境变量中：
```bash
# 在服务器上设置环境变量
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_USER=root
export DB_NAME=merchant_system
```

### 3. 更新 db.js 使用环境变量
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'merchant_system',
  // ...
});
```

## 监控和维护

### 1. PM2 监控
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs merchant-api

# 重启服务
pm2 restart merchant-api
```

### 2. 数据库备份
```bash
# 定期备份数据库
mysqldump -u root -p merchant_system > backup_$(date +%Y%m%d).sql
```

## 测试联调

### 1. 本地测试
```bash
# 前端
cd front-end
npm start

# 后端
npm start
```

### 2. 生产环境测试
1. 确保后端服务在腾讯云正常运行
2. 确保防火墙和安全组配置正确
3. 在 Vercel 部署前端
4. 测试完整的用户流程

## 常见问题

### Q: CORS错误
A: 检查 `server.js` 中的 `allowedOrigins` 配置是否包含你的 Vercel 域名

### Q: 连接数据库失败
A: 检查数据库服务是否启动，用户权限是否正确

### Q: 前端无法访问后端API
A: 检查腾讯云安全组是否开放3001端口，服务器防火墙是否允许

### Q: Vercel部署失败
A: 检查 `package.json` 中的构建脚本，确保依赖正确安装

---

## 总结

分离部署的优势：
1. **性能优化**：前端通过CDN全球加速
2. **独立扩展**：前后端可以独立更新和扩容
3. **成本控制**：Vercel免费托管前端，腾讯云按需付费
4. **技术栈灵活**：前后端可以使用不同的技术和优化策略

这种架构特别适合你的商家系统项目！ 