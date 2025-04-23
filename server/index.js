import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors());


app.get('/api/hello', (req, res) => {
  res.json({ message: 'I Love You!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


