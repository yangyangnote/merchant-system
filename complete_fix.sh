#!/bin/bash

# 袁记商家系统 - 完整修复脚本
# 彻底解决所有配置问题

SERVER_IP="175.178.164.216"
SERVER_USER="root"

echo "🔧 开始完整修复..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /root/merchant-system

echo "🛑 彻底停止所有服务..."
pm2 delete all 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
pkill -f "nginx" 2>/dev/null || true

echo "🗄️ 检查数据库..."
mysql -u root -p'YuanJi@8888zky199205211022.' -e "USE merchant_system; SELECT COUNT(*) FROM menu; SELECT COUNT(*) FROM users;"

echo "📝 创建简化的server.js（使用9000端口避免冲突）..."
cat > server.js << 'SERVERJS'
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

// 数据库连接
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YuanJi@8888zky199205211022.',
  database: 'merchant_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 中间件
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'front-end/build')));

// API路由
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, price FROM menu');
    console.log('菜单API调用成功，返回', rows.length, '条记录');
    res.json(rows);
  } catch (error) {
    console.error('菜单API错误:', error);
    res.status(500).json({ error: '数据库错误' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role FROM users WHERE username = ? AND password = ? AND role = ?',
      [username, password, role]
    );
    if (rows.length > 0) {
      res.json({ success: true, userId: rows[0].id, role: rows[0].role, username: rows[0].username });
    } else {
      res.json({ success: false, message: '登录失败' });
    }
  } catch (error) {
    console.error('登录API错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/order', async (req, res) => {
  const { userId, page = 1, pageSize = 10 } = req.query;
  try {
    let query = 'SELECT * FROM orders';
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    const params = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      countQuery += ' WHERE userId = ?';
      params.push(userId);
    }
    
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [rows] = await pool.query(query, [...params, parseInt(pageSize), offset]);
    
    res.json({
      data: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        total: total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('订单API错误:', error);
    res.status(500).json({ error: '数据库错误' });
  }
});

// 前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front-end/build', 'index.html'));
});

const PORT = 9000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://175.178.164.216:${PORT}`);
});
SERVERJS

echo "🏗️ 重新配置前端..."
cd front-end

# 确保环境变量正确
echo "REACT_APP_API_URL=http://175.178.164.216:9000" > .env.production
echo "REACT_APP_API_URL=http://175.178.164.216:9000" > .env

echo "📦 重新构建前端..."
npm run build

echo "🚀 启动服务（9000端口）..."
cd /root/merchant-system
node server.js &
SERVER_PID=$!
echo "服务器PID: $SERVER_PID"

echo "⏳ 等待服务启动..."
sleep 5

echo "🔍 测试API..."
curl -s "http://localhost:9000/api/menu" | head -c 200
echo ""

echo "✅ 修复完成！"
echo "🌐 访问地址: http://175.178.164.216:9000"
EOF

echo "🎉 完整修复完成！"
echo ""
echo "🌐 新的访问地址: http://175.178.164.216:9000"
echo "📋 使用9000端口避免与Nginx冲突" 