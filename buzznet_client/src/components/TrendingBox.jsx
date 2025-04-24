import { trendingItems } from "../data/mockTrending";
import { useEffect, useState } from "react";
import TrendingCard from "./TrendingCard";

export default function TrendingBox() {
    const [googleData, setGoogleData] = useState([]);

    useEffect(() => {
        fetch("/api/googletrends")
            .then((res) => res.json())
            .then((data) => setGoogleData(data));
    }, []);

    const trendingPlatforms = [
        { platform: "Reddit" },
        { platform: "YouTube" },
        { platform: "HackerNews" },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-center text-5xl font-thin text-indigo-500 mb-6">
                {"BuzzNet - Where Trends Meet Voices.".split("").map((child, idx) => (
                    <span className="hoverText" key={idx}>
                        {child}
                    </span>
                ))}
            </h2>
            <div className="flex flex-col md:flex-row gap-6 ">
                {/* 左侧标语区域 */}
                <div className="md:w-3/7 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-center items-center">
                    <h2 className="text-4xl font-thin mb-2">Stay Updated!</h2>
                    <h2 className="text-gray-600 text-red-300 text-center">
                        Discover the latest trends across platforms and stay ahead of the curve.
                    </h2>
                </div>

                {/* 右侧四宫格区域 */}
                <div className="md:w-4/7 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                    {/* Google Trends */}
                    <div className="flex flex-wrap gap-2 align-center justify-end shadow-2xl p-2 rounded-xl">
                        <h2 className="text-lg font text-indigo-300 ml-3 mb-0.2 ">Google Search Word Trends</h2>
                        {googleData.map((item, index) => (
                            <a
                                href={`https://www.google.com/search?q=${item.title}`}
                                target="_blank"
                                key={index}
                                className="px-2 py-1 text-small font-small bg-indigo-100 text-black hover:scale-105 transition transform shadow-sm"
                            >
                                {item.title}
                            </a>
                        ))}
                    </div>

                    {/* Other Platforms */}
                    <TrendingCard item={{ platform: "Reddit" }} />
                    <TrendingCard item={{ platform: "YouTube" }} />
                    <TrendingCard item={{ platform: "HackerNews" }} />
                </div>
            </div>
        </div>
    );
}