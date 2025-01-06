import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UrlTable from './components/UrlTable';

export default function Dashboard() {
  const [userUrls, setUserUrls] = useState([]);
  const [error, setError] = useState('');

  // Fetch the user's created URLs on component mount
  useEffect(() => {
    const fetchUserUrls = async () => {
      try {
        const response = await fetch("/shortUrl/api/short-urls/"); // Replace with your API endpoint
        const data = await response.json()
        setUserUrls(data);
      } catch (err) {
        console.error('Error fetching user URLs:', err);
        setError('Failed to fetch URLs. Please try again later.');
      }
    };

    fetchUserUrls();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>URL Shortener Dashboard</h1>
      {/* Table of User's Created URLs */}
      <p>
        Create new short urls <Link to='/'>Here.</Link>
      </p>
      <h2>Your Shortened URLs</h2>
      <UrlTable userUrls={userUrls} />
      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
    </div>
  );
};
