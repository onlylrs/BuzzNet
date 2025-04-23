import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { Link } from 'react-router-dom';

export default function PostGrid() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch("/api/posts");
                const data = await res.json();
                setPosts(data);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            }
        }

        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen px-4 py-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                BuzzNet🐝
            </h1>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
            <Link
                to="/create"
                className="fixed bottom-6 right-6 bg-blue-100 hover:bg-blue-300 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-3xl z-50"
                title="Create New Post"
            >
                ＋
            </Link>
            <Link
                to="/search"
                className="fixed bottom-24 right-6 bg-purple-500 hover:bg-purple-600 text-white w-14 h-14 rounded-full shadow flex items-center justify-center text-2xl z-50"
            >
                🔍
            </Link>
        </div>
    );
}