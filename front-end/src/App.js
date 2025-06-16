import React, { useState } from 'react';
import MenuSelect from './components/MenuSelect';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import SupplierPanel from './components/SupplierPanel';
import Login from './components/Login';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [tab, setTab] = useState('merchant');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  const handleLogin = (uid, r) => {
    setUserId(uid);
    setRole(r);
    localStorage.setItem('userId', uid);
    localStorage.setItem('role', r);
  };

  const handleLogout = () => {
    setUserId('');
    setRole('');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  };

  if (!userId) {
    return <Login onLogin={handleLogin} />;
  }

  // 判断是否为供应商界面
  const isSupplier = role === 'supplier';

  if (role === 'merchant') {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ float: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, color: '#222', fontWeight: 500 }}>{userId}</span>
            <button onClick={handleLogout} style={{ borderRadius: 8, border: '1px solid #bbb', padding: '4px 16px', background: '#fafbfc', cursor: 'pointer', fontSize: 16 }}>退出</button>
          </span>
        </div>
        <h1>商家界面</h1>
        <MenuSelect />
        <OrderForm onOrder={() => setRefresh(!refresh)} />
        <OrderList refresh={refresh} userId={userId} />
      </div>
    );
  }

  // 供应商界面：用户名和退出按钮放到卡片内部
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 0 }} />
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, color: '#222', fontWeight: 500 }}>{userId}</span>
            <button onClick={handleLogout} style={{ borderRadius: 8, border: '1px solid #bbb', padding: '4px 16px', background: '#fafbfc', cursor: 'pointer', fontSize: 16 }}>退出</button>
          </span>
        </div>
      </div>
      <SupplierPanel />
    </div>
  );
}

export default App; 