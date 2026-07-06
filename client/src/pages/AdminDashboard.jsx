import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Save, 
  X,
  PlusCircle,
  FolderOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'categories'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImg, setProductImg] = useState('');
  const [productCatId, setProductCatId] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Stats
  const [stats, setStats] = useState({ productsCount: 0, ordersCount: 0, totalRevenue: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await api.get('/categories');
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }

      // 2. Fetch all products (admin/pagination-less, let's load first 100 for simplicity)
      const prodRes = await api.get('/products?limit=100');
      let productsList = [];
      if (prodRes.data.success) {
        productsList = prodRes.data.products;
        setProducts(productsList);
      }

      // 3. Fetch all orders
      const orderRes = await api.get('/admin/orders');
      let ordersList = [];
      if (orderRes.data.success) {
        ordersList = orderRes.data.orders;
        setOrders(ordersList);
      }

      // 4. Calculate Stats
      const productsCount = productsList.length;
      const ordersCount = ordersList.length;
      const totalRevenue = ordersList
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      setStats({ productsCount, ordersCount, totalRevenue });
    } catch (err) {
      console.error('Error fetching admin data:', err.message);
      showToast('danger', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice || !productStock) {
      showToast('danger', 'Required fields are missing.');
      return;
    }

    const payload = {
      name: productName.trim(),
      description: productDesc.trim(),
      price: parseFloat(productPrice),
      stock_quantity: parseInt(productStock),
      image_url: productImg.trim(),
      category_id: productCatId ? parseInt(productCatId) : null
    };

    try {
      if (editingProductId) {
        const res = await api.put(`/products/${editingProductId}`, payload);
        if (res.data.success) {
          showToast('success', 'Product updated successfully.');
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          showToast('success', 'Product created successfully.');
        }
      }
      resetProductForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('danger', err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductDesc(prod.description || '');
    setProductPrice(prod.price);
    setProductStock(prod.stock_quantity);
    setProductImg(prod.image_url || '');
    setProductCatId(prod.category_id || '');
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        showToast('success', 'Product deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('danger', 'Could not delete product. It may be referenced in past orders.');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await api.post('/categories', { name: newCategoryName.trim() });
      if (res.data.success) {
        showToast('success', `Category "${newCategoryName}" created!`);
        setNewCategoryName('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('danger', err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast('success', `Order #${orderId} status set to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('danger', 'Failed to update order status.');
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductName('');
    setProductDesc('');
    setProductPrice('');
    setProductStock('');
    setProductImg('');
    setProductCatId('');
    setShowProductForm(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading administrative modules...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Toast */}
      {msg.text && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1100,
          background: msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 600
        }}>
          {msg.text}
        </div>
      )}

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Admin Dashboard</h1>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Products */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <Package size={28} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL PRODUCTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.productsCount}</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <ShoppingBag size={28} color="var(--color-accent)" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL ORDERS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.ordersCount}</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <DollarSign size={28} color="var(--color-success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* 1. Products Management View */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Catalog Inventory</h2>
            {!showProductForm && (
              <button onClick={() => setShowProductForm(true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form Modal-like panel */}
          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {editingProductId ? 'Edit Product Specifications' : 'New Product Entry'}
                </h3>
                <button type="button" onClick={resetProductForm} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</label>
                  <input type="text" className="input-field" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price ($)</label>
                  <input type="number" step="0.01" className="input-field" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Quantity</label>
                  <input type="number" className="input-field" value={productStock} onChange={(e) => setProductStock(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                  <select className="input-field" value={productCatId} onChange={(e) => setProductCatId(e.target.value)} style={{ height: '45px', appearance: 'auto' }}>
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Image URL</label>
                <input type="text" className="input-field" placeholder="https://example.com/image.jpg" value={productImg} onChange={(e) => setProductImg(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
                <textarea className="input-field" rows="3" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={resetProductForm} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>{editingProductId ? 'Update Product' : 'Save Entry'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Products Table */}
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px' }}>PRODUCT</th>
                  <th style={{ padding: '16px' }}>CATEGORY</th>
                  <th style={{ padding: '16px' }}>PRICE</th>
                  <th style={{ padding: '16px' }}>STOCK</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#1c1d24' }}>
                        <img src={prod.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{prod.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {prod.category_name || 'Uncategorized'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      ${parseFloat(prod.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', color: prod.stock_quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                      {prod.stock_quantity}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEditProduct(prod)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger" style={{ padding: '6px 10px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Orders Management View */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Client Orders Ledger</h2>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px' }}>ORDER ID</th>
                  <th style={{ padding: '16px' }}>CUSTOMER</th>
                  <th style={{ padding: '16px' }}>DATE</th>
                  <th style={{ padding: '16px' }}>TOTAL</th>
                  <th style={{ padding: '16px' }}>STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>TOGGLE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>#ORB-{order.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div>{order.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.user_email}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700 }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="input-field"
                        style={{ width: '130px', padding: '6px 10px', height: '35px', display: 'inline-block', appearance: 'auto' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Category Management View */}
      {activeTab === 'categories' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Add Category Form */}
          <form onSubmit={handleCategorySubmit} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Smart Wearables" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              <PlusCircle size={16} />
              <span>Create Category</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Available Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat, idx) => (
                <div key={cat.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}>
                  <FolderOpen size={16} color="var(--color-primary)" />
                  <span>{cat.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>ID: {cat.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
