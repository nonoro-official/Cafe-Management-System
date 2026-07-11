import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const LoginPage = () => {
  useDocumentTitle(`${APP_NAME} | Sign in`);
  const { login, isAuthenticated, checking } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!checking && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="admin-brand admin-brand--stacked">
          <div className="admin-brand__mark">
            <span>M</span>
          </div>
          <div>
            <div className="admin-brand__name">MODA</div>
            <div className="admin-brand__role">Manager Dashboard</div>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="field-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="auth-hint">
          Use the seeded admin account (<code>SEED_ADMIN_EMAIL</code> / <code>SEED_ADMIN_PASSWORD</code> from
          the server&apos;s <code>.env</code>) after running <code>npm run seed</code>.
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
