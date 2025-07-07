import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Input, Card, Space, message, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, CheckOutlined } from '@ant-design/icons';

export default function AddressSelector({ value, onChange, placeholder = "点击选择收货地址" }) {
  const [visible, setVisible] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newAddress, setNewAddress] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const userId = localStorage.getItem('userId');

  // 从API获取地址列表
  const fetchAddresses = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses/${userId}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        // 转换数据格式以适配现有组件结构
        const addressList = data.map(item => item.address);
        setAddresses(addressList);
      } else {
        console.error('获取地址失败:', data?.message || '未知错误');
        setAddresses([]); // 确保addresses是数组
      }
    } catch (error) {
      console.error('获取地址失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 数据迁移：将localStorage数据迁移到数据库
  const migrateLocalData = async () => {
    if (!userId || migrated) return;

    const localAddresses = JSON.parse(localStorage.getItem('historyAddresses') || '[]');
    if (localAddresses.length === 0) {
      setMigrated(true);
      return;
    }

    try {
      // 批量添加本地地址到数据库
      for (const address of localAddresses) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, address })
        });
      }
      
      // 迁移完成后清除localStorage
      localStorage.removeItem('historyAddresses');
      setMigrated(true);
      message.success(`已迁移 ${localAddresses.length} 个历史地址到云端`);
      
      // 重新获取地址列表
      fetchAddresses();
    } catch (error) {
      console.error('数据迁移失败:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      migrateLocalData().then(() => {
        fetchAddresses();
      });
    }
  }, [userId]);

  const handleSelectAddress = (address) => {
    onChange(address);
    setVisible(false);
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      message.error('请输入地址');
      return;
    }

    if (!userId) {
      message.error('用户未登录');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          address: newAddress.trim(),
          isDefault: addresses.length === 0 // 如果是第一个地址，设为默认
        })
      });

      const data = await response.json();

      if (response.ok) {
        onChange(newAddress.trim());
        setNewAddress('');
        setVisible(false);
        message.success('地址已添加');
        fetchAddresses(); // 重新获取地址列表
      } else {
        message.error(data.message || '添加地址失败');
      }
    } catch (error) {
      console.error('添加地址失败:', error);
      message.error('网络错误，添加地址失败');
    }
  };

  const handleEditAddress = (index) => {
    setEditingIndex(index);
    setTempAddress(addresses[index]);
  };

  const handleSaveEdit = async (index) => {
    if (!tempAddress.trim()) {
      message.error('地址不能为空');
      return;
    }

    if (!userId) {
      message.error('用户未登录');
      return;
    }
    
    try {
      // 需要先通过地址内容找到对应的ID
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses/${userId}`);
      const addressData = await response.json();
      
      const targetAddress = addressData.find(item => item.address === addresses[index]);
      if (!targetAddress) {
        message.error('地址不存在');
        return;
      }

      const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses/${targetAddress.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: tempAddress.trim() })
      });

      const updateData = await updateResponse.json();

      if (updateResponse.ok) {
        setEditingIndex(-1);
        setTempAddress('');
        message.success('地址已更新');
        fetchAddresses(); // 重新获取地址列表
      } else {
        message.error(updateData.message || '更新地址失败');
      }
    } catch (error) {
      console.error('更新地址失败:', error);
      message.error('网络错误，更新地址失败');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!userId) {
      message.error('用户未登录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      onOk: async () => {
        try {
          // 需要先通过地址内容找到对应的ID
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses/${userId}`);
          const addressData = await response.json();
          
          const targetAddress = addressData.find(item => item.address === addresses[index]);
          if (!targetAddress) {
            message.error('地址不存在');
            return;
          }

          const deleteResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/addresses/${targetAddress.id}`, {
            method: 'DELETE'
          });

          const deleteData = await deleteResponse.json();

          if (deleteResponse.ok) {
            message.success('地址已删除');
            fetchAddresses(); // 重新获取地址列表
          } else {
            message.error(deleteData.message || '删除地址失败');
          }
        } catch (error) {
          console.error('删除地址失败:', error);
          message.error('网络错误，删除地址失败');
        }
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setTempAddress('');
  };

  return (
    <>
      {/* 地址显示Cell */}
      <div
        onClick={() => setVisible(true)}
        style={{
          padding: '12px 16px',
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.3s',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 40,
          ':hover': {
            borderColor: '#5E81F4',
            boxShadow: '0 0 0 2px rgba(94,129,244,0.1)'
          }
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#5E81F4';
          e.target.style.boxShadow = '0 0 0 2px rgba(94,129,244,0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#d9d9d9';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <EnvironmentOutlined style={{ color: '#5E81F4', marginRight: 8 }} />
          <span style={{ 
            color: value ? '#000' : '#999', 
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value || placeholder}
          </span>
        </div>
        <span style={{ color: '#999', fontSize: 12 }}>
          {addresses.length > 0 && `${addresses.length}个地址`}
        </span>
      </div>

      {/* 地址管理Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#5E81F4', marginRight: 8 }} />
            收货地址管理
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={500}
        style={{ top: 50 }}
      >
        {/* 新增地址 */}
        <Card 
          size="small" 
          style={{ marginBottom: 16, background: '#f8f9ff', border: '1px solid #e6f0ff' }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="输入新地址"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              onPressEnter={handleAddAddress}
              style={{ borderRadius: '6px 0 0 6px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAddress}
              style={{ borderRadius: '0 6px 6px 0' }}
            >
              添加
            </Button>
          </Space.Compact>
        </Card>

        {/* 历史地址列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            加载地址中...
          </div>
        ) : addresses.length > 0 ? (
          <List
            dataSource={addresses}
            renderItem={(address, index) => (
              <List.Item
                style={{
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: index < addresses.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div style={{ width: '100%' }}>
                  {editingIndex === index ? (
                    // 编辑模式
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        onPressEnter={() => handleSaveEdit(index)}
                        autoFocus
                        style={{ borderRadius: '6px 0 0 6px' }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleSaveEdit(index)}
                        style={{ borderRadius: 0 }}
                      >
                        保存
                      </Button>
                      <Button
                        size="small"
                        onClick={handleCancelEdit}
                        style={{ borderRadius: '0 6px 6px 0' }}
                      >
                        取消
                      </Button>
                    </Space.Compact>
                  ) : (
                    // 显示模式
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        onClick={() => handleSelectAddress(address)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderRadius: 6,
                          transition: 'background-color 0.2s',
                          background: value === address ? '#e6f0ff' : 'transparent',
                          border: value === address ? '1px solid #5E81F4' : '1px solid transparent',
                          marginRight: 8
                        }}
                        onMouseEnter={(e) => {
                          if (value !== address) {
                            e.target.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (value !== address) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{ 
                          fontSize: 14, 
                          color: value === address ? '#5E81F4' : '#000',
                          fontWeight: value === address ? 500 : 400
                        }}>
                          {address}
                        </div>
                        {value === address && (
                          <div style={{ fontSize: 12, color: '#5E81F4', marginTop: 2 }}>
                            ✓ 当前选中
                          </div>
                        )}
                      </div>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditAddress(index)}
                          style={{ color: '#5E81F4' }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteAddress(index)}
                          style={{ color: '#ff4d4f' }}
                        />
                      </Space>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#999',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #d9d9d9'
          }}>
            <EnvironmentOutlined style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
            暂无保存的地址
            <br />
            <span style={{ fontSize: 12 }}>在上方输入框添加常用地址</span>
          </div>
        )}

        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ textAlign: 'center' }}>
          <Button onClick={() => setVisible(false)} style={{ borderRadius: 6 }}>
            关闭
          </Button>
        </div>
      </Modal>
    </>
  );
} 