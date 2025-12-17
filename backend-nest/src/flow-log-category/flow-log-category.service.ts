import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { flowCategoryCreateDto } from 'src/models/flow-category.model';

//Expense category
@Injectable()
export class FlowLogCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createFlowLogCategoryDto: flowCategoryCreateDto) {
    try {
      return this.prismaService.flowLogCategory.create({
        data: {
          name: createFlowLogCategoryDto.name,
          description: createFlowLogCategoryDto.description,
          no: createFlowLogCategoryDto.no,
        },
      });
    } catch (error) {
      console.log(error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  findAll() {
    try {
      return this.prismaService.flowLogCategory.findMany();
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

  remove(id: string) {
    try {
      return this.prismaService.flowLogCategory.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error?.message);
    }
  }
}
