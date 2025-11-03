import { Injectable } from '@nestjs/common';
import { FlowLogType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { ErrorResponse } from 'src/models/error.model';
import {
  FlowLogCreateDto,
  FlowlogResponseDto,
} from 'src/models/flow-log.model';

@Injectable()
export class FlowLogService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    createFlowLogDto: FlowLogCreateDto,
    userInfo: any,
  ): Promise<FlowlogResponseDto | ErrorResponse> {
    try {
      const flowLog: FlowlogResponseDto =
        await this.prismaService.flowLog.create({
          data: {
            title: createFlowLogDto.title,
            amount: createFlowLogDto.amount,
            note: createFlowLogDto.note,
            attachments: createFlowLogDto.attachments,
            type: FlowLogType.OUT,
            warehouse: {
              connect: {
                id: createFlowLogDto.warehouse,
              },
            },
            category: {
              connect: {
                id: createFlowLogDto.category,
              },
            },
            createdBy: {
              connect: {
                username: userInfo.username,
              },
            },
          },
          include: {
            warehouse: true,
            category: true,
            createdBy: true,
          },
        });

      return {
        id: flowLog.id,
        title: flowLog.title,
        amount: flowLog.amount,
        note: flowLog.note,
        attachments: flowLog.attachments,
        type: flowLog.type,
        createdAt: flowLog.createdAt,
        createdBy: userInfo.username,
        category: flowLog.category,
      };
    } catch (error) {
      console.log(error.message);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  findAll() {
    return `This action returns all flowLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flowLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} flowLog`;
  }
}
