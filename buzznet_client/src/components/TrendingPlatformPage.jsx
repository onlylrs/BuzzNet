import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRedditTrending } from "../data/fetchRedditTrending";
import { fetchYouTubeTrending } from "../data/fetchYouTubeTrending";
import { fetchHackerNewsTrending } from "../data/fetchHackerNewsTrending";
import Heatmap from "./Heatmap";

export default function TrendingPlatformPage() {
    const { platform } = useParams();
    const [items, setItems] = useState([]);
    const [timer, setTimer] = useState();
    useEffect(() => {
        let timer;

        const fetchData = async () => {
            if (platform === "reddit") {
                const data = await fetchRedditTrending();
                setItems(data);
                setTimer(60)
                timer = setInterval(fetchData, 60 * 1000); // 每60s更新一次
            } else if (platform === "youtube") {
                const data = await fetchYouTubeTrending("US"); // 可改为 "CN"
                setItems(data);
                setTimer(60)
                timer = setInterval(fetchData, 60 * 1000); // 每60s更新一次
            } else if (platform === "hackernews") {
                const data = await fetchHackerNewsTrending();
                setItems(data);
                setTimer(60)
                timer = setInterval(fetchData, 60 * 1000); // 每60s更新一次
            }
        };
        fetchData();
        return () => clearInterval(timer); // 清理定时器
    }, [platform]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{platform} Trending</h1>

            <Heatmap items={items} timer={timer} />

            <div className="mt-6 flex flex-col gap-4">
                {platform === "youtube" ? (
                    // YouTube 样式（图文卡片）
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item, index) => (
                            <a
                                key={index}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition"
                            >
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-32 object-cover"
                                    />
                                )}
                                <div className="p-4 flex flex-col gap-2">
                                    <h2 className="text-md font-bold text-gray-800 line-clamp-2">
                                        {item.title}
                                    </h2>
                                    {item.subtitle && (
                                        <p className="text-sm text-gray-500">@{item.subtitle}</p>
                                    )}
                                    <p className="text-xs text-orange-500">🔥 Views: {item.heat}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    // 默认样式（如 Reddit，纯文字）
                    <div className="mt-6 flex flex-col gap-4">
                        {items.map((item, index) => (
                            <a
                                key={index}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded border shadow hover:shadow-lg transition bg-white"
                            >
                                <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
                                <p className="text-xs mt-1 text-gray-400">🔥 Heat: {item.heat}</p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
