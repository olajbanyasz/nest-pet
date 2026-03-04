import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from 'fs';

import { StreamController } from './stream.controller';

jest.mock('fs');

describe('StreamController', () => {
  let controller: StreamController;

  const mockResponse = {
    writeHead: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
    }).compile();

    controller = module.get<StreamController>(StreamController);
    jest.clearAllMocks();
  });

  describe('streamVideo', () => {
    it('should throw NotFoundException if file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() =>
        controller.streamVideo('test.mp4', 'bytes=0-100', mockResponse),
      ).toThrow(NotFoundException);
    });

    it('should throw BadRequestException if range header is missing', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      expect(() =>
        controller.streamVideo('test.mp4', undefined, mockResponse),
      ).toThrow(BadRequestException);
    });

    it('should stream video with partial content', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 1000 });
      const mockReadStream = { pipe: jest.fn() };
      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      controller.streamVideo('test.mp4', 'bytes=0-100', mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.writeHead).toHaveBeenCalledWith(
        206,
        expect.objectContaining({
          'Content-Range': 'bytes 0-100/1000',
        }),
      );
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deleteVideo', () => {
    it('should throw NotFoundException if video does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => controller.deleteVideo('test.mp4')).toThrow(
        NotFoundException,
      );
    });

    it('should delete video if it exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = controller.deleteVideo('test.mp4');
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(result.message).toBe('Video deleted');
    });
  });

  describe('getVideoList', () => {
    it('should return empty list if media directory does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(controller.getVideoList()).toEqual([]);
    });

    it('should return list of videos', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'video1.mp4',
        'image.jpg',
        'video2.webm',
      ]);
      const result = controller.getVideoList();
      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('video1.mp4');
    });
  });

  describe('uploadVideo', () => {
    it('should throw BadRequestException if no file is uploaded', () => {
      expect(() =>
        controller.uploadVideo(undefined as unknown as Express.Multer.File),
      ).toThrow(BadRequestException);
    });

    it('should upload video and create media directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const mockFile = {
        originalname: 'test.mp4',
        buffer: Buffer.from('test'),
      } as unknown as Express.Multer.File;

      const result = controller.uploadVideo(mockFile);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(result.message).toBe('Upload successful');
    });
  });

  describe('getRadioStations', () => {
    it('should return radio station list with proxied url', () => {
      const result = controller.getRadioStations();
      expect(result).toEqual([
        {
          id: 'radio-1',
          name: 'Radio 1',
          streamUrl: '/api/stream/radio/radio-1',
        },
      ]);
    });
  });

  describe('proxyRadioStream', () => {
    it('should throw NotFoundException for unknown station', async () => {
      await expect(
        controller.proxyRadioStream('unknown-station', mockResponse),
      ).rejects.toThrow(NotFoundException);
    });

    it('should proxy radio stream chunks', async () => {
      const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();
      const chunk = new Uint8Array([1, 2, 3]);
      const read = jest
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunk })
        .mockResolvedValueOnce({ done: true, value: undefined });

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            const lowerName = name.toLowerCase();
            if (lowerName === 'content-type') return 'audio/mpeg';
            if (lowerName === 'icy-name') return 'Radio 1';
            return null;
          },
        },
        body: {
          getReader: () => ({ read }),
        },
      } as unknown as globalThis.Response);
      global.fetch = fetchMock as unknown as typeof fetch;

      await controller.proxyRadioStream('radio-1', mockResponse);

      expect(fetchMock).toHaveBeenCalled();
      const firstCall = fetchMock.mock.calls[0] as [
        string | URL | globalThis.Request,
        RequestInit | undefined,
      ];
      const [fetchUrl, fetchOptions] = firstCall;
      expect(fetchUrl).toBe('https://icast.connectmedia.hu/5201/live.mp3');
      expect(fetchOptions).toEqual(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            Accept: 'audio/*,*/*;q=0.8',
          }),
        }),
      );

      const responseWithMocks = mockResponse as unknown as {
        setHeader: jest.Mock;
        write: jest.Mock;
        end: jest.Mock;
      };
      expect(responseWithMocks.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'audio/mpeg',
      );
      expect(responseWithMocks.setHeader).toHaveBeenCalledWith(
        'Icy-Name',
        'Radio 1',
      );
      expect(responseWithMocks.write).toHaveBeenCalledWith(Buffer.from(chunk));
      expect(responseWithMocks.end).toHaveBeenCalled();
    });
  });

  describe('getRadioMetadata', () => {
    it('should throw NotFoundException for unknown station', async () => {
      await expect(
        controller.getRadioMetadata('unknown-station'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return null metadata when icy-metaint is missing', async () => {
      const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: () => null,
        },
        body: {
          getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
          }),
        },
      } as unknown as globalThis.Response);
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await controller.getRadioMetadata('radio-1');

      expect(result.stationId).toBe('radio-1');
      expect(result.stationName).toBe('Radio 1');
      expect(result.streamTitle).toBeNull();
      expect(result.updatedAt).toBeTruthy();
    });

    it('should parse and return stream title from icy metadata', async () => {
      const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();
      const metaint = 5;
      const audioBytes = Buffer.from([1, 2, 3, 4, 5]);
      const metadataText = "StreamTitle='Artist - Song';";
      const metadataLength = Math.ceil(Buffer.byteLength(metadataText) / 16);
      const metadataPayload = Buffer.alloc(metadataLength * 16);
      metadataPayload.write(metadataText, 0, 'utf8');
      const packet = Buffer.concat([
        audioBytes,
        Buffer.from([metadataLength]),
        metadataPayload,
      ]);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === 'icy-metaint') {
              return String(metaint);
            }
            return null;
          },
        },
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new Uint8Array(packet),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
          }),
        },
      } as unknown as globalThis.Response);
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await controller.getRadioMetadata('radio-1');

      expect(result.streamTitle).toBe('Artist - Song');
    });
  });
});
