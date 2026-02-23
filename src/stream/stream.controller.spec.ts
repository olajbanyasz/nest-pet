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
});
