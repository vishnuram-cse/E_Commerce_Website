import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const limit = 6; // Display 6 products per page

  const urlSearch = searchParams.get('search') || '';

  // Synchronize URL search parameter with search state and reset to page 1
  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        categoryId: selectedCategory || undefined,
        search: search.trim() || undefined
      };
      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (product.stock_quantity <= 0) {
      showToast('danger', 'This product is out of stock!');
      return;
    }

    try {
      const data = await addToCart(product.id, 1);
      if (data.success) {
        showToast('success', `${product.name} added to cart!`);
      }
    } catch (error) {
      showToast('danger', error.message || 'Could not add to cart.');
    }
  };

  const showToast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  return (
    <div className="container animate-fade-in">
      {/* Toast Notification */}
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
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {msg.type === 'success' ? <ShoppingCart size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: '#ffffff',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          Discover V-Bazaar Products
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Your one-stop bazaar for electronics, fashion, home essentials, and more — all in one place.
        </p>
      </div>

      {/* Controls Container (Categories Filter) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Filter by Category
        </span>
        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          whiteSpace: 'nowrap'
        }}>
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={40} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No products found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {products.map((prod) => (
              <div key={prod.id} className="glass-panel" style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'var(--transition-normal)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/product/${prod.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'>
                
                {/* Product Image */}
                <div style={{ width: '100%', height: '200px', overflow: 'hidden', background: '#ffffff', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                  <img
                    src={prod.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {prod.stock_quantity <= 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {prod.category_name || 'Uncategorized'}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineClamp: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {prod.name}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    height: '38px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {prod.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{parseFloat(prod.price).toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: prod.stock_quantity > 5 ? 'var(--color-success)' : prod.stock_quantity > 0 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                      {prod.stock_quantity > 5 ? `${prod.stock_quantity} In Stock` : prod.stock_quantity > 0 ? `Only ${prod.stock_quantity} left!` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px' }}
                      disabled={prod.stock_quantity <= 0}
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '16px'
          }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              <ArrowLeft size={16} />
              <span>Prev</span>
            </button>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
