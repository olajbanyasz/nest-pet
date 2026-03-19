import React from 'react';

import McpClient from '../components/McpClient/McpClient';

const McpClientPage: React.FC = () => {
  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>MCP Client Inspector</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Connect to the NestJS MCP Server to discover and execute tools directly from your browser.</p>
      <McpClient />
    </div>
  );
};

export default McpClientPage;
