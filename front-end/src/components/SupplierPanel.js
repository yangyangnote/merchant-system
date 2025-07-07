import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space, Pagination, message } from 'antd';

export default function SupplierPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20, // 供应商需要看更多订单，设置大一些
    total: 0,
    totalPages: 0
  });

  const fetchOrders = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();
      
      if (result.data) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        // 兼容旧版本API
        setOrders(result);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, []);

  const updateOrder = async (id, api, body) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/supplier/${api}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      message.success('操作成功');
      // 重新加载当前页面数据
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('操作失败');
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

  // 计算当前页面的订单统计
  const paidOrders = orders.filter(order => order.status === '已支付');
  const completedOrders = orders.filter(order => order.status === '已完成');

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(94,129,244,0.06)', margin: '24px 0' }} bodyStyle={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#5E81F4', fontWeight: 600, margin: 0 }}>供应商订单管理</h2>
        {pagination.total > 0 && (
          <div style={{ color: '#666', fontSize: 14 }}>
            <Space>
              <span>共 {pagination.total} 条订单</span>
              <span>|</span>
              <span>已支付: {paidOrders.length}</span>
              <span>已完成: {completedOrders.length}</span>
            </Space>
          </div>
        )}
      </div>
      {/* 已支付订单列表 */}
      <h3 style={{ fontWeight: 600, marginTop: 24 }}>已支付订单</h3>
      <List
        loading={loading}
        dataSource={paidOrders}
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
                <div style={{ color: '#666' }}>联系人：{order.contact_name || '未填写'}</div>
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
        loading={loading}
        dataSource={completedOrders}
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
                <div style={{ color: '#666' }}>联系人：{order.contact_name || '未填写'}</div>
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
      
      {/* 分页组件 - 始终显示，让用户随时调整每页数量 */}
      {pagination.total > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条订单`}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            pageSizeOptions={['10', '20', '50', '100']}
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