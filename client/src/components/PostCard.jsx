import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const excerpt = post.content.length > 160 ? post.content.slice(0, 160) + '…' : post.content;
  return (
    <Link
      to={`/post/${post._id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      {post.image && <img src={post.image} alt="" className="h-48 w-full object-cover" />}
      <div className="p-4">
        <h2 className="mb-1 text-lg font-semibold">{post.title}</h2>
        <p className="mb-3 text-sm text-gray-600 whitespace-pre-line">{excerpt}</p>
        <p className="text-xs text-gray-400">
          By {post.author?.username || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
