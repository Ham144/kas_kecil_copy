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

@Controller('/api/flow-log')
export class FlowLogController {
  constructor(private readonly flowLogService: FlowLogService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, multerMemoryConfig))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Auth() userInfo: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const base_url =
      process.env.NODE_ENV != 'production'
        ? process.env.BACKEND_URL_DEV
        : process.env.BACKEND_URL_PROD;
    const urls = await Promise.all(
      files.map((f) => `${base_url}/uploads/flow-log/${f.filename}`),
    );

    return {
      success: true,
      data: urls,
    };
  }

  @Post('/expense')
  async registerExpense(
    @Body() createFlowLogDto: FlowLogCreateDto,
    @Auth() userInfo: any,
  ) {
    const result = await this.flowLogService.createExpense(
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

  @Post('/revenue')
  async registerRevenue(
    @Body() createFlowLogDto: FlowLogCreateDto,
    @Auth() userInfo: any,
  ) {
    const result = await this.flowLogService.createRevenue(
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
  async findAll(@Query() query) {
    const result = await this.flowLogService.recentFlowLogs(query);

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
  async getAnalytics(
    @Query() filter: GetAnalyticFilter,
    @Auth() userInfo: any,
  ) {
    //cek redis first

    return await this.flowLogService.getAnalytics(userInfo, filter);
  }
}
