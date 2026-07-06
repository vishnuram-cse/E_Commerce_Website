import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { ClipboardList, Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // If order details are already fetched, don't fetch again
    if (orderDetails[orderId]) return;

    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: res.data.order
        }));
      }
    } catch (err) {
      console.error(`Error fetching order details for order ${orderId}:`, err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ClipboardList size={28} color="var(--color-primary)" />
        <span>My Orders</span>
      </h1>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={40} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No orders found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet. Start shopping!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const details = orderDetails[order.id];

            return (
              <div key={order.id} className="glass-panel" style={{
                overflow: 'hidden',
                transition: 'var(--transition-normal)'
              }}>
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleOrderDetails(order.id)}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '16px',
                    background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ORDER REFERENCE</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>#ORB-{order.id}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DATE PLACED</div>
                      <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <Calendar size={14} />
                        {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL AMOUNT</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(0,0,0,0.1)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Shipping Address</h4>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} />
                        {order.shipping_address}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Order Items</h4>
                      {!details ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading items details...</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {details.items.map((item) => (
                            <div key={item.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              padding: '12px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#1c1d24', border: '1px solid var(--border-color)' }}>
                                  <img 
                                    src={item.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'} 
                                    alt={item.product_name || 'Deleted Product'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                    {item.product_name || 'Product No Longer Available'}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Quantity: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                ${parseFloat(item.price_at_purchase).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
