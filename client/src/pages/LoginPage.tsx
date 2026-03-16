import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(username, password);
      } else {
        await register(username, password, displayName || username);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Groven</h1>
        <p className="login-subtitle">Where public thinking becomes collective action</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                className="form-input"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="How others will see you"
              />
            </div>
          )}
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
            {loading ? 'Loading...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo accounts: elena, marcus, sofia, david, anna (password: password)</p>
        </div>
      </div>
    </div>
  );
}
