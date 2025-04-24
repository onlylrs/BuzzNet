import PostGrid from "./PostGrid";
import { trendingItems } from "../data/mockTrending";
import TrendingCard from "./TrendingCard";
import TrendingBox from "./TrendingBox";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Trending 区域 */}
      <div className="mb-5">
        <TrendingBox />
      </div>

      {/* 帖子列表区域 */}
      <PostGrid />
    </div>
  );
}
