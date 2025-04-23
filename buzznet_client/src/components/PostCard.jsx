import React from "react";
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
    const hasImage = !!post.image_url;

    const reload = async () => {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        setPost(data.post);
        setComments(data.comments);
      };

      
    return (<Link to={`/posts/${post.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
            {/* 上半部分：图片或纯文字内容 */}
            {hasImage ? (
                <img
                    src={post.image_url}
                    alt="Post Cover"
                    className="w-full h-52 object-cover"
                />
            ) : (
                <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gray-50">
                    <p className="text-base font-medium text-gray-700 text-center leading-snug">
                        {post.content}
                    </p>
                </div>
            )}

            {/* 下半部分：标题 + 元信息 */}
            <div className="p-4 flex flex-col gap-2">
                <h2 className="text-md font-bold text-gray-900 leading-snug line-clamp-2">
                    {post.title || 'Untitled'}
                </h2>

                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>❤️ {post.like_count}</span>
                    <span>💬 {post.comment_count}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    </Link>
    );
}