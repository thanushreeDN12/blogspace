import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input className="input" placeholder="Username" value={username}
        onChange={(e) => setUsername(e.target.value)} required minLength={3} />
      <input className="input" type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" placeholder="Password (min 6 chars)" value={password}
        onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      <button className="btn w-full" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      <p className="text-center text-sm">
        Already registered? <Link to="/login" className="text-indigo-600">Login</Link>
      </p>
    </form>
  );
}
