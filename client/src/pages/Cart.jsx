import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { cart, updateQty, removeCartItem } = useCart();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  const handleQtyChange = async (itemId, currentQty, stockQty, increment) => {
    setErrorMsg('');
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;

    if (increment && stockQty < newQty) {
      setErrorMsg(`Insufficient stock. Only ${stockQty} items available.`);
      return;
    }

    try {
      await updateQty(itemId, newQty);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update item quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
    } catch (err) {
      setErrorMsg('Failed to remove item.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <ShoppingCart size={48} color="var(--text-muted)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Shopping Cart</h1>

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
        gridTemplateColumns: '3fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map((item) => (
            <div key={item.id} className="glass-panel" style={{
              display: 'flex',
              padding: '20px',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Product Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#ffffff', border: '1px solid var(--border-color)' }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Title & Price */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.name}</h4>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Price: ${parseFloat(item.price).toFixed(2)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <button
                    onClick={() => handleQtyChange(item.id, item.quantity, item.stock_quantity, false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >-</button>
                  <span style={{ padding: '0 4px', minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.id, item.quantity, item.stock_quantity, true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >+</button>
                </div>
              </div>

              {/* Subtotal */}
              <div style={{ fontSize: '1.1rem', fontWeight: 700, width: '100px', textAlign: 'right' }}>
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>

              {/* Remove Action */}
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Summary</h3>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items ({cart.length})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}>
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginTop: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
