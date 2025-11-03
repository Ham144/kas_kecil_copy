import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BudgetValidation } from './budget.validation';
import {
  BudgetCreateDto,
  BudgetResponseDto,
  BudgetUpdateDto,
} from 'src/models/budget.model';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async createBudget(body: BudgetCreateDto): Promise<BudgetResponseDto> {
    const validBudget = (await this.validationService.validate(
      BudgetValidation.CREATE,
      body,
    )) as BudgetCreateDto;

    // Check if warehouse exists
    const warehouse = await this.prismaService.warehouse.findUnique({
      where: { id: validBudget.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse tidak ditemukan');
    }

    // Check if budget already exists for this warehouse, month, and year
    const existingBudget = await this.prismaService.budget.findFirst({
      where: {
        warehouseId: validBudget.warehouseId,
        month: validBudget.month,
        year: validBudget.year,
      },
    });

    if (existingBudget) {
      throw new BadRequestException(
        `Budget untuk ${validBudget.month}/${validBudget.year} sudah ada untuk warehouse ini`,
      );
    }

    const budget = await this.prismaService.budget.create({
      data: {
        warehouseId: validBudget.warehouseId,
        month: validBudget.month,
        year: validBudget.year,
        amount: validBudget.amount,
      },
    });

    return {
      id: budget.id,
      warehouseId: budget.warehouseId,
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    };
  }

  async updateBudget(
    id: string,
    body: BudgetUpdateDto,
  ): Promise<BudgetResponseDto> {
    const validBudget = (await this.validationService.validate(
      BudgetValidation.UPDATE,
      { ...body, id },
    )) as BudgetUpdateDto;

    const existingBudget = await this.prismaService.budget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget tidak ditemukan');
    }

    const data: any = {};

    if (validBudget.month !== undefined) {
      data.month = validBudget.month;
    }

    if (validBudget.year !== undefined) {
      data.year = validBudget.year;
    }

    if (validBudget.amount !== undefined) {
      data.amount = validBudget.amount;
    }

    // If month or year is being updated, check for duplicates
    if (validBudget.month !== undefined || validBudget.year !== undefined) {
      const month = validBudget.month ?? existingBudget.month;
      const year = validBudget.year ?? existingBudget.year;

      const duplicateBudget = await this.prismaService.budget.findFirst({
        where: {
          warehouseId: existingBudget.warehouseId,
          month,
          year,
          id: { not: id },
        },
      });

      if (duplicateBudget) {
        throw new BadRequestException(
          `Budget untuk ${month}/${year} sudah ada untuk warehouse ini`,
        );
      }
    }

    const budget = await this.prismaService.budget.update({
      where: { id },
      data,
    });

    return {
      id: budget.id,
      warehouseId: budget.warehouseId,
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    };
  }

  async getBudgetsByWarehouse(
    warehouseId: string,
  ): Promise<BudgetResponseDto[]> {
    // Check if warehouse exists
    const warehouse = await this.prismaService.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse tidak ditemukan');
    }

    const budgets = await this.prismaService.budget.findMany({
      where: { warehouseId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return budgets.map((budget) => ({
      id: budget.id,
      warehouseId: budget.warehouseId,
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    }));
  }

  async getBudget(id: string): Promise<BudgetResponseDto> {
    const budget = await this.prismaService.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException('Budget tidak ditemukan');
    }

    return {
      id: budget.id,
      warehouseId: budget.warehouseId,
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    };
  }

  async deleteBudget(id: string): Promise<void> {
    const budget = await this.prismaService.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException('Budget tidak ditemukan');
    }

    await this.prismaService.budget.delete({
      where: { id },
    });
  }
}

