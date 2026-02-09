import api from './axios';

const STREAM_BASE_URL = '/stream/video';
const ENV_URL = 'http://localhost:3001/api';

export interface VideoItem {
  filename: string;
  url: string;
}

export const getVideos = async (): Promise<VideoItem[]> => {
  const res = await api.get<VideoItem[]>('/stream/videos');
  return res.data;
};

export const getVideoStreamUrl = (filename: string): string => {
  return `${ENV_URL}${STREAM_BASE_URL}/${encodeURIComponent(filename)}`;
};

export const uploadVideo = async (
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const formData = new FormData();
  formData.append('file', file);

  await api.post('/stream/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!,
        );
        onProgress(percent);
      }
    },
  });
};

export const deleteVideo = async (filename: string): Promise<void> => {
  await api.delete(`${STREAM_BASE_URL}/${encodeURIComponent(filename)}`);
};
