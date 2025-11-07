import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => {
        // Retry dengan exponential backoff, maksimal 10 detik
        const delay = Math.min(times * 50, 10000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle connection events
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.logger.log('Redis ready');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error('Redis connection error', err.message);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    // Try to connect
    this.client.connect().catch((err) => {
      this.logger.warn('Failed to connect to Redis on startup', err.message);
      this.isConnected = false;
    });
  }

  async set(key: string, value: string, ttlSeconds: number) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis is not connected');
      }
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Redis set error for key ${key}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        return null; // Return null jika tidak terhubung, bukan throw error
      }
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(
        `Redis get error for key ${key}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return null; // Return null jika error, bukan throw
    }
  }

  async del(key: string) {
    try {
      if (!this.isConnected) {
        return; // Skip jika tidak terhubung
      }
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis del error for key ${key}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Don't throw, just log
    }
  }
}
