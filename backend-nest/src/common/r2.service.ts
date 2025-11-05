import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private s3: S3Client | null = null;
  private bucket: string;
  private publicEndpoint: string;

  constructor() {
    const endpoint =
      process.env.R2_ENDPOINT ||
      'https://2d7e2c678d6765b5d7dec4593dd344c9.r2.cloudflarestorage.com';
    const bucket = process.env.R2_BUCKET || 'kas-kecil-copy';

    this.bucket = bucket;
    // e.g. https://<accountid>.r2.cloudflarestorage.com/kas-kecil-copy
    this.publicEndpoint = `${process.env.R2_PUBLIC_URL || endpoint}/${this.bucket}`;
  }

  private initializeS3Client() {
    if (this.s3) {
      return;
    }

    const endpoint =
      process.env.R2_ENDPOINT ||
      'https://2d7e2c678d6765b5d7dec4593dd344c9.r2.cloudflarestorage.com';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.warn(
        'R2 credentials not configured. File uploads will fail. Please set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.',
      );
      return;
    }

    this.s3 = new S3Client({
      region: 'auto', // R2 ignores region but aws-sdk requires it
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    this.initializeS3Client();

    if (!this.s3) {
      throw new Error(
        'R2 credentials not configured. Please set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables.',
      );
    }

    const ext = file.originalname ? file.originalname.split('.').pop() : 'bin';
    const key = `${uuidv4()}.${ext}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // R2 ignores this, but S3 compatibility
      }),
    );
    // The file will be publicly accessible at the following URL:
    return `${this.publicEndpoint}/${key}`;
  }
}
