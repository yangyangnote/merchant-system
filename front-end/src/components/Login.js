import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Card } from 'antd';

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { username, password, role } = values;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('username', data.username);
      onLogin(data.userId, data.role);
    } else {
        message.error(data.message || '登录失败');
      }
    } catch (e) {
      message.error('网络错误');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f7f7fa' }}>
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(94,129,244,0.06)',
          padding: 0
        }}
        bodyStyle={{ padding: 40 }}
      >
        <Form
          onFinish={onFinish}
          initialValues={{ role: 'merchant' }}
          layout="vertical"
        >
          <h2 style={{ textAlign: 'center', color: '#5E81F4', fontWeight: 700, marginBottom: 32 }}>登录</h2>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}> 
            <Input placeholder="用户名" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}> 
            <Input.Password placeholder="密码" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}> 
            <Select size="large" style={{ borderRadius: 8 }}>
              <Select.Option value="merchant">商家</Select.Option>
              <Select.Option value="supplier">供应商</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ borderRadius: 8, marginTop: 8 }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
      </div>
  );
} 