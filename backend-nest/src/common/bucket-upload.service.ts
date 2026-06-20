import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class BucketUploadService {
  private readonly endpoint = process.env.BUCKET_ENDPOINT;
  private readonly fieldName = process.env.BUCKET_FIELD_NAME || 'file';

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!this.endpoint) {
      throw new InternalServerErrorException(
        'BUCKET_ENDPOINT is not configured',
      );
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });
    formData.append(this.fieldName, blob, file.originalname || 'upload');

    const headers: Record<string, string> = {};
    const apiKey = process.env.BUCKET_API_KEY;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    if (process.env.BUCKET_NAME) {
      headers['x-bucket-name'] = process.env.BUCKET_NAME;
    } else {
      throw new InternalServerErrorException('BUCKET_NAME is not configured');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new BadRequestException(
        `Upload failed: ${response.status} ${text || response.statusText}`,
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return this.extractUrl(data);
    }

    const text = (await response.text()).trim();
    if (text.startsWith('http') || text.startsWith('/')) {
      return text;
    }

    throw new BadRequestException('Unexpected bucket upload response');
  }

  private extractUrl(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new BadRequestException('Empty bucket upload response');
      }
      return this.extractUrl(data[0]);
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      for (const key of ['url', 'fileUrl', 'file_url', 'link', 'path']) {
        const value = obj[key];
        if (typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
      if (obj.data !== undefined) {
        return this.extractUrl(obj.data);
      }
    }

    throw new BadRequestException(
      'Could not parse upload URL from bucket response',
    );
  }
}
