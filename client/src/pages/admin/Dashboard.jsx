import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Spin, message, Tag } from 'antd';
import { Upload, Plus, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockItems: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}` };

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`, { headers }),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/users/customers`, { headers })
      ]);

      const orders = await ordersRes.json();
      const products = await productsRes.json();
      const users = await usersRes.json();

      const successfulOrders = Array.isArray(orders) ? orders.filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Failed' && o.paymentStatus !== 'Returned') : [];
      const totalRevenue = successfulOrders.reduce((acc, order) => acc + order.totalPrice, 0);

      // Identify low-stock variants below threshold (default: 2)
      const lowStock = [];
      if (Array.isArray(products)) {
        products.forEach(p => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach(v => {
              const threshold = typeof v.threshold === 'number' ? v.threshold : 2;
              if ((v.stock || 0) < threshold) {
                lowStock.push({
                  productId: p._id,
                  productName: p.name,
                  image: v.image || (p.images && p.images[0]) || '',
                  size: v.size,
                  color: v.color || '',
                  stock: v.stock || 0,
                  threshold: threshold,
                  price: p.price,
                });
              }
            });
          }
        });
      }

      setStats({
        totalRevenue,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        lowStockItems: lowStock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    if (status === 'Delivered' || status === 'Shipped') return <span className="badge-green"><span className="w-1.5 h-1.5 rounded-full bg-[#048b56] inline-block mr-1.5"></span>{status}</span>;
    if (status === 'Processing') return <span className="badge-yellow"><span className="w-1.5 h-1.5 rounded-full bg-[#b7790b] inline-block mr-1.5"></span>Processing</span>;
    if (status === 'Pending') return <span className="badge-gray"><span className="w-1.5 h-1.5 rounded-full bg-[#8c8c8c] inline-block mr-1.5"></span>Pending</span>;
    if (status === 'Cancelled') return <span className="badge-red" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px' }}><span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] inline-block mr-1.5"></span>Cancelled</span>;
    return <span>{status}</span>;
  };

  const columns = [
    { 
      title: 'Order ID', 
      dataIndex: '_id', 
      key: '_id',
      render: text => <span className="font-bold text-xs">#{text.slice(-8).toUpperCase()}</span>
    },
    { 
      title: 'Customer', 
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{record.shippingDetails.firstName} {record.shippingDetails.lastName}</div>
          <div className="text-xs text-gray-400 mt-0.5">{record.shippingDetails.city}</div>
        </div>
      )
    },
    { 
      title: 'Order Status', 
      dataIndex: 'orderStatus', 
      key: 'orderStatus',
      render: status => renderStatus(status)
    },
    { 
      title: 'Amount (LKR)', 
      dataIndex: 'totalPrice', 
      key: 'totalPrice',
      render: amount => <span className="text-xs font-mono font-medium">Rs. {amount.toLocaleString()}</span>
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</span>
    }
  ];

  if (loading) return <div className="py-20 flex justify-center"><Spin size="large" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Title & Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif text-[#111] mb-2">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, Admin. Here is the daily summary for StyleHub Sri Lanka & islandwide orders.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-6 admin-stat-card h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider">TOTAL REVENUE</span>
                <span className="bg-[#e6f7ee] text-[#048b56] text-[10px] font-bold px-2 py-0.5 rounded">All Time</span>
              </div>
              <div className="text-xl font-serif text-gray-900 leading-tight">Rs.</div>
              <div className="text-4xl font-serif text-gray-900 tracking-tight">{stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="text-xs text-gray-400 mt-4">Verified successful transactions</div>
          </div>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-6 admin-stat-card h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider">TOTAL ORDERS</span>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded">All Time</span>
              </div>
              <div className="text-4xl font-serif text-gray-900 tracking-tight mb-2">{stats.totalOrders}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <span className="w-1.5 h-1.5 bg-[#b7790b] rounded-full"></span>
              Across all platforms
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-6 admin-stat-card h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider w-1/2">TOTAL PRODUCTS</span>
                <span className="bg-[#fcf5e8] text-[#b7790b] text-[10px] font-medium px-2 py-0.5 rounded text-right">In Store</span>
              </div>
              <div className="text-4xl font-serif text-gray-900 tracking-tight">{stats.totalProducts}</div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mt-4">
              <span className="text-gray-400">Manage in Inventory section</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-6 admin-stat-card h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider">TOTAL USERS</span>
                <span className="bg-[#e6f7ee] text-[#048b56] text-[10px] font-bold px-2 py-0.5 rounded">Registered</span>
              </div>
              <div className="text-4xl font-serif text-gray-900 tracking-tight mb-2">{stats.totalUsers}</div>
            </div>
            <div className="text-xs text-gray-500 mt-4">Verified customer accounts</div>
          </div>
        </Col>
      </Row>


      {/* Orders Table */}
      <div className="bg-white admin-table-card admin-table">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif text-gray-900 mb-1">Recent Orders</h2>
            <p className="text-xs text-gray-400">Live transaction ledger across StyleHub platforms</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/orders" className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:text-gray-500 transition-colors">
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={stats.recentOrders} 
          rowKey="_id"
          pagination={false}
        />

        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-[#faf9f7]">
          <span className="text-xs text-gray-500">Showing {stats.recentOrders.length} of {stats.totalOrders} total orders</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
