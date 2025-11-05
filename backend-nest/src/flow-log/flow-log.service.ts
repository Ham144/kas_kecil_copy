import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnalyticResponseDto,
  FlowLogType,
  GetAnalyticFilter,
} from 'src/models/flow-log.model'; // Use local model
import { PrismaService } from 'src/common/prisma.service';
import { ErrorResponse } from 'src/models/error.model';
import {
  FlowLogCreateDto,
  FlowlogResponseDto,
} from 'src/models/flow-log.model';
import { WarehouseResponseDto } from 'src/models/warehouse.model';

@Injectable()
export class FlowLogService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    createFlowLogDto: FlowLogCreateDto,
    userInfo: any,
  ): Promise<FlowlogResponseDto | ErrorResponse> {
    try {
      const flowLog = await this.prismaService.flowLog.create({
        data: {
          title: createFlowLogDto.title,
          amount: createFlowLogDto.amount,
          note: createFlowLogDto.note,
          attachments: createFlowLogDto.attachments,
          type: 'OUT',
          warehouse: {
            connect: {
              id: userInfo.warehouseId,
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
        attachments: flowLog.attachments || [],
        type: FlowLogType.OUT, // Ensure this matches the expected enum value
        createdAt: flowLog.createdAt,
        createdBy: userInfo.username,
        category: flowLog.category, // Correctly reference the category property
      };
    } catch (error) {
      console.log(error.message);
      return {
        statusCode: 500,
        message: `Error creating expense: ${error.message}`,
      };
    }
  }

  async createRevenue(
    createFlowLogDto: FlowLogCreateDto,
    userInfo: any,
  ): Promise<FlowlogResponseDto | ErrorResponse> {
    try {
      const flowLog = await this.prismaService.flowLog.create({
        data: {
          title: createFlowLogDto.title,
          amount: createFlowLogDto.amount,
          note: createFlowLogDto.note,
          attachments: createFlowLogDto.attachments,
          type: 'IN',
          warehouse: {
            connect: {
              id: userInfo.warehouseId,
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
        attachments: flowLog.attachments || [],
        type: FlowLogType.IN, // Ensure this matches the expected enum value
        createdAt: flowLog.createdAt,
        createdBy: userInfo.username,
        category: flowLog.category, // Correctly reference the category property
      };
    } catch (error) {
      console.log(error.message);
      return {
        statusCode: 500,
        message: `Error creating expense: ${error.message}`,
      };
    }
  }

  async recentFlowLogs(filters: any) {
    const {
      type,
      category,
      warehouse,
      page = 1,
      limit = 10,
      lightMode = true,
    } = filters;
    try {
      const where: any = {};
      if (type) where.type = type;
      if (category) where.categoryId = category;
      if (warehouse) where.warehouseId = warehouse;

      const [logs, total] = await Promise.all([
        this.prismaService.flowLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: Number(limit),
          include: {
            warehouse: lightMode ? { select: { id: true, name: true } } : true,
            createdBy: lightMode
              ? { select: { username: true, displayName: true } }
              : true,
            category: lightMode ? { select: { id: true, name: true } } : true,
          },
        }),
        this.prismaService.flowLog.count({ where }),
      ]);

      return {
        logs,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  async getAnalytics(userInfo: any, filter: GetAnalyticFilter) {
    const { selectedDate, selectedWarehouseId } = filter;

    const selectedDateObj = new Date(selectedDate);
    const currentMonth = selectedDateObj.getMonth(); //jangan +1 disini, memang gitu
    const currentYear = selectedDateObj.getFullYear();

    // Awal bulan ini (misal 2025-11-01 00:00:00)
    const from = new Date(currentYear, currentMonth, 1);

    // Akhir bulan ini (misal 2025-11-30 23:59:59)
    const to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Base filter (bisa diperluas)
    const baseWhere: any = {
      createdAt: { gte: from, lte: to },
      warehouseId:
        selectedWarehouseId === 'all' ? undefined : selectedWarehouseId,
    };

    // 🔹1. Total Inflow
    const totalInflowAgg = await this.prismaService.flowLog.aggregate({
      _sum: { amount: true },
      where: { ...baseWhere, type: 'IN' },
    });
    const totalInflow = totalInflowAgg._sum.amount || 0;

    // 🔹2. Total Outflow
    const totalOutflowAgg = await this.prismaService.flowLog.aggregate({
      _sum: { amount: true },
      where: { ...baseWhere, type: 'OUT' },
    });
    const totalOutflow = totalOutflowAgg._sum.amount || 0;

    // 🔹3. Top 5 Categories (by sum amount OUT)
    const topCategories = await this.prismaService.flowLog.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { ...baseWhere },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Ambil detail nama kategori (biar output lebih bagus)
    const categoriesWithNameRaw = await Promise.all(
      topCategories.map(async (c) => {
        const category = await this.prismaService.flowLogCategory.findUnique({
          where: { id: c.categoryId },
        });
        const amount = c._sum.amount || 0;
        return {
          categoryId: c.categoryId,
          categoryName: category?.name || 'Unknown',
          name: category?.name || 'Unknown',
          total: amount,
          amount, // for BarChart dataKey="amount"
          value: amount, // for PieChart dataKey="value"
        };
      }),
    );

    // 🔹4. Top 5 Warehouses (OUT)
    const topWarehousesGroup = await this.prismaService.flowLog.groupBy({
      by: ['warehouseId'],
      _sum: { amount: true },
      where: { ...baseWhere, type: 'OUT' },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const topWarehouses = await Promise.all(
      topWarehousesGroup.map(async (w) => {
        const warehouse = await this.prismaService.warehouse.findUnique({
          where: { id: w.warehouseId },
        });
        return {
          id: warehouse?.id || w.warehouseId,
          name: warehouse?.name || 'Unknown',
          total: w._sum.amount || 0,
        };
      }),
    );

    // 🔹5. Budget
    const currentBudget = await this.prismaService.budget.findFirst({
      where: {
        warehouseId: userInfo.warehouseId,
        month: Number(currentMonth + 1),
        year: Number(currentYear),
      },
    });

    if (!currentBudget)
      throw new NotFoundException(
        'Budget warehouse anda untuk bulan ini belum dibuat. Silahkan setup terlebih dahulu.',
      );

    const budgetSpent = totalOutflow;
    const budgetRemaining = currentBudget.amount - budgetSpent;

    // 🔹6. Daily line data (OUT only)
    const flowOverTimeRaw = await this.prismaService.$queryRaw<
      { day: number; type: 'IN' | 'OUT'; total: number }[]
    >`
    SELECT 
      EXTRACT(DAY FROM "createdAt")::int AS day,
      "type",
      SUM("amount")::float AS total
    FROM "FlowLog"
    WHERE "warehouseId" = ${baseWhere.warehouseId}
      AND EXTRACT(MONTH FROM "createdAt") = ${currentMonth + 1}
      AND EXTRACT(YEAR FROM "createdAt") = ${currentYear}
    GROUP BY day, "type"
    ORDER BY day;
  `;

    // Gabungkan jadi satu objek per hari
    const grouped: Record<number, { IN: number; OUT: number }> = {};
    for (const row of flowOverTimeRaw) {
      if (!grouped[row.day]) grouped[row.day] = { IN: 0, OUT: 0 };
      grouped[row.day][row.type] = row.total;
    }

    // Ubah ke array cocok untuk chart
    const flowOverTime = Object.entries(grouped).map(([day, totals]) => ({
      date: day,
      IN: totals.IN || 0,
      OUT: totals.OUT || 0,
    }));

    // 🔹8. Bentuk response final (pertahankan field lama, tambah field baru)
    const analytics: AnalyticResponseDto = {
      totalInflow,
      totalOutflow,
      budgetRemaining,
      budgetSpent,
      topCategories: categoriesWithNameRaw,
      topWarehouses,
      currentMonthBudget: currentBudget.amount,
      flowOverTime,
    };

    return analytics;
  }
}
