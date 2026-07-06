import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  ShoppingCart, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  LogIn 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

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
        <ShoppingBag size={26} color="#6366f1" />
        <span>OrbitStore</span>
      </Link>

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
