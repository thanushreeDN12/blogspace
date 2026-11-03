import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/posts/${id}`).then(setPost).catch((e) => setError(e.message));
    api(`/posts/${id}/comments`).then(setComments).catch(() => {});
  }, [id]);

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const c = await api(`/posts/${id}/comments`, { method: 'POST', body: { text } });
      setComments([c, ...comments]);
      setText('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComment = async (cid) => {
    try {
      await api(`/comments/${cid}`, { method: 'DELETE' });
      setComments(comments.filter((c) => c._id !== cid));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!post) return <p className="text-center">{error || 'Loading...'}</p>;
  const isOwner = user && post.author && user.id === post.author._id;

  return (
    <article className="mx-auto max-w-2xl">
      {post.image && <img src={post.image} alt="" className="mb-6 max-h-96 w-full rounded-xl object-cover" />}
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-gray-500">
        By {post.author?.username || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {isOwner && (
        <div className="mb-6 flex gap-3">
          <Link to={`/edit/${post._id}`} className="btn-ghost">Edit</Link>
          <button onClick={deletePost} className="btn-danger">Delete</button>
        </div>
      )}

      <div className="mb-10 whitespace-pre-line leading-relaxed">{post.content}</div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Comments ({comments.length})</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        {user ? (
          <form onSubmit={addComment} className="mb-6 space-y-2">
            <textarea className="input h-24" placeholder="Leave a comment..." value={text}
              onChange={(e) => setText(e.target.value)} maxLength={1000} required />
            <button className="btn">Post comment</button>
          </form>
        ) : (
          <p className="mb-6 text-sm">
            <Link to="/login" className="text-indigo-600">Log in</Link> to leave a comment.
          </p>
        )}

        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c._id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>{c.author?.username || 'Unknown'} · {new Date(c.createdAt).toLocaleString()}</span>
                {user && c.author && user.id === c.author._id && (
                  <button onClick={() => deleteComment(c._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                )}
              </div>
              <p className="whitespace-pre-line">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
