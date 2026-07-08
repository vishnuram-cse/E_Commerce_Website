import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  LogIn,
  Search
} from 'lucide-react';

const Logo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="28" 
    height="28" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#ffffff" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}
  >
    {/* Shopping Bag Outline */}
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
    {/* Bold Letter V */}
    <path d="M9.5 11.5L12 16.5L14.5 11.5" stroke="#ffffff" strokeWidth="2.5" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Sync search input with URL search query param if we are on Home page
  useEffect(() => {
    if (location.pathname === '/') {
      setSearchQuery(searchParams.get('search') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Logo />
        <span>V-Bazaar</span>
      </Link>

      {/* Global Search Bar */}
      <div className="nav-search-container">
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search products, categories, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="nav-search-button">
            <Search size={18} />
          </button>
        </form>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <span>Catalog</span>
          </Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/cart" className={`nav-link nav-link-cart ${isActive('/cart')}`}>
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
              </Link>
            </li>
            
            <li>
              <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                <ClipboardList size={18} />
                <span>My Orders</span>
              </Link>
            </li>

            {user.role === 'admin' && (
              <li>
                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                  <LayoutDashboard size={18} />
                  <span>Admin</span>
                </Link>
              </li>
            )}

            <div className="nav-user">
              <span className="user-tag">{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <li>
            <Link to="/login" className={`btn btn-primary ${isActive('/login')}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
