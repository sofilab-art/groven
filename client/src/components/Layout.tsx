import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-back" title="Back to Grove">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <Link to="/" className="nav-logo">Groven</Link>
        </div>
        <div className="nav-right">
          {user && (
            <>
              <span className="nav-user">{user.display_name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
