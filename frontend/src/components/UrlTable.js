import React, { useState } from 'react';

function UrlTable({ userUrls }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState({});

  const handleRowClick = async (shortUrl) => {
    // Toggle the expanded state
    setExpandedRows((prevState) => ({
      ...prevState,
      [shortUrl]: {
        ...prevState[shortUrl],
        expanded: !prevState[shortUrl]?.expanded,
      },
    }));

    // Fetch details lazily if not already fetched
    if (!expandedRows[shortUrl]?.data) {
      setLoading((prev) => ({ ...prev, [shortUrl]: true }));
      try {
        const response = await fetch(`/shortUrl/api/short-urls/${shortUrl}/`); // Replace with your endpoint
        const data = await response.json();

        setExpandedRows((prevState) => ({
          ...prevState,
          [shortUrl]: {
            expanded: true,
            data: data, // Store the fetched data
          },
        }));
      } catch (error) {
        console.error(`Error fetching details for ${shortUrl}:`, error);
      } finally {
        setLoading((prev) => ({ ...prev, [shortUrl]: false }));
      }
    }
  };

  return (
    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Short URL</th>
          <th>Long URL</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {userUrls.length > 0 ? (
          userUrls.map((url) => (
            <React.Fragment key={url.short_url}>
              {/* Main row */}
              <tr onClick={() => handleRowClick(url.short_url)} style={{ cursor: 'pointer' }}>
                <td>
                  <a href={url.full_short_url} target="_blank" rel="noopener noreferrer">
                    {url.full_short_url}
                  </a>
                </td>
                <td>{url.long_url}</td>
                <td>{url.created_at || 'N/A'}</td>
              </tr>
              {/* Expanded row */}
              {expandedRows[url.short_url]?.expanded && (
                <tr>
                  <td colSpan="3" style={{ backgroundColor: '#f9f9f9', padding: '10px' }}>
                    {loading[url.short_url] ? (
                      <div>Loading details...</div>
                    ) : expandedRows[url.short_url]?.data?.click_count_by_source ? (
                      <div>
                        <h4>Click Count by Source:</h4>
                        <ul>
                          {expandedRows[url.short_url].data.click_count_by_source.map((source, index) => (
                            <li key={index}>
                              <strong>{source.source}:</strong> {source.click_count} clicks
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>Error loading details</div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan="3" style={{ textAlign: 'center' }}>
              No URLs created yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default UrlTable;

