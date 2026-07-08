import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../context/AuthContext';
import { CheckCircle2, ClipboardList, ShoppingBag, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorMsg('Shipping address is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/orders', { shipping_address: shippingAddress });
      if (res.data.success) {
        setOrderSuccess(res.data.order);
        // Clear global cart count immediately
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <CheckCircle2 size={56} color="var(--color-success)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Thank you for your purchase. Your order <strong>#VBZ-{orderSuccess.id}</strong> has been successfully placed.
          </p>
          
          <div style={{
            width: '100%',
            background: 'rgba(0,0,0,0.1)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.9rem',
            margin: '10px 0'
          }}>
            <div><strong>Deliver to:</strong> {orderSuccess.shipping_address}</div>
            <div><strong>Total Paid:</strong> ${parseFloat(orderSuccess.total_amount).toFixed(2)}</div>
            <div><strong>Status:</strong> <span className="badge badge-pending">{orderSuccess.status}</span></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
            <Link to="/orders" className="btn btn-primary" style={{ flex: 1 }}>
              <ClipboardList size={16} />
              <span>View Order History</span>
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
              <ShoppingBag size={16} />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Empty Checkout</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have items in your cart to proceed with checkout.</p>
          <Link to="/" className="btn btn-primary">
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <Link to="/cart" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        marginBottom: '24px',
        fontWeight: 600
      }}>
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Checkout</h1>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--color-danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Shipping Address form */}
        <form onSubmit={handlePlaceOrder} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Shipping Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Full Delivery Address
            </label>
            <textarea
              className="input-field"
              placeholder="123 Neon Boulevard, Cyber City, CA 90210"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows="4"
              style={{ resize: 'none' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing Order...' : `Place Order ($${subtotal.toFixed(2)})`}
          </button>
        </form>

        {/* Order Summary Side-Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Qty: {item.quantity} x ${parseFloat(item.price).toFixed(2)}</span>
                </div>
                <span style={{ fontWeight: 700 }}>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.15rem',
              fontWeight: 800,
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              marginTop: '4px'
            }}>
              <span>Total Payment</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
