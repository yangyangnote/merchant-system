const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./db'); // 引入 db.js 模块
// const { WxPay } = require('wechatpay-node-v3');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// const wxpay = new WxPay({
//   appid: '你的AppID', // 你的微信AppID
//   mchid: '你的商户号', // 你的微信商户号
//   privateKey: '你的商户API密钥', // 你的商户API密钥
//   serialNo: '你的商户证书序列号', // 你的商户证书序列号（如果有）
//   key: '你的商户APIv3密钥', // 你的商户APIv3密钥（如果有）
//   certs: { /* 你的商户证书（如果有） */ }
// });

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role FROM users WHERE username = ? AND password = ? AND role = ?',
      [username, password, role]
    );
    if (rows.length > 0) {
      const user = rows[0];
      res.json({ success: true, userId: user.id, role: user.role, username: user.username });
    } else {
      res.json({ success: false, message: '用户名、密码或角色错误' });
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 菜单API
app.get('/api/menu', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT id, name, price FROM menu';
    const params = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取菜单失败:', error);
    res.status(500).json({ message: '服务器错误，无法获取菜单' });
  }
});

// 订单API
app.get('/api/order', async (req, res) => {
  const { userId } = req.query; // 从查询参数中获取商家ID
  try {
    let query = 'SELECT id, items, address, phone, userId, username, status FROM orders';
    const params = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取订单失败:', error);
    res.status(500).json({ message: '服务器错误，无法获取订单' });
  }
});

app.post('/api/order', async (req, res) => {
  const { items, address, phone, userId, username } = req.body;
  const orderId = Date.now().toString(); // 生成唯一ID
  const status = '未支付';

  try {
    // 将 items 数组转换为 JSON 字符串存储
    const itemsJson = JSON.stringify(items);

    await pool.query(
      'INSERT INTO orders (id, items, address, phone, userId, username, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, itemsJson, address, phone, userId, username, status]
    );
    res.json({ success: true, id: orderId, items, address, phone, userId, username, status });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ success: false, message: '服务器错误，无法创建订单' });
  }
});

app.post('/api/order/cancel/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['已取消', id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: '订单已取消' });
    } else {
      res.json({ success: false, message: '订单不存在或已被取消' });
    }
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/order/pay/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND status = ?',
      ['已支付', id, '未支付']
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: '支付成功' });
    } else {
      res.json({ success: false, message: '订单已支付或不存在' });
    }
  } catch (error) {
    console.error('支付订单失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 新增：供应商相关API
const updateOrderStatus = async (id, status, extra = {}) => {
  try {
    const fieldsToUpdate = ['status = ?'];
    const params = [status];
    if (extra.logisticsNo) {
      fieldsToUpdate.push('logisticsNo = ?');
      params.push(extra.logisticsNo);
    }
    params.push(id); // Where clause parameter

    await pool.query(
      `UPDATE orders SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error(`更新订单状态失败 (ID: ${id}, 状态: ${status}):`, error);
    throw new Error('更新订单状态失败');
  }
};

// 供应商接单
app.post('/api/supplier/accept/:id', async (req, res) => {
  try {
    await updateOrderStatus(req.params.id, '已接单');
    res.json({ success: true, message: '订单已接单' });
  } catch (error) {
    console.error('接单失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// 供应商打包
app.post('/api/supplier/pack/:id', async (req, res) => {
  try {
    await updateOrderStatus(req.params.id, '已打包');
    res.json({ success: true, message: '订单已打包' });
  } catch (error) {
    console.error('打包失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// 上传物流单号
app.post('/api/supplier/logistics/:id', async (req, res) => {
  const { logisticsNo } = req.body;
  try {
    await updateOrderStatus(req.params.id, '已发货', { logisticsNo });
    res.json({ success: true, message: '物流单号已上传，订单已发货' });
  } catch (error) {
    console.error('上传物流单号失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// 确认收货（供应商手动将已支付订单改为已完成）
app.post('/api/supplier/finish/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND status = ?',
      ['已完成', id, '已支付']
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: '订单已完成' });
    } else {
      res.json({ success: false, message: '订单不是已支付状态或不存在' });
    }
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001')); 