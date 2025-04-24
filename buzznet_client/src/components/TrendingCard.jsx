import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TrendingCard({ item }) {
  const { platform } = item;

  const [title, setTitle] = useState(item.title);
  const [image, setImage] = useState(item.image);

  useEffect(() => {
    if (platform.toLowerCase() === "reddit") {
      fetch("/api/reddit?sub=popular")
        .then((res) => res.json())
        .then((data) => {
          const post = data.topPost;
          setTitle(post?.title || "Reddit Trending");
          if (post?.thumbnail?.startsWith("http")) {
            // setImage(post.thumbnail);
            setImage("https://www.logo.wine/a/logo/Reddit/Reddit-Logomark-White-Dark-Background-Logo.wine.svg")
          }else{
            setImage("https://www.logo.wine/a/logo/Reddit/Reddit-Logomark-White-Dark-Background-Logo.wine.svg")
          }
        })
        .catch((err) =>
          console.error("❌ Failed to fetch reddit top post:", err)
        );
    }

    if (platform.toLowerCase() === "youtube") {
        fetch("/api/youtube")
          .then((res) => res.json())
          .then((data) => {
            const video = data.videos?.[0]; // 取第一条
            setTitle(video?.title || "YouTube Trending");
            setImage(video?.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/YouTube_play_button_square_%282013-2017%29.svg/2048px-YouTube_play_button_square_%282013-2017%29.svg.png");
          })
          .catch((err) =>
            console.error("❌ Failed to fetch youtube trending video:", err)
          );
      }

    if (platform.toLowerCase() === "hackernews") {
      fetch("/api/hackernews")
        .then((res) => res.json())
        .then((data) => {
          const post = data.reduce((max, item) => 
            item.heat > max.heat ? item : max, data[0]);
          setTitle(post?.title || "Hacker News Trending");
          setImage(post?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbLTb8taE7uno2irueFgHCUGq0gb0MvbrkRQ&s");
        })
        .catch((err) =>
          console.error("❌ Failed to fetch hackernews top post:", err)
        );
    }

  }, [platform]);

  


  return (
    <Link to={`/trending/${platform.toLowerCase()}`}>
      <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition overflow-hidden hover:scale-105 transition transform">
        {image && (
          <img src={image} alt={title} className="w-full h-48 object-cover" />
        )}
        <div className="p-4 flex flex-col gap-1">
          <h2 className="text-md font-bold text-gray-800 line-clamp-2">
            {title}
          </h2>
          <p className="text-sm text-red-500 hover:underline mt-1">
            See {platform} Trends →
          </p>
        </div>
      </div>
    </Link>
  );
}
