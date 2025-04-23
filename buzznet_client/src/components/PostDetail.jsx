import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [likeCount, setLikeCount] = useState(0);

    const user = useAuth();
    const user_id = user?.uid;
    const navigate = useNavigate(); // 跳转 hook



    const reload = async () => {
        try {
            const res = await fetch(`/api/posts/${id}`);
            const data = await res.json();
            setPost(data.post);
            setComments(data.comments);
            setLikeCount(data.like_count);
        } catch (err) {
            console.error("Error loading post:", err);
        }
    };

    useEffect(() => {
        reload();
    }, [id]);


    const handleLike = async () => {
        if (!user_id) return alert("Login first!");
        try {
            await fetch(`/api/posts/${id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id }),
            });
            await reload();
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };


    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user_id) return alert("Login first!");
        if (!newComment.trim()) return;
        console.log("🧪 Clicked comment button");
        console.log("Sending to:", `/api/posts/${id}/comment`);
        console.log("Payload:", { user_id, content: newComment });
        try {
            await fetch(`/api/posts/${id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, content: newComment }),
            });
            setNewComment("");
            await reload();
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const handleDelete = async () => {
        try {
          const res = await fetch(`/api/posts/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user?.uid })
          });
      
          if (res.ok) {
            alert("✅ Post deleted!");
            navigate("/");
            return;
          } else {
            const text = await res.text();
            alert("❌ Failed to delete post: " + text);
          }
        } catch (err) {
          console.error("❌ Fetch error:", err);
          alert("❌ Network error while deleting post.");
        }
      };


    if (!post) return <div className="p-6 text-center text-gray-500">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white rounded-lg shadow mt-6">
            {/* 图片 */}
            {post.image_url && (
                <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full h-64 object-cover rounded-md mb-4"
                />
            )}

            {/* 标题 & 内容 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
            {post.content && (
                <p className="text-gray-800 text-base mb-4 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            )}
            <p className="text-sm text-gray-500 mb-4">
                Posted by @{post.username} on {new Date(post.created_at).toLocaleDateString()}
            </p>

            {/* 点赞 */}
            <button
                onClick={handleLike}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-black px-4 py-1 rounded mb-6"
            >
                ❤️ Like ({likeCount})
            </button>

            {post.user_id === user?.uid && (
                <button
                    onClick={handleDelete}
                    className="text-red-500 border px-3 py-1 rounded hover:bg-red-100 text-sm mt-4"
                >
                    🗑️ Delete Post
                </button>
            )}

            {/* 评论列表 */}
            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
                {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet.</p>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="mb-3 border-b pb-2">
                            <p className="text-sm text-gray-800">{c.content}</p>
                            <p className="text-xs text-gray-500">by @{c.username} at {c.created_at}</p>
                        </div>
                    ))
                )}
            </div>

            {/* 评论表单 */}
            <form onSubmit={handleCommentSubmit} className="mt-4 flex flex-col gap-2">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Write a comment..."
                    className="w-full border px-3 py-2 rounded-md"
                />
                <button
                    type="submit"
                    className="self-end bg-green-500 hover:bg-green-600 text-black px-4 py-1 rounded"
                >
                    Comment 💬
                </button>
            </form>
        </div>
    );
}
