export async function fetchYouTubeTrending(region = "US") {
    const res = await fetch(`/api/youtube?region=${region}`);
    const json = await res.json();
  
    return json.videos.map((video) => ({
      title: video.title,
      url: video.url,
      image: video.image,
      heat: parseInt(video.views), // 用播放量表示热度
      subtitle: video.channel,
    }));
  }