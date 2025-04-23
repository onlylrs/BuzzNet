import express from 'express'
import pg from 'pg';
import cors from 'cors'

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
  try{
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
      ORDER BY like_count DESC, comment_count DESC, posts.created_at DESC;
    `
    const result = await pool.query(sql)
    res.json(result.rows)
  }catch(error){
    console.log(error);
    res.status(500).send('Error retrieving posts');
  }
})

// 2. Create new post
app.post('/api/posts', async (req, res) =>{
  const { user_id, title, content, image_url } = req.body
  try {
    const sql = `
      INSERT INTO posts (user_id, title, content, image_url)
      VALUES ($1, $2, $3, $4)
      `
    const values = [user_id, title, content, image_url]
    const result = await pool.query(sql, values)
    res.status(201).json(result.rows[0]);
  }catch(error){
    console.log(error)
    res.status(500).send('Error creating post');
  }
})

// 3. Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  const postId = req.params.id
  const { user_id } = req.body
  console.log('🔁 Like Request:', { postId, user_id });

  try{
    const sql = `
      INSERT INTO likes (user_id, post_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, post_id) DO NOTHING
      RETURNING *;
    `
    const values = [user_id, postId]
    const result = await pool.query(sql, values)
    res.status(201).send("Liked!")

  }catch(error){
    console.log(error)
    res.status(500).send('Error liking post')
  }
})

// 4. Comment on a post
app.post('/api/posts/:id/comment', async (req, res) => {
  const postId = req.params.id
  const { user_id, content } = req.body
  console.log("📨 Incoming comment:", { postId, user_id, content });
  try{
    const sql = `
      INSERT INTO comments (user_id, post_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `
    const values = [user_id, postId, content]
    const result = await pool.query(sql, values)
    res.status(201).json(result.rows[0])
  }catch(error){
    console.log(error)
    res.status(500).send('Error commenting on post')
  }
})

// 5. Get all info about a post
app.get('/api/posts/:id', async (req, res) => {
  const postId = req.params.id

  try{
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
  }catch(error){
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


