import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FlowLogService } from './flow-log.service';
import { FlowLogCreateDto, GetAnalyticFilter } from 'src/models/flow-log.model';
import { Auth } from 'src/common/auth.decorator';
import { multerMemoryConfig } from 'src/common/multer.config';
import { RedisService } from 'src/redis/redis.service';
import { TokenPayload } from 'src/models/tokenPayload.model';
import { BucketUploadService } from 'src/common/bucket-upload.service';

@Controller('/api/flow-log')
export class FlowLogController {
  constructor(
    private readonly flowLogService: FlowLogService,
    private readonly redisService: RedisService,
    private readonly bucketUploadService: BucketUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, multerMemoryConfig))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = await this.bucketUploadService.uploadFiles(files);

    return {
      success: true,
      data: urls,
    };
  }

  @Post('/new')
  async createNew(
    @Body() createFlowLogDto: FlowLogCreateDto,
    @Auth() userInfo: any,
  ) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const warehouseId = createFlowLogDto.warehouseId;
    const cacheKeyMonth = `analytic:${warehouseId}:${year}-${month}`;
    const cacheKeyDay = `analytic:${warehouseId}:${year}-${month}-${day}`;

    if (warehouseId) {
      await this.redisService.del(cacheKeyMonth);
      await this.redisService.del(cacheKeyDay);
    }

    const result = await this.flowLogService.createExpenseOrRevenue(
      createFlowLogDto,
      userInfo,
    );

    // Check if result is an error response
    if ('statusCode' in result) {
      return result;
    }

    return {
      success: true,
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query, @Auth() userInfo: TokenPayload) {
    const result = await this.flowLogService.recentFlowLogs(query, userInfo);

    // Check if result is an error response
    if ('statusCode' in result) {
      return result;
    }

    return {
      success: true,
      data: result,
    };
  }

  @Get('/analytic')
  async getAnalytics(@Query() filter: GetAnalyticFilter) {
    //cek redis first
    const cacheKey = `analytic:${filter.selectedWarehouseId}:${filter.selectedDate}`;

    const cachedResult = await this.redisService.get(cacheKey);
    if (cachedResult) {
      const data = JSON.parse(cachedResult);
      data.success = true;
      data.message = 'from cahched analytic';
      return data;
    }

    const data = await this.flowLogService.getAnalytics(filter);

    // Check if result is an error response
    await this.redisService.set(
      cacheKey,
      JSON.stringify(data),
      24 * 60 * 60000, // 24 jam dalam milidetik
    );
    return data;
  }
}
