export async function fetchHackerNewsTrending() {
    const res = await fetch("/api/hackernews");
    return await res.json();
  }