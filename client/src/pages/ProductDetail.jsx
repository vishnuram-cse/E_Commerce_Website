import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error('Failed to load product:', err.message);
        setError('Product not found or error loading product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product || product.stock_quantity < quantity) {
      showToast('Insufficient stock!');
      return;
    }

    try {
      const data = await addToCart(product.id, quantity);
      if (data.success) {
        showToast(`${product.name} (${quantity}) added to cart!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add to cart.');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '100px' }}>
        <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error || 'Product details unavailable.'}</p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1100,
          background: 'var(--color-success)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <ShoppingCart size={18} />
          {toast}
        </div>
      )}

      {/* Back Link */}
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        marginBottom: '24px',
        fontWeight: 600,
        transition: 'var(--transition-fast)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={18} />
        Back to Products
      </Link>

      <div className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '40px',
        padding: '40px'
      }}>
        {/* Left: Product Image */}
        <div style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: '#12131a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '450px'
        }}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right: Specifications & Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--color-primary)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {product.category_name || 'Premium Product'}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>
              {product.name}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ${parseFloat(product.price).toFixed(2)}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {product.stock_quantity > 0 ? (
                <>
                  <Check size={16} color="var(--color-success)" />
                  <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {product.stock_quantity} units available
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} color="var(--color-danger)" />
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Temporarily Out of Stock
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Product Overview
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>

          {product.stock_quantity > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Quantity
              </label>
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
                    onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >-</button>
                  <span style={{ padding: '0 8px', minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(q + 1, product.stock_quantity))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >+</button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '12px' }}
            disabled={product.stock_quantity <= 0}
          >
            <ShoppingCart size={20} />
            <span>Add to Shopping Cart</span>
          </button>

          {/* Premium Value Props */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '24px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
              <Truck size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Express Delivery</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>2 Year Warranty</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
              <RefreshCw size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
