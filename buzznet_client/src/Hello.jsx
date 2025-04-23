// src/Hello.jsx
import { useEffect, useState } from 'react';

export default function Hello() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    async function fetchMessage() {
      try {
        const res = await fetch('/api/hello');
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage('Failed to load message 😢');
      }
    }

    fetchMessage();
  }, []);

  return (
    <div>
      <h1>Hello from BuzzNet</h1>
      <p>Message from server: {message}</p>
    </div>
  );
}
