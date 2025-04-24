export async function fetchRedditTrending() {
    const res = await fetch('/api/reddit?sub=popular');
    const json = await res.json();
  
    if (!json.posts || !Array.isArray(json.posts)) {
      return [];
    }
  
    const result = json.posts.map((post) => ({
      title: post.title,
      url: "https://reddit.com" + post.permalink,
      author: post.author,
      heat: post.score,
      image: post.thumbnail?.startsWith("http") ? post.thumbnail : null,
    }));
  
    return result;
  }