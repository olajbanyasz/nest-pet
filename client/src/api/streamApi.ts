import api from './axios';

const STREAM_BASE_URL = '/stream/video';
const ENV_URL = 'http://localhost:3001/api';

export interface VideoItem {
  filename: string;
  url: string;
}

export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
}

export interface RadioMetadata {
  stationId: string;
  stationName: string;
  streamTitle: string | null;
  updatedAt: string;
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

export const getRadioStations = async (): Promise<RadioStation[]> => {
  const res = await api.get<RadioStation[]>('/stream/radio/stations');
  return res.data;
};

export const getRadioStreamUrl = (stationId: string): string => {
  return `/api/stream/radio/${encodeURIComponent(stationId)}`;
};

export const getRadioMetadata = async (
  stationId: string,
): Promise<RadioMetadata> => {
  const res = await api.get<RadioMetadata>(
    `/stream/radio/${encodeURIComponent(stationId)}/metadata`,
  );
  return res.data;
};
