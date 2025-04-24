import { trendingItems } from "../data/mockTrending";
import { useEffect, useState } from "react";
import TrendingCard from "./TrendingCard";
import WordCloudChart from "./WordCloudChart";

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
          <h1 className="text-3xl font-bold text-center mb-6">🔥 Trending Dashboard</h1>
    
          <div className="flex flex-col md:flex-row gap-6">
            {/* 左侧词云区域：占 2/3 */}
            <div className="md:w-2/3 bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">🌍 Google Trends WordCloud</h2>
              <WordCloudChart data={googleData} />
            </div>
    
            {/* 右侧卡片区：占 1/3，竖向展示 Reddit / YouTube / HackerNews */}
            <div className="md:w-1/3 flex flex-col gap-4">
              <TrendingCard item={{ platform: "Reddit" }} />
              <TrendingCard item={{ platform: "YouTube" }} />
              <TrendingCard item={{ platform: "HackerNews" }} />
            </div>
          </div>
        </div>
      );
  }