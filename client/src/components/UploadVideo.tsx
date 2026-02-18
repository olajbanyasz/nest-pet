import type {
  FileUploadHandlerEvent,
  FileUploadHeaderTemplateOptions,
  FileUploadSelectEvent,
} from 'primereact/fileupload';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import React, { useRef, useState } from 'react';

import { useLoading } from '../contexts/LoadingProvider';

interface UploadVideoProps {
  onUpload: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<void> | void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUpload }) => {
  const { show, hide } = useLoading();
  const [progress, setProgress] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);

  const customUpload = async (event: FileUploadHandlerEvent) => {
    if (!event.files || event.files.length === 0) return;
    const file = event.files[0] as File;

    show();
    setProgress(0);

    try {
      await onUpload(file, (percent: number) => {
        setProgress(percent);
      });
      event.options.clear();
      setFileSize(0);
    } finally {
      hide();
      setProgress(0);
    }
  };

  const onSelect = (event: FileUploadSelectEvent) => {
    const file = event.files?.[0];
    if (file) {
      setFileSize(file.size);
      setProgress(0);
    }
  };

  const onClear = () => {
    setFileSize(0);
    setProgress(0);
  };

  const chooseOptions = {
    icon: 'pi pi-fw pi-images',
    iconOnly: true,
    className: 'custom-choose-btn p-button-rounded p-button-outlined',
  };

  const uploadOptions = {
    icon: 'pi pi-fw pi-cloud-upload',
    iconOnly: true,
    className: `custom-upload-btn ${
      !fileSize ? 'p-button-secondary' : 'p-button-success'
    } p-button-rounded p-button-outlined`,
  };

  const cancelOptions = {
    icon: 'pi pi-fw pi-times',
    iconOnly: true,
    className: `custom-cancel-btn ${
      !fileSize ? 'p-button-secondary' : 'p-button-danger'
    } p-button-rounded p-button-outlined`,
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const formattedValue = fileUploadRef.current?.formatSize(fileSize) ?? '0 B';

    return (
      <div
        className={className}
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {chooseButton} {uploadButton} {cancelButton}
        </div>

        <div style={{ color: '#888', fontWeight: 700 }}>Upload Video</div>

        <div className="flex align-items-center gap-3 ml-auto">
          <div style={{ textAlign: 'center' }}>{formattedValue}</div>
          <ProgressBar
            value={progress}
            showValue={false}
            style={{ width: '10rem', height: '12px' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: '640px',
      }}
    >
      <FileUpload
        ref={fileUploadRef}
        name="video"
        customUpload
        uploadHandler={customUpload}
        accept="video/*"
        maxFileSize={1024 * 1024 * 1024}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        headerTemplate={headerTemplate}
        emptyTemplate={<p className="m-0">No video selected.</p>}
        onSelect={onSelect}
        onClear={onClear}
      />
    </div>
  );
};

export default UploadVideo;
