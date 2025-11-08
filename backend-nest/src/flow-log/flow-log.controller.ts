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
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('/api/flow-log')
export class FlowLogController {
  private readonly uploadDir = path.join(
    process.cwd(),
    'uploads',
    'attachments',
  );

  // private readonly uploadDir = path.join('/mnt', 'uploads');

  constructor(private readonly flowLogService: FlowLogService) {
    // Buat folder upload jika belum ada
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, multerMemoryConfig))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Simpan file dari buffer ke disk
    const urls = await Promise.all(
      files.map(async (file) => {
        // Generate unique filename
        const ext = path.extname(file.originalname || '');
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(this.uploadDir, filename);
        try {
          await fs.promises.writeFile(filepath, file.buffer);
          console.log('✅ File saved!');
        } catch (err) {
          return new BadRequestException('❌ Error writing file ' + err);
        }
        // Return URL
        return `/uploads/attachments/${filename}`;
      }),
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
