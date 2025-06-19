import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space } from 'antd';

export default function SupplierPanel() {
  const [orders, setOrders] = useState([]);
  const [logistics, setLogistics] = useState({});

  const fetchOrders = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/order`)
      .then(res => res.json())
      .then(setOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrder = (id, api, body) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/supplier/${api}/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(fetchOrders);
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(94,129,244,0.06)', margin: '24px 0' }} bodyStyle={{ padding: 24 }}>
      <h2 style={{ color: '#5E81F4', fontWeight: 600, marginBottom: 24 }}>供应商订单管理</h2>
      {/* 已支付订单列表 */}
      <h3 style={{ fontWeight: 600, marginTop: 24 }}>已支付订单</h3>
      <List
        dataSource={orders.filter(order => order.status === '已支付')}
        locale={{ emptyText: '暂无已支付订单' }}
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
                <div style={{ color: '#666' }}>下单商家: {order.username || order.userId}</div>
                <div>
                  <Tag color="blue" style={{ borderRadius: 8, marginRight: 8 }}>已支付</Tag>
                  <Button type="primary" shape="round" size="small" onClick={() => updateOrder(order.id, 'finish')}>标记为已完成</Button>
                  {order.logisticsNo && <span style={{ marginLeft: 8 }}> | 物流单号: {order.logisticsNo}</span>}
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      {/* 已完成订单列表 */}
      <h3 style={{ fontWeight: 600, marginTop: 32 }}>已完成订单</h3>
      <List
        dataSource={orders.filter(order => order.status === '已完成')}
        locale={{ emptyText: '暂无已完成订单' }}
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
                <div style={{ color: '#666' }}>下单商家: {order.username || order.userId}</div>
                <div>
                  <Tag color="default" style={{ borderRadius: 8, marginRight: 8 }}>已完成</Tag>
                  <Button disabled style={{ backgroundColor: '#eee', color: '#888', borderRadius: 8, marginLeft: 8 }}>已完成</Button>
                  {order.logisticsNo && <span style={{ marginLeft: 8 }}> | 物流单号: {order.logisticsNo}</span>}
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
} 