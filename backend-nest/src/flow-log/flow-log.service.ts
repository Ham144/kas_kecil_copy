import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnalyticResponseDto,
  FlowLogType,
  GetAnalyticFilter,
  RecentFlowLogsFilter,
} from 'src/models/flow-log.model'; // Use local model
import { PrismaService } from 'src/common/prisma.service';
import { ErrorResponse } from 'src/models/error.model';
import {
  FlowLogCreateDto,
  FlowlogResponseDto,
} from 'src/models/flow-log.model';
import { GenerateCsvService } from 'src/common/generateCsv.service';
import { RedisService } from 'src/redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';
import { TokenPayload } from 'src/models/tokenPayload.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlowLogService {
  constructor(
    private readonly prismaService: PrismaService,
    private generateCsvService: GenerateCsvService,
    private redisService: RedisService,
  ) {}

  async createExpenseOrRevenue(
    createFlowLogDto: FlowLogCreateDto,
    userInfo: any,
  ): Promise<FlowlogResponseDto | ErrorResponse> {
    try {
      const warehouseId =
        (createFlowLogDto as any).warehousId ||
        (createFlowLogDto as any).warehouseId ||
        (createFlowLogDto as any).warehouse;

      const data: Prisma.FlowLogCreateInput = {
        title: createFlowLogDto.title,
        amount: createFlowLogDto.amount,
        note: createFlowLogDto.note,
        attachments: createFlowLogDto.attachments,
        date: new Date(createFlowLogDto.date),
        type: FlowLogType[createFlowLogDto.type],
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
        warehouse: {
          connect: {
            id: warehouseId,
          },
        },
      };

      if (warehouseId) {
        (data as any).warehouse = {
          connect: {
            id: warehouseId,
          },
        };
      }

      const flowLog = await this.prismaService.flowLog.create({
        data,
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
        date: flowLog.date,
        attachments: flowLog.attachments || [],
        type: flowLog.type as FlowLogType,
        createdAt: flowLog.createdAt,
        createdBy: userInfo.username,
        category: flowLog.category,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error creating expense: ${error.message}`,
      };
    }
  }

  async recentFlowLogs(filters: RecentFlowLogsFilter, userInfo: TokenPayload) {
    const {
      type,
      category,
      warehouse,
      page = 1,
      limit = 10,
      lightMode = true,
      searchKey,
      selectedDate,
      isDownload,
    } = filters;

    try {
      const isKasir = userInfo.role === 'KASIR';
      const where: Prisma.FlowLogWhereInput = {};

      // ✅ Filter dasar
      if (type !== FlowLogType.ALL) {
        where.type = type;
      }
      if (category != 'all' && category) {
        where.categoryId = String(category);
      }
      if (warehouse && warehouse !== 'all') {
        where.warehouseId = warehouse;
      }

      //jika kasir hanya munculin flow dari office nya
      if (isKasir) {
        where.warehouseId = userInfo.warehouseId;
      }

      // ✅ Filter pencarian
      if (searchKey && !isDownload) {
        where.title = {
          contains: searchKey,
          mode: 'insensitive',
        };
      }

      // ✅ Filter tanggal berdasarkan bulan dan tahun
      if (selectedDate) {
        let from: Date;
        let to: Date;
        // Asumsi selectedDate: "2025-11" atau "2025-11-01"
        const [yearStr, monthStr, dateStr] = selectedDate.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr); // 1–12
        const date = Number(dateStr);

        if (!isNaN(year) && !isNaN(month) && !isNaN(date)) {
          //mode date
          from = new Date(year, month - 1, date);
          to = new Date(year, month, new Date().getMonth(), 23, 59, 59, 999);
          where.createdAt = {
            gte: from,
            lte: to,
          };
        } else if (!isNaN(year) && !isNaN(month)) {
          //mode month
          from = new Date(year, month - 1, 1);
          to = new Date(year, month, 0, 23, 59, 59, 999);

          where.createdAt = {
            gte: from,
            lte: to,
          };
        } else {
          return new BadRequestException('Invalid date format');
        }
      }

      if (isDownload) {
        try {
          if (this.redisService.get(JSON.stringify(where))) {
            const csvFile = await this.redisService.get(JSON.stringify(where));

            //make csv in /uploads/report
            fs.promises.writeFile(
              path.join(
                process.cwd(),
                'uploads',
                'report',
                'cached-redis-report.csv',
              ),
              csvFile,
            );

            setTimeout(() => {
              fs.promises.unlink(
                path.join(
                  process.cwd(),
                  'uploads',
                  'report',
                  'cached-redis-report.csv',
                ),
              );
            }, 10000);

            return {
              url: `uploads/report/cached-redis-report.csv`,
            };
          }

          const logs = await this.prismaService.flowLog.findMany({
            where,
            include: {
              warehouse: true,
              createdBy: true,
              category: true,
            },
          });

          const csvFile = await this.generateCsvService.generateCsv(logs);
          await this.redisService.set(JSON.stringify(where), csvFile, 3600); //1 hour
          //make csv in /uploads/report
          fs.promises.writeFile(
            path.join(process.cwd(), 'uploads', 'report', `fresh-report.csv`),
            csvFile,
          );

          setTimeout(() => {
            fs.promises.unlink(
              path.join(process.cwd(), 'uploads', 'report', `fresh-report.csv`),
            );
          }, 10000);

          return {
            url: `uploads/report/fresh-report.csv`,
          };
        } catch (error) {
          return {
            statusCode: 500,
            message: error.message || 'Internal server error',
          };
        }
      }

      // ✅ Query data dan total paralel
      const [logs, total] = await Promise.all([
        this.prismaService.flowLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
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

      // ✅ Kembalikan hasil dengan meta info
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
        message: error.message || 'Internal server error',
      };
    }
  }

  async getAnalytics(userInfo: TokenPayload, filter: GetAnalyticFilter) {
    const { selectedDate, selectedWarehouseId, selectedCategoryId } = filter;

    const [yearStr, monthStr, dateStr] = selectedDate.toString().split('-');

    const selectedDateObj = new Date(selectedDate);
    const currentMonth = selectedDateObj.getMonth(); //jangan +1 disini, memang gitu
    const currentYear = selectedDateObj.getFullYear();

    let from;
    let to;

    if (dateStr) {
      //mode date
      from = new Date(currentYear, currentMonth, Number(dateStr));
      to = new Date(currentYear, currentMonth, Number(dateStr), 23, 59, 59);
    } else {
      //mode month
      from = new Date(currentYear, currentMonth, 1);
      to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    }

    // Base filter (bisa diperluas)
    const baseWhere: any = {
      createdAt: { gte: from, lte: to },
      ...(selectedWarehouseId !== 'all' && {
        warehouseId: selectedWarehouseId,
      }),
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
    const currentBudget =
      selectedWarehouseId === 'all'
        ? { amount: 0 }
        : await this.prismaService.budget.findFirst({
            where: {
              ...(selectedWarehouseId !== 'all' && {
                categoryId: selectedCategoryId,
              }),
              month: Number(currentMonth + 1),
              year: Number(currentYear),
            },
          });

    if (typeof currentBudget?.amount !== 'number')
      throw new NotFoundException(
        `Budget warehouse dipilih untuk bulan ${currentMonth + 1} belum dibuat. Silahkan setup terlebih dahulu`,
      );

    const budgetSpent = totalInflow - totalOutflow;
    const budgetRemaining = currentBudget.amount - budgetSpent;

    // 🔹6. Daily line data/ flow over time (OUT &IN)
    //filternya beda sendiri
    const startMonth = new Date(currentYear, currentMonth, 1);
    const endMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const flowOverTimeRaw = await this.prismaService.flowLog.groupBy({
      by: ['createdAt', 'type'],
      _sum: { amount: true },
      where: {
        createdAt: { gte: startMonth, lte: endMonth },
        ...(selectedWarehouseId !== 'all' && {
          warehouseId: selectedWarehouseId,
        }),
      },
      orderBy: { createdAt: 'asc' },
    });

    const flowOverTime = flowOverTimeRaw.reduce(
      (acc, curr) => {
        // pastikan dibuat string tanggal tanpa jam
        const date = curr.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"

        // cari apakah tanggal sudah ada di akumulasi
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing[curr.type] =
            (existing[curr.type] || 0) + (curr._sum.amount ?? 0);
        } else {
          acc.push({
            date,
            [curr.type]: curr._sum.amount ?? 0,
          });
        }
        return acc;
      },
      [] as { date: string; IN?: number; OUT?: number }[],
    );
    const categoriesToBudget = [];
    for (const category of categoriesWithNameRaw) {
      const budget = await this.prismaService.budget.findFirst({
        where: {
          categoryId: category.categoryId,
          month: Number(currentMonth + 1),
          year: Number(currentYear),
        },
      });

      // 🔹 Ambil nilai amount dengan aman
      const budgetAmount = budget?.amount || 0;

      const totalInflowAgg = await this.prismaService.flowLog.aggregate({
        _sum: { amount: true },
        where: { ...baseWhere, type: 'IN', categoryId: category.categoryId },
      });
      const totalInflow = totalInflowAgg._sum.amount || 0;

      const totalOutflowAgg = await this.prismaService.flowLog.aggregate({
        _sum: { amount: true },
        where: { ...baseWhere, type: 'OUT', categoryId: category.categoryId },
      });
      const totalOutflow = totalOutflowAgg._sum.amount || 0;

      const budgetSpent = totalInflow - totalOutflow;

      // 🔹 Gunakan budgetAmount, bukan currentBudget
      const budgetRemaining = budgetAmount - budgetSpent;

      categoriesToBudget.push({
        totalSpent: budgetSpent, // Biasanya spent itu total pengeluaran
        budgetRemaining: budgetRemaining,
        budget: budgetAmount,
        name: category.name,
      });
    }

    // 🔹8. Bentuk response final (pertahankan field lama, tambah field baru)
    const analytics: AnalyticResponseDto = {
      totalInflow,
      totalOutflow,
      budgetRemaining,
      budgetSpent,
      topCategories: categoriesWithNameRaw,
      topWarehouses,
      categoriesToBudget,
      currentMonthBudget: currentBudget.amount,
      flowOverTime,
    };

    return analytics;
  }
}
