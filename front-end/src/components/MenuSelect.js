import React, { useEffect, useState } from 'react';
import { Card, List, Tag } from 'antd';

export default function MenuSelect() {
  const [menu, setMenu] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/menu?userId=${userId}`)
      .then(res => res.json())
      .then(setMenu);
  }, [userId]);

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(94,129,244,0.06)', marginBottom: 24 }} bodyStyle={{ padding: 24 }}>
      <h2 style={{ color: '#5E81F4', fontWeight: 600, marginBottom: 24 }}>菜单选择</h2>
      <List
        dataSource={menu}
        locale={{ emptyText: '暂无菜单' }}
        renderItem={item => (
          <List.Item style={{ border: 'none', padding: 0, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#222' }}>{item.name}</div>
            <div style={{ color: '#666', marginLeft: 8 }}>
              <Tag color="blue" style={{ borderRadius: 8, marginRight: 8 }}>￥{item.price}</Tag>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
} 