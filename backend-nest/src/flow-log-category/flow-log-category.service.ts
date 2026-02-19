import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { flowCategoryCreateDto } from 'src/models/flow-category.model';

//Expense category
@Injectable()
export class FlowLogCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createFlowLogCategoryDto: flowCategoryCreateDto) {
    try {
      return await this.prismaService.flowLogCategory.create({
        data: {
          description: createFlowLogCategoryDto.description,
          no: createFlowLogCategoryDto.no,
          name: createFlowLogCategoryDto.name,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // meta.target biasanya berisi array nama field, misal ['name'] atau ['no']
        const target = error.meta?.target || [];

        if (target.includes('name')) {
          throw new ConflictException('Nama kategori sudah terpakai!');
        }
        if (target.includes('no')) {
          throw new ConflictException(
            'Nomor urut (no) sudah ada, pakai nomor lain!',
          );
        }

        throw new ConflictException(`Data duplikat pada: ${target.join(', ')}`);
      }

      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    try {
      return this.prismaService.flowLogCategory.findMany({
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
        // 1. Hapus budget (anak)
        await tx.budget.deleteMany({
          where: { categoryId: id },
        });

        // 2. Hapus kategori (induk)
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
