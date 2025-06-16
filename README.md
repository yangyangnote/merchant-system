# 商家界面MVP

## 功能简介
本项目为"袁记系统"中的商家界面MVP实现，包含以下核心功能：
- 菜单选择
- 地址/手机填写
- 下单支付
- 订单状态查看
- 取消订单

## 技术栈
- 后端：Node.js + Express
- 前端：React

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动后端
```bash
node server.js
```

### 3. 启动前端
```bash
cd front-end
npm install
npm start
```

### 4. 访问系统
在浏览器中访问：http://localhost:3000

## 目录结构
```
merchant-system/
├── server.js
├── routes/
│   ├── menu.js
│   ├── order.js
│   └── user.js
├── data/
│   ├── menu.json
│   └── orders.json
├── front-end/
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   │       ├── MenuSelect.js
│   │       ├── OrderForm.js
│   │       └── OrderList.js
│   └── ...
└── README.md
```

## 说明
- 仅为MVP版本，数据为本地JSON文件，未接入数据库。
- 如需扩展功能或对接正式数据库，请联系开发者。 