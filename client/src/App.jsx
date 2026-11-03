import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PostPage from './pages/PostPage.jsx';
import PostForm from './pages/PostForm.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Loading...</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/create" element={<Protected><PostForm /></Protected>} />
          <Route path="/edit/:id" element={<Protected><PostForm /></Protected>} />
          <Route path="*" element={<p className="text-center">Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
