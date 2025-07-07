import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Space, message, Pagination } from 'antd';

export default function OrderList({ refresh, userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // 每页5条，界面不会太长
    total: 0,
    totalPages: 0
  });

  const fetchOrders = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order?userId=${userId}&page=${page}&pageSize=${pageSize}`);
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        setOrders(result.data);
        setPagination(result.pagination || {
          current: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        });
      } else if (Array.isArray(result)) {
        // 兼容旧版本API返回格式
        setOrders(result);
        setPagination({
          current: 1,
          pageSize: result.length,
          total: result.length,
          totalPages: 1
        });
      } else {
        // 确保orders始终是数组
        setOrders([]);
        setPagination({
          current: 1,
          pageSize: 5,
          total: 0,
          totalPages: 0
        });
        console.error('订单数据格式错误:', result);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败');
      setOrders([]);
      setPagination({
        current: 1,
        pageSize: 5,
        total: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, [refresh, userId]);

  const handleCancel = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/order/cancel/${id}`, { method: 'POST' });
      message.success('订单已取消');
      // 重新加载当前页面数据
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('取消订单失败');
    }
  };

  const handlePay = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/order/pay/${id}`, { method: 'POST' });
      message.success('支付成功');
      // 重新加载当前页面数据
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('支付失败');
    }
  };

  const handlePageChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
  };

  // 页码跳转的优化交互
  useEffect(() => {
    const handleQuickJumperBlur = () => {
      // 监听分页输入框的失去焦点事件
      const quickJumperInput = document.querySelector('.ant-pagination-options-quick-jumper input');
      if (quickJumperInput) {
        quickJumperInput.addEventListener('blur', (e) => {
          const value = parseInt(e.target.value);
          if (value && value !== pagination.current && value >= 1 && value <= pagination.totalPages) {
            handlePageChange(value, pagination.pageSize);
            e.target.value = ''; // 清空输入框
          }
        });
      }
    };

    // 延迟执行，确保DOM已渲染
    const timer = setTimeout(handleQuickJumperBlur, 100);
    return () => clearTimeout(timer);
  }, [pagination.current, pagination.totalPages, pagination.pageSize]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#5E81F4', fontWeight: 600, margin: 0 }}>订单列表</h2>
        {pagination.total > 0 && (
          <span style={{ color: '#666', fontSize: 14 }}>
            共 {pagination.total} 条订单
          </span>
        )}
      </div>
      
      <List
        loading={loading}
        dataSource={orders}
        locale={{ emptyText: '暂无订单' }}
        renderItem={order => (
          <List.Item style={{ padding: 0, marginBottom: 16, border: 'none' }}>
            <Card
              style={{ width: '100%', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(94,129,244,0.04)' }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#222' }}>
                    {(() => {
                      try {
                        const items = JSON.parse(order.items);
                        if (Array.isArray(items)) {
                          return items.map(item => 
                            `${item.name} x ${item.quantity} (￥${Number(item.price).toFixed(2)})`
                          ).join(', ');
                        } else {
                          return '订单商品信息错误';
                        }
                      } catch (error) {
                        console.error('解析订单商品失败:', error);
                        return '订单商品信息错误';
                      }
                    })()}
                  </div>
                  {order.order_no && (
                    <div style={{ fontSize: 12, color: '#999', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
                      订单号: {order.order_no}
                    </div>
                  )}
    </div>
                <div style={{ color: '#666' }}>地址：{order.address}</div>
                <div style={{ color: '#666' }}>联系人：{order.contact_name || '未填写'}</div>
                <div style={{ color: '#666' }}>电话：{order.phone}</div>
                <div>{renderStatusButton(order)}</div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      
      {/* 分页组件 - 始终显示，让用户随时调整每页数量 */}
      {pagination.total > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            pageSizeOptions={['5', '10', '20', '50']}
            size="default"
            locale={{
              items_per_page: '条/页',
              jump_to: '跳至',
              jump_to_confirm: '确定',
              page: '页'
            }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            💡 提示：在页码输入框中输入页数，按↩︎或点击其他地方即可跳转
          </div>
        </div>
      )}
    </Card>
  );
} 