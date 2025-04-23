import { useState } from "react";
import PostCard from "./PostCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Failed to search");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Search Posts by Title</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          className="flex-1 border px-4 py-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title keyword..."
        />
        <button className="bg-blue-500 text-black px-4 rounded hover:bg-blue-600">
          Search
        </button>
      </form>

      {results.length === 0 ? (
        <p className="text-gray-500">No results yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
