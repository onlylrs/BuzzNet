import express from 'express'
import pg from 'pg';
import cors from 'cors'
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Parser from 'rss-parser';

dotenv.config();

const app = express()
const port = 3000

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'runrun2004',
  database: 'BuzzNet'
})

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());


app.get('/api/hello', (req, res) => {
  res.json({ message: 'I Love You!' });
});

// 1. Get all posts (with number of likes, number of comments, username)
app.get('/api/posts', async (req, res) => {
  try {
    const sql = `
      SELECT 
        posts.id, posts.content, posts.title, posts.image_url, posts.created_at, 
        users.username,
        COUNT(DISTINCT comments.id) AS comment_count,
        COUNT(DISTINCT likes.id) AS like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN likes ON posts.id = likes.post_id
      GROUP BY posts.id, users.username
      ORDER BY like_count DESC, comment_count DESC, posts.created_at DESC
      LIMIT 50;
    `
    const result = await pool.query(sql)
    res.json(result.rows)
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving posts');
  }
})

// 2. Create new post
app.post('/api/posts', async (req, res) => {
  const { user_id, title, content, image_url } = req.body
  try {
    const sql = `
      INSERT INTO posts (user_id, title, content, image_url)
      VALUES ($1, $2, $3, $4)
      `
    const values = [user_id, title, content, image_url]
    const result = await pool.query(sql, values)
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error)
    res.status(500).send('Error creating post');
  }
})

// 3. Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  const postId = req.params.id
  const { user_id } = req.body
  console.log('🔁 Like Request:', { postId, user_id });

  try {
    const sql = `
      INSERT INTO likes (user_id, post_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, post_id) DO NOTHING
      RETURNING *;
    `
    const values = [user_id, postId]
    const result = await pool.query(sql, values)
    res.status(201).send("Liked!")

  } catch (error) {
    console.log(error)
    res.status(500).send('Error liking post')
  }
})

// 4. Comment on a post
app.post('/api/posts/:id/comment', async (req, res) => {
  const postId = req.params.id
  const { user_id, content } = req.body
  console.log("📨 Incoming comment:", { postId, user_id, content });
  try {
    const sql = `
      INSERT INTO comments (user_id, post_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `
    const values = [user_id, postId, content]
    const result = await pool.query(sql, values)
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.log(error)
    res.status(500).send('Error commenting on post')
  }
})

// 5. Get all info about a post
app.get('/api/posts/:id', async (req, res) => {
  const postId = req.params.id

  try {
    const sql_for_post = `
      SELECT posts.*, users.username
      FROM posts JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
    `
    const values_for_post = [postId]
    const postRes = await pool.query(sql_for_post, values_for_post)

    const sql_for_comments = `
      SELECT comments.*, users.username
      FROM comments JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at
    `
    const values_for_comments = [postId]
    const commentsRes = await pool.query(sql_for_comments, values_for_comments)

    const sql_for_likes = `
      SELECT COUNT(*) AS like_count
      FROM likes
      WHERE post_id = $1
    `
    const values_for_likes = [postId]
    const likesRes = await pool.query(sql_for_likes, values_for_likes)

    res.json({
      post: postRes.rows[0],
      comments: commentsRes.rows,
      like_count: likesRes.rows[0].like_count,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send('Error retrieving post')
  }
})

// 6. Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  try {
    // 验证 ownership
    const check = await pool.query(
      `SELECT user_id FROM posts WHERE id = $1`, [postId]
    );

    if (!check.rows.length) return res.status(404).send("Post not found");
    if (check.rows[0].user_id !== user_id) return res.status(403).send("Unauthorized");

    // 删除
    await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);
    res.status(200).send("Post deleted");
  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).send("Server error");
  }
});

// 7. Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  const commentId = req.params.id;

  try {
    await pool.query(`DELETE FROM comments WHERE id = $1`, [commentId]);
    res.status(200).send('Comment deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting comment');
  }
});

// 8. Cancel a like
app.delete('/api/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  try {
    await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [user_id, postId]
    );
    res.status(200).send('Like removed');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing like');
  }
});

// 9. Register a new user
app.post('/api/register-user', async (req, res) => {
  const { uid, email, username, createdAt } = req.body;

  try {
    const sql = `
      INSERT INTO users (id, email, username, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `;
    await pool.query(sql, [uid, email, username, createdAt]);
    res.status(201).send("User added to DB");
  } catch (err) {
    console.error("❌ Failed to insert user:", err);
    res.status(500).send("DB user insert error");
  }
});

// 10. Update username
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { username } = req.body;

  try {
    await pool.query(
      `UPDATE users SET username = $1 WHERE id = $2`,
      [username, userId]
    );
    res.status(200).send("Username updated");
  } catch (err) {
    console.error("❌ Username update error:", err);
    res.status(500).send("DB error");
  }
});

//11. Search posts
app.get('/api/search', async (req, res) => {
  const keyword = req.query.q;

  try {
    const sql = `
      SELECT 
        posts.id, posts.title, posts.content, posts.image_url, posts.created_at,
        users.username,
        COUNT(DISTINCT comments.id) AS comment_count,
        COUNT(DISTINCT likes.id) AS like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE posts.title ILIKE $1
      GROUP BY posts.id, users.username
      ORDER BY posts.created_at DESC
    `;
    const values = [`%${keyword}%`];
    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).send("Search failed");
  }
});

// 12. Get Reddit
let redditAccessToken = null;
let redditTokenExpiresAt = 0;
async function getRedditToken() {
  const credentials = `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`;
  const encoded = Buffer.from(credentials).toString('base64');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BuzzNetApp/1.0 by Embarrassed_While765',
    },
    body: 'grant_type=client_credentials',
  });

  const json = await res.json();
  redditAccessToken = json.access_token;
  redditTokenExpiresAt = Date.now() + json.expires_in * 1000 - 60000; // 提前1分钟过期
  return redditAccessToken;
}
app.get('/api/reddit', async (req, res) => {
  const subreddit = req.query.sub || "popular";

  try {
    if (!redditAccessToken || Date.now() >= redditTokenExpiresAt) {
      await getRedditToken();
    }

    const url = `https://oauth.reddit.com/r/${subreddit}`;
    const redditRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${redditAccessToken}`,
        'User-Agent': 'BuzzNetApp/1.0 by Embarrassed_While765',
      }
    });

    if (!redditRes.ok) {
      const text = await redditRes.text();
      console.error(`❌ Reddit API returned ${redditRes.status}:`, text.slice(0, 200));
      return res.status(redditRes.status).send("Reddit API error");
    }

    const data = await redditRes.json();
    const posts = data.data.children.map(child => child.data);

    const topPost = posts.reduce((prev, curr) => {
      return curr.score > prev.score ? curr : prev;
    }, posts[0]);

    res.json({ topPost, posts }); // 🔥 返回 topPost 方便首页使用
  } catch (err) {
    console.error("🔥 Reddit OAuth fetch failed:", err);
    res.status(500).send("Reddit OAuth fetch error");
  }
});


// 13. Get YouTube
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
let cachedYouTube = null;
let cachedAtYouTube = 0;

app.get("/api/youtube", async (req, res) => {
  const now = Date.now();
  if (cachedYouTube && now - cachedAtYouTube < 60000) {
    return res.json(cachedYouTube);
  }

  const region = req.query.region || "US"; // 可以切换为 "CN"
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=30&key=${YOUTUBE_API_KEY}`;

  try {
    const ytRes = await fetch(url);
    const data = await ytRes.json();

    const videos = data.items.map((item) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      image: item.snippet.thumbnails?.high?.url || "",
      views: item.statistics?.viewCount || "0",
    }));

    cachedYouTube = { videos };
    cachedAtYouTube = Date.now();
    res.json({ videos });
  } catch (err) {
    console.error("❌ YouTube fetch error:", err);
    res.status(500).send("Failed to fetch YouTube trending");
  }
});


// 14. Get Hacker News Trending
app.get("/api/hackernews", async (req, res) => {
  try {
    const topIdsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const topIds = await topIdsRes.json();

    const topItems = await Promise.all(
      topIds.slice(0, 20).map(async (id) => {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const item = await itemRes.json();
        return {
          title: item.title,
          url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          heat: item.score,
          subtitle: `by ${item.by}`,
        };
      })
    );

    res.json(topItems);
  } catch (err) {
    console.error("❌ Hacker News fetch failed:", err);
    res.status(500).send("Hacker News fetch error");
  }
});

// 15. Google Trends 热搜词接口
const parser = new Parser({
  customFields: {
    item: [
      ['ht:approx_traffic', 'approx_traffic'],
      ['ht:picture', 'picture'],
      ['ht:news_item', 'newsItems'], // 可以忽略解析子项，后期需要再处理
    ]
  }
});

app.get("/api/googletrends", async (req, res) => {
  try {
    const feed = await parser.parseURL("https://trends.google.com/trending/rss?geo=US");
    const trends = feed.items.map(item => ({
      title: item.title,
      heat: item.approx_traffic || "10K+",
      url: item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
      image: item.picture || "", // Google提供的小图
    }));

    res.json(trends);
  } catch (err) {
    console.error("❌ Google Trends RSS error:", err);
    res.status(500).send("Google Trends RSS fetch failed");
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


