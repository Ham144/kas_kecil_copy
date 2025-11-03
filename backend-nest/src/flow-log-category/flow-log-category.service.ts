import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { flowCategoryCreateDto } from 'src/models/flow-category.model';

@Injectable()
export class FlowLogCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createFlowLogCategoryDto: flowCategoryCreateDto) {
    return this.prismaService.flowLogCategory.create({
      data: {
        name: createFlowLogCategoryDto.name,
        description: createFlowLogCategoryDto.description,
        no: createFlowLogCategoryDto.no,
      },
    });
  }

  findAll() {
    return this.prismaService.flowLogCategory.findMany();
  }

  findOne(id: string) {
    return this.prismaService.flowLogCategory.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: string, updateFlowLogCategoryDto: flowCategoryCreateDto) {
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
  }

  remove(id: string) {
    return this.prismaService.flowLogCategory.delete({
      where: {
        id: id,
      },
    });
  }
}
