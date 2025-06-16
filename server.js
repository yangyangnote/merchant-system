const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json')));
  const user = users.find(u => u.username === username && u.password === password && u.role === role);
  if (user) {
    res.json({ success: true, userId: user.id, role: user.role, username: user.username });
  } else {
    res.json({ success: false, message: '用户名、密码或角色错误' });
  }
});

// 菜单API
app.get('/api/menu', (req, res) => {
  const { userId } = req.query;
  const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/menu.json')));
  const menu = menuData[userId] || [];
  res.json(menu);
});

// 订单API
app.get('/api/order', (req, res) => {
  const { userId } = req.query; // 从查询参数中获取商家ID
  const orders = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/orders.json')));
  // 如果提供了userId，则只返回该商家的订单
  const filteredOrders = userId ? orders.filter(order => order.userId === userId) : orders;
  res.json(filteredOrders);
});

app.post('/api/order', (req, res) => {
  const { items, address, phone, userId, username } = req.body;
  const ordersPath = path.join(__dirname, 'data/orders.json');
  const orders = JSON.parse(fs.readFileSync(ordersPath));
  const newOrder = {
    id: Date.now().toString(),
    items,
    address,
    phone,
    userId,
    username,
    status: '未支付'
  };
  orders.push(newOrder);
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  res.json(newOrder);
});

app.post('/api/order/cancel/:id', (req, res) => {
  const { id } = req.params;
  const ordersPath = path.join(__dirname, 'data/orders.json');
  let orders = JSON.parse(fs.readFileSync(ordersPath));
  orders = orders.filter(order => order.id !== id);
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.post('/api/order/pay/:id', (req, res) => {
  const { id } = req.params;
  const ordersPath = path.join(__dirname, 'data/orders.json');
  let orders = JSON.parse(fs.readFileSync(ordersPath));
  let updated = false;
  orders = orders.map(order => {
    if (order.id === id && order.status === '未支付') {
      updated = true;
      return { ...order, status: '已支付' };
    }
    return order;
  });
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  if (updated) {
    res.json({ success: true, message: '支付成功' });
  } else {
    res.json({ success: false, message: '订单已支付或不存在' });
  }
});

// 新增：供应商相关API
const updateOrderStatus = (id, status, extra = {}) => {
  const ordersPath = path.join(__dirname, 'data/orders.json');
  let orders = JSON.parse(fs.readFileSync(ordersPath));
  orders = orders.map(order =>
    order.id === id ? { ...order, status, ...extra } : order
  );
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
};

// 供应商接单
app.post('/api/supplier/accept/:id', (req, res) => {
  updateOrderStatus(req.params.id, '已接单');
  res.json({ success: true });
});
// 供应商打包
app.post('/api/supplier/pack/:id', (req, res) => {
  updateOrderStatus(req.params.id, '已打包');
  res.json({ success: true });
});
// 上传物流单号
app.post('/api/supplier/logistics/:id', (req, res) => {
  const { logisticsNo } = req.body;
  updateOrderStatus(req.params.id, '已发货', { logisticsNo });
  res.json({ success: true });
});
// 确认收货（供应商手动将已支付订单改为已完成）
app.post('/api/supplier/finish/:id', (req, res) => {
  const { id } = req.params;
  const ordersPath = path.join(__dirname, 'data/orders.json');
  let orders = JSON.parse(fs.readFileSync(ordersPath));
  let updated = false;
  orders = orders.map(order => {
    if (order.id === id && order.status === '已支付') {
      updated = true;
      return { ...order, status: '已完成' };
    }
    return order;
  });
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  if (updated) {
    res.json({ success: true, message: '订单已完成' });
  } else {
    res.json({ success: false, message: '订单不是已支付状态或不存在' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001')); 