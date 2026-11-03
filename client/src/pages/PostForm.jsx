import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function PostForm() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/posts/${id}`)
      .then((p) => {
        setTitle(p.title);
        setContent(p.content);
        setExistingImage(p.image);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const preview = file ? URL.createObjectURL(file) : removeImage ? '' : existingImage;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', content);
      if (file) fd.append('image', file);
      if (removeImage) fd.append('removeImage', 'true');
      const post = await api(id ? `/posts/${id}` : '/posts', {
        method: id ? 'PUT' : 'POST',
        body: fd,
      });
      navigate(`/post/${post._id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{id ? 'Edit post' : 'Write a post'}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input className="input" placeholder="Title" value={title} maxLength={150}
        onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="input h-64" placeholder="Write your story..." value={content}
        onChange={(e) => setContent(e.target.value)} required />

      <div>
        <label className="mb-1 block text-sm font-medium">Cover image (optional, max 5MB)</label>
        <input type="file" accept="image/*"
          onChange={(e) => { setFile(e.target.files[0] || null); setRemoveImage(false); }} />
        {preview && <img src={preview} alt="preview" className="mt-3 max-h-60 rounded-lg" />}
        {id && existingImage && !file && (
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
            Remove current image
          </label>
        )}
      </div>

      <div className="flex gap-3">
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : id ? 'Update' : 'Publish'}</button>
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
