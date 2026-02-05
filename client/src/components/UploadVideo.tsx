import React, { useRef, useState } from 'react';

interface UploadVideoProps {
  onUpload: (file: File) => Promise<void> | void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await onUpload(selectedFile);
      clearSelection();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        maxWidth: '640px',
      }}
    >
      <h3 style={{ marginBottom: '12px' }}>🎥 Upload Video</h3>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        style={{ marginBottom: '12px' }}
      />

      {selectedFile && (
        <div
          style={{
            marginBottom: '12px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          Kiválasztva: <strong>{selectedFile.name}</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        <button
          onClick={clearSelection}
          disabled={!selectedFile || loading}
          style={{ opacity: 0.7 }}
        >
          Törlés
        </button>
      </div>
    </div>
  );
};

export default UploadVideo;
