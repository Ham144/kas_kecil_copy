import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { flowCategoryCreateDto } from 'src/models/flow-category.model';

//Expense category
@Injectable()
export class FlowLogCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createFlowLogCategoryDto: flowCategoryCreateDto) {
    if (!createFlowLogCategoryDto.warehouseId) {
      throw new BadRequestException('warehouseId is required');
    }

    try {
      return await this.prismaService.flowLogCategory.create({
        data: {
          description: createFlowLogCategoryDto.description,
          no: createFlowLogCategoryDto.no,
          name: createFlowLogCategoryDto.name,
          warehouseId: createFlowLogCategoryDto.warehouseId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // meta.target biasanya berisi array nama field, misal ['name'] atau ['no']
        const target = error.meta?.target || [];

        if (target.includes('name')) {
          throw new ConflictException('Category name is no longer in use');
        }
        if (target.includes('no')) {
          throw new ConflictException(
            'Number (no) is found duplicate, please use a different number',
          );
        }

        throw new ConflictException(`Data duplikat pada: ${target.join(', ')}`);
      }

      throw new BadRequestException(error.message);
    }
  }

  findAll(filter: { selectedWarehouseId: string; searchKey: string }) {
    // const { selectedWarehouseId, searchKey } = filter;
    const where: Prisma.FlowLogCategoryWhereInput = {};

    if (filter.selectedWarehouseId) {
      where.warehouseId = filter.selectedWarehouseId;
    }
    if (filter.searchKey) {
      where.OR = [
        { no: { contains: filter.searchKey, mode: 'insensitive' } },
        { name: { contains: filter.searchKey, mode: 'insensitive' } },
      ];
    }

    try {
      return this.prismaService.flowLogCategory.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      console.log(error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    try {
      return this.prismaService.flowLogCategory.findUnique({
        where: {
          id: id,
        },
      });
    } catch (error) {
      console.log(error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  update(id: string, updateFlowLogCategoryDto: flowCategoryCreateDto) {
    try {
      return this.prismaService.flowLogCategory.update({
        where: {
          id: id,
        },
        data: {
          name: updateFlowLogCategoryDto.name,
          description: updateFlowLogCategoryDto.description,
          no: updateFlowLogCategoryDto.no,
        },
      });
    } catch (error) {
      console.log(error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async remove(id: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 1. Hapus budget yang berkaitan
        await tx.budget.deleteMany({
          where: { categoryId: id },
        });

        // 2. Hapus flow logs yang berkaitan (Penyebab error tadi)
        await tx.flowLog.deleteMany({
          where: { categoryId: id },
        });

        // 3. Sekarang baru aman menghapus kategori induknya
        return await tx.flowLogCategory.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Gagal menghapus: ' + error.message);
    }
  }
}
