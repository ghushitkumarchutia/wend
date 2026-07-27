import { Router } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../common/storage.js';
import { env } from '../../common/env.js';
import type { Request, Response } from 'express';

export const storageRouter = Router();

storageRouter.get('/file', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawKey = (req.query.key as string) || (req.query.path as string);
    if (!rawKey) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing file key' } });
      return;
    }

    const key = rawKey.replace(/^\/+/, '');

    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found' } });
      return;
    }

    if (s3Response.ContentType) {
      res.setHeader('Content-Type', s3Response.ContentType);
    } else {
      res.setHeader('Content-Type', 'image/webp');
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || env.WEB_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const stream = s3Response.Body as unknown as NodeJS.ReadableStream;
    stream.pipe(res);
  } catch (error) {
    console.error('Storage file streaming error:', error);
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found or inaccessible' } });
  }
});
