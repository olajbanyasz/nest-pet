import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

const McpClient: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [toolResult, setToolResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const connectToMcp = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create SSE Transport to the relative /api/sse path.
      // withCredentials ensures the JWT cookie is passed!
      const transport = new SSEClientTransport(new URL('/api/sse', window.location.origin), {
        eventSourceInit: {
          withCredentials: true,
        }
      });
      
      const mcpClient = new Client({
        name: 'react-mcp-client',
        version: '1.0.0',
      }, {
        capabilities: {}
      });

      await mcpClient.connect(transport);
      setClient(mcpClient);
      setConnected(true);
      
      // Fetch initial tools
      const toolsResponse = await mcpClient.listTools();
      setTools(toolsResponse.tools || []);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect to MCP Server');
    } finally {
      setLoading(false);
    }
  };

  const handleToolExecute = async () => {
    if (!client || !selectedTool) return;
    
    setExecuting(true);
    setToolResult(null);
    setError(null);
    
    try {
      // Best-effort type parsing for booleans and numbers
      const parsedArgs = { ...toolArgs };
      Object.entries(selectedTool.inputSchema?.properties || {}).forEach(([key, schema]: [string, any]) => {
        if (schema.type === 'boolean' && parsedArgs[key]) {
          parsedArgs[key] = parsedArgs[key] === 'true' || parsedArgs[key] === true;
        } else if (schema.type === 'number' && parsedArgs[key] !== undefined && parsedArgs[key] !== '') {
          parsedArgs[key] = Number(parsedArgs[key]);
        }
      });

      const result = await client.callTool({
        name: selectedTool.name,
        arguments: parsedArgs
      });
      setToolResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to execute tool');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="mcp-client">
      {!connected ? (
        <Card title="Connect to Server" style={{ maxWidth: '600px' }}>
          <p>This will connect via SSE to <code>/api/sse</code>. Your authentication is preserved via the current session cookies.</p>
          {error && <div style={{ color: 'var(--red-500)', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
          <Button 
            label={loading ? "Connecting..." : "Connect to MCP"} 
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-link"} 
            onClick={connectToMcp} 
            disabled={loading}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          <Card title="Available Tools" style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div className="p-fluid flex flex-column gap-3">
              {tools.map(tool => (
                <div key={tool.name} className="p-field">
                  <Button 
                    label={tool.name} 
                    severity={selectedTool?.name === tool.name ? undefined : 'secondary'} 
                    outlined={selectedTool?.name !== tool.name}
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedTool(tool);
                      setToolArgs({});
                      setToolResult(null);
                    }} 
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-color-secondary)' }}>
                    {tool.description}
                  </small>
                </div>
              ))}
              {tools.length === 0 && <p>No tools found.</p>}
            </div>
          </Card>

          {selectedTool ? (
            <Card title={`Execute: ${selectedTool.name}`} style={{ flex: '3 1 400px', minWidth: 0 }}>
              <div className="p-fluid flex flex-column gap-3">
                {selectedTool.inputSchema?.properties && Object.entries(selectedTool.inputSchema.properties).map(([key, schema]: [string, any]) => (
                  <div key={key} className="p-field">
                    <label htmlFor={key} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {key} {selectedTool.inputSchema?.required?.includes(key) ? '*' : ''}
                      {schema.type && <small style={{ fontWeight: 'normal', color: '#666', marginLeft: '0.5rem' }}>({schema.type})</small>}
                    </label>
                    <InputText 
                      id={key} 
                      value={toolArgs[key] || ''} 
                      onChange={(e) => setToolArgs({...toolArgs, [key]: e.target.value})} 
                      placeholder={schema.description || `Enter ${key}`}
                    />
                  </div>
                ))}
                
                {(!selectedTool.inputSchema?.properties || Object.keys(selectedTool.inputSchema.properties).length === 0) && (
                  <p>This tool requires no arguments.</p>
                )}

                <div className="mt-4">
                  <Button 
                    label={executing ? "Executing..." : "Execute"} 
                    icon={executing ? "pi pi-spin pi-spinner" : "pi pi-play"} 
                    onClick={handleToolExecute} 
                    disabled={executing}
                  />
                </div>

                {error && <div style={{ color: 'var(--red-500)', marginTop: '1rem', fontWeight: 'bold' }}>{error}</div>}

                {toolResult && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Result:</h3>
                    {toolResult.isError && <div style={{ color: 'var(--red-500)', marginBottom: '1rem', fontWeight: 'bold' }}>Tool returned an error status!</div>}
                    
                    {(() => {
                      const preStyle: React.CSSProperties = { 
                        background: 'var(--surface-50)', 
                        padding: '1rem', 
                        borderRadius: '6px', 
                        overflowX: 'auto', 
                        maxHeight: '600px',
                        border: '1px solid var(--surface-border)',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      };

                      let contentArray = toolResult.content;
                      if (!Array.isArray(contentArray)) {
                        contentArray = [contentArray];
                      }

                      return contentArray.map((item: any, idx: number) => {
                        if (item?.type === 'text' && typeof item.text === 'string') {
                          try {
                            const parsed = JSON.parse(item.text);
                            return <pre key={idx} style={preStyle}>{JSON.stringify(parsed, null, 2)}</pre>;
                          } catch {
                            return <pre key={idx} style={preStyle}>{item.text}</pre>;
                          }
                        }
                        return <pre key={idx} style={preStyle}>{JSON.stringify(item, null, 2)}</pre>;
                      });
                    })()}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card style={{ flex: '3 1 400px', minWidth: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>Select a tool from the list to execute it.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default McpClient;
