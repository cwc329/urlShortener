import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCSRFToken } from './lib/django';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  // Handle URL submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setShortUrl(''); // Clear previous results

    try {
      const response = await fetch(
        '/shortUrl/api/short-urls/',
        {
          method: "POST",
          body: JSON.stringify({ long_url: longUrl }),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-CSRFToken": getCSRFToken(),
          }
        });
      const res = await response.json();
      setShortUrl(res.full_short_url);
      setLongUrl(''); // Reset the input field
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError('Failed to shorten the URL. Please try again later.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((error) => console.error("Failed to copy text:", error));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>URL Shortener</h1>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label>
          Enter URL to shorten:
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
            style={{ marginLeft: '10px', padding: '5px', width: '70%' }}
          />
        </label>
        <button type="submit" style={{ marginLeft: '10px', padding: '5px 15px' }}>
          Shorten
        </button>
      </form>

      {/* Show the shortened URL */}
      {shortUrl && (
        <div>
          <p>
            Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
          </p>
          <button onClick={() => copyToClipboard(shortUrl)}>Copy to Clipboard</button>
        </div>
      )}
      <p>
        Check created short urls in the <Link to='/dashboard'>Dashboard.</Link>
      </p>


      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
    </div>
  );
}
