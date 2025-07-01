import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Space, List, InputNumber, message, AutoComplete } from 'antd';

export default function OrderForm({ onOrder }) {
  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState([]); // [{id, name, price, stock, quantity}]
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [historyAddresses, setHistoryAddresses] = useState([]);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/menu?userId=${userId}`)
      .then(res => res.json())
      .then(setMenu);
    // 读取历史地址
    const history = JSON.parse(localStorage.getItem('historyAddresses') || '[]');
    setHistoryAddresses(history);
  }, [userId]);

  const saveHistoryAddress = (addr) => {
    let history = JSON.parse(localStorage.getItem('historyAddresses') || '[]');
    if (!history.includes(addr)) {
      history = [addr, ...history].slice(0, 5); // 最多保存5个
      localStorage.setItem('historyAddresses', JSON.stringify(history));
      setHistoryAddresses(history);
    }
  };

  const handleSelect = (id) => {
    const item = menu.find(m => m.id === id || m.name === id);
    if (item && !selected.find(s => s.id === id || s.name === id)) {
      setSelected([...selected, { ...item, price: Number(item.price), quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setSelected(selected.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, Number(quantity)) } : item
    ));
  };

  const handleRemove = (id) => {
    setSelected(selected.filter(item => item.id !== id));
  };

  const total = selected.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (values) => {
    if (!selected.length || !values.address || !values.phone || !values.contactName) {
      message.error('请填写完整信息并选择商品');
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: selected, 
        address: values.address, 
        phone: values.phone, 
        contactName: values.contactName,
        userId, 
        username 
      })
    }).then(() => {
      setSelected([]);
      setAddress('');
      setPhone('');
      setContactName('');
      saveHistoryAddress(values.address); // 保存历史地址
      onOrder();
      message.success('下单成功！');
    });
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(94,129,244,0.06)', margin: '24px 0' }} bodyStyle={{ padding: 24 }}>
      <h2 style={{ color: '#5E81F4', fontWeight: 600, marginBottom: 24 }}>下单</h2>
      <Form layout="vertical" onFinish={handleSubmit} initialValues={{ address, phone, contactName }}>
        <Form.Item label="地址" name="address" rules={[{ required: true, message: '请输入地址' }]}> 
          <AutoComplete
            style={{ width: '100%', borderRadius: 8 }}
            options={historyAddresses.map(addr => ({ value: addr }))}
            placeholder="请输入或选择收货地址"
            value={address}
            onChange={setAddress}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item label="选择商品">
          <Select
            placeholder="选择商品"
            onChange={handleSelect}
            value=""
            style={{ borderRadius: 8 }}
          >
            <Select.Option value="">请选择</Select.Option>
          {menu.map(item => (
              <Select.Option key={item.id || item.name} value={item.id || item.name}>
                {item.name} - ￥{item.price}
              </Select.Option>
          ))}
          </Select>
        </Form.Item>
        {selected.length > 0 && (
          <List
            dataSource={selected}
            renderItem={item => (
              <List.Item style={{ padding: 0, border: 'none' }}>
                <Space style={{ width: '100%' }}>
                  <span style={{ minWidth: 80 }}>{item.name}</span>
                  <span>单价: ￥{item.price}</span>
                  <InputNumber min={1} value={item.quantity} onChange={v => handleQuantityChange(item.id, v)} style={{ width: 60, borderRadius: 8 }} />
                  <Button type="link" danger onClick={() => handleRemove(item.id)}>移除</Button>
            <span style={{ marginLeft: 8 }}>小计: ￥{item.price * item.quantity}</span>
                </Space>
              </List.Item>
            )}
          />
        )}
        <div style={{ margin: '16px 0', fontWeight: 500, fontSize: 16 }}>总金额: <span style={{ color: '#5E81F4' }}>￥{total}</span></div>
        <Form.Item label="联系人姓名" name="contactName" rules={[{ required: true, message: '请输入联系人姓名' }]}> 
          <Input placeholder="请输入联系人姓名" value={contactName} onChange={e => setContactName(e.target.value)} style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item label="手机" name="phone" rules={[{ required: true, message: '请输入手机号' }]}> 
          <Input placeholder="手机" value={phone} onChange={e => setPhone(e.target.value)} style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block style={{ borderRadius: 8 }}>下单</Button>
        </Form.Item>
      </Form>
    </Card>
  );
} 