import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const maxTitleLength = 40;
  const navigate = useNavigate(); // 跳转 hook

  const user = useAuth(); // 登录用户
  const user_id = user?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) return alert("Please login to post.");

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id, // mock user ID
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim() || null,
        }),
      });

      if (res.ok) {
        alert("🎉 Post created!");
        setTitle("");
        setContent("");
        setImageUrl("");
        setPreview("");
        navigate("/"); // 自动跳转回首页
      } else {
        alert("❌ Failed to create post.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-10">
      <h2 className="text-2xl font-bold mb-4">📝 Create a New Post</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-xs text-gray-400">({title.length}/{maxTitleLength})</span>
          </label>
          <input
            type="text"
            value={title}
            maxLength={maxTitleLength}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Share your thoughts..."
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreview(e.target.value);
            }}
            className="w-full border rounded-md px-3 py-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="rounded-md border max-h-48 mx-auto"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
        >
          Publish ✨
        </button>
      </form>
    </div>
  );
}
