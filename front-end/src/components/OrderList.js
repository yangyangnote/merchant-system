import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Space, message } from 'antd';

export default function OrderList({ refresh, userId }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/order?userId=${userId}`)
      .then(res => res.json())
      .then(setOrders);
  }, [refresh, userId]);

  const handleCancel = id => {
    fetch(`${process.env.REACT_APP_API_URL}/api/order/cancel/${id}`, { method: 'POST' })
      .then(() => setOrders(orders => orders.filter(o => o.id !== id)));
  };

  const handlePay = id => {
    fetch(`${process.env.REACT_APP_API_URL}/api/order/pay/${id}`, { method: 'POST' })
      .then(() => setOrders(orders => orders.map(o => o.id === id ? { ...o, status: '已支付' } : o)));
  };

  const renderStatusButton = (order) => {
    switch (order.status) {
      case '未支付':
        return (
          <Space>
            <Button type="primary" shape="round" size="small" onClick={() => handlePay(order.id)}>支付</Button>
            <Button danger shape="round" size="small" onClick={() => handleCancel(order.id)}>取消</Button>
          </Space>
        );
      case '已支付':
        return <Tag color="blue" style={{ borderRadius: 8 }}>已支付</Tag>;
      case '已取消':
        return <Tag color="default" style={{ borderRadius: 8 }}>已取消</Tag>;
      default:
        return <Tag style={{ borderRadius: 8 }}>{order.status}</Tag>;
    }
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(94,129,244,0.06)' }} bodyStyle={{ padding: 24 }}>
      <h2 style={{ color: '#5E81F4', fontWeight: 600, marginBottom: 24 }}>订单列表</h2>
      <List
        dataSource={orders}
        locale={{ emptyText: '暂无订单' }}
        renderItem={order => (
          <List.Item style={{ padding: 0, marginBottom: 16, border: 'none' }}>
            <Card
              style={{ width: '100%', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(94,129,244,0.04)' }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#222' }}>
                  {JSON.parse(order.items).map(item => 
                    `${item.name} x ${item.quantity} (￥${item.price.toFixed(2)})`
                  ).join(', ')}
                </div>
                <div style={{ color: '#666' }}>地址：{order.address}</div>
                <div style={{ color: '#666' }}>电话：{order.phone}</div>
                <div>{renderStatusButton(order)}</div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
} 