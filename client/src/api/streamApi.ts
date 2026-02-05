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

export const uploadVideo = async (file: File): Promise<void> => {
  await api.post(`${STREAM_BASE_URL}/upload/${file.name}`, file, {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
};
