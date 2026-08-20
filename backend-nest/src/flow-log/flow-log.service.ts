import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnalyticResponseDto,
  FlowLogType,
  FLowLogUpdate,
  GetAnalyticFilter,
  RecentFlowLogsFilter,
} from 'src/models/flow-log.model'; // Use local model
import { PrismaService } from 'src/common/prisma.service';
import { ErrorResponse, SimpleSuccess } from 'src/models/error.model';
import {
  FlowLogCreateDto,
  FlowlogResponseDto,
} from 'src/models/flow-log.model';
import { GenerateCsvService } from 'src/common/generateCsv.service';
import { RedisService } from 'src/redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';
import { TokenPayload } from 'src/models/tokenPayload.model';
import { Prisma, ROLE } from '@prisma/client';
import { isAllQueryValue } from 'src/common/query-value.util';
import { parseSelectedDateRange } from 'src/common/selected-date.util';

@Injectable()
export class FlowLogService {
  private readonly analyticCachePrefix = 'analytic:v2';

  constructor(
    private readonly prismaService: PrismaService,
    private generateCsvService: GenerateCsvService,
    private redisService: RedisService,
  ) {}

  private isPrivilegedRole(role: ROLE) {
    return (
      role === ROLE.ADMIN ||
      role === ROLE.IT ||
      role === ROLE.SUPERVISION
    );
  }

  private async invalidateAnalyticsCache(
    warehouseId: string,
    date: Date,
  ): Promise<void> {
    if (!warehouseId || !date || Number.isNaN(date.getTime())) {
      return;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    await Promise.all([
      this.redisService.del(`${this.analyticCachePrefix}:${warehouseId}:${year}-${month}`),
      this.redisService.del(
        `${this.analyticCachePrefix}:${warehouseId}:${year}-${month}-${day}`,
      ),
    ]);
  }

  async createExpenseOrRevenue(
    createFlowLogDto: FlowLogCreateDto,
    userInfo: any,
  ): Promise<FlowlogResponseDto | ErrorResponse> {
    try {
      const warehouseId = createFlowLogDto.warehouseId;

      if (!warehouseId) {
        throw new BadRequestException('warehouseId wajib dipilih');
      }

      const isValid = await this.prismaService.flowLogCategory.findFirst({
        where: {
          id: createFlowLogDto.category,
          warehouseId,
        },
      });
      if (!isValid) {
        throw new BadRequestException(
          'category tidak termasuk di warehouse dipilih',
        );
      }

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
      if (error instanceof BadRequestException) {
        throw error;
      }
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

      // ? Filter dasar
      const normalizedType = type?.toString().toUpperCase();
      if (normalizedType && normalizedType !== FlowLogType.ALL) {
        where.type = normalizedType as 'IN' | 'OUT';
      }
      if (category && !isAllQueryValue(category)) {
        where.categoryId = String(category);
      }
      if (warehouse && !isAllQueryValue(warehouse)) {
        where.warehouseId = warehouse;
      }

      //jika kasir hanya munculin flow dari office nya
      if (isKasir) {
        where.warehouseId = userInfo.warehouseId;
      }

      // ? Filter pencarian
      if (searchKey && !isDownload) {
        where.title = {
          contains: searchKey,
          mode: 'insensitive',
        };
      }

      // ? Filter tanggal berdasarkan bulan dan tahun
      if (selectedDate) {
        const range = parseSelectedDateRange(selectedDate);
        if (!range) {
          return new BadRequestException('Invalid date format');
        }

        const { from, to } = range;
        where.date = {
          gte: from,
          lte: to,
        };
      }

      if (isDownload) {
        try {
          const cacheKey = JSON.stringify(where);
          const cachedCsv = await this.redisService.get(cacheKey);
          if (cachedCsv) {
            const filename = 'cached-redis-report.csv';
            const reportPath = path.join(
              process.cwd(),
              'uploads',
              'report',
              filename,
            );

            //make csv in /uploads/report
            await fs.promises.writeFile(reportPath, cachedCsv);

            setTimeout(() => {
              fs.promises.unlink(reportPath).catch(() => undefined);
            }, 10000);

            return {
              url: `/uploads/report/${filename}`,
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
          await this.redisService.set(cacheKey, csvFile, 3600); //1 hour
          const filename = 'fresh-report.csv';
          const reportPath = path.join(
            process.cwd(),
            'uploads',
            'report',
            filename,
          );
          //make csv in /uploads/report
          await fs.promises.writeFile(reportPath, csvFile);

          setTimeout(() => {
            fs.promises.unlink(reportPath).catch(() => undefined);
          }, 10000);

          return {
            url: `/uploads/report/${filename}`,
          };
        } catch (error) {
          return {
            statusCode: 500,
            message: error.message || 'Internal server error',
          };
        }
      }

      // ? Query data dan total paralel
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

      // ? Kembalikan hasil dengan meta info
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

  async getAnalytics(filter: GetAnalyticFilter) {
    const { selectedDate, selectedWarehouseId } = filter;

    const range = parseSelectedDateRange(selectedDate);
    if (!range) {
      throw new BadRequestException('Invalid date format');
    }

    const { from, to } = range;
    const [yearStr, monthStr] = selectedDate.toString().split('-');
    const currentYear = Number(yearStr);
    const currentMonth = Number(monthStr) - 1;

    // Base filter (bisa diperluas)
    const baseWhere: any = {
      date: { gte: from, lte: to },
    };

    if (selectedWarehouseId && !isAllQueryValue(selectedWarehouseId)) {
      baseWhere.warehouseId = selectedWarehouseId;
    }
    // ??1. Total Inflow
    const totalInflowAgg = await this.prismaService.flowLog.aggregate({
      _sum: { amount: true },
      where: { ...baseWhere, type: 'IN' },
    });
    const totalInflow = totalInflowAgg._sum.amount || 0;

    // ??2. Total Outflow
    const totalOutflowAgg = await this.prismaService.flowLog.aggregate({
      _sum: { amount: true },
      where: { ...baseWhere, type: 'OUT' },
    });
    const totalOutflow = totalOutflowAgg._sum.amount || 0;

    // ??3. Top 5 Categories (by sum amount OUT)
    const topCategoriesInOut = await this.prismaService.flowLog.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { ...baseWhere },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    const topCategoriesExpense = await this.prismaService.flowLog.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { ...baseWhere, type: 'OUT' },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    // Ambil detail nama kategori (biar output lebih bagus)
    const categoriesWithNameRaw = await Promise.all(
      topCategoriesExpense.map(async (c) => {
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

    const categoriesWithNameRawAll = await Promise.all(
      topCategoriesInOut.map(async (c) => {
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

    // ??4. Top 5 Warehouses (OUT)
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

    // ??5. Budget
    const currentBudget = {
      amount: 0,
    };
    let totalBudgetAmount = 0;

    const budgetFilter: any = {
      month: Number(currentMonth + 1),
      year: Number(currentYear),
    };

    // Jika bukan 'all', tambahkan filter berdasarkan warehouseId melalui relasi category
    if (!isAllQueryValue(selectedWarehouseId)) {
      budgetFilter.category = {
        warehouseId: selectedWarehouseId,
      };
    }

    const result = await this.prismaService.budget.aggregate({
      _sum: {
        amount: true,
      },
      where: budgetFilter,
    });

    totalBudgetAmount = result._sum.amount || 0;

    if (typeof currentBudget?.amount !== 'number')
      throw new NotFoundException(
        `Budget category pada warehouse dipilih untuk bulan ${currentMonth + 1} belum dibuat. Silahkan setup terlebih dahulu`,
      );

    // Hitung selisih murni (net flow)
    const netFlow = totalInflow - totalOutflow;

    // Jika netFlow negatif (misal -4.5jt), berarti ada pengeluaran bersih.
    // Kita ubah jadi positif agar bisa mengurangi budgetAmount.
    const budgetSpent = Math.abs(netFlow);

    const budgetRemaining = currentBudget.amount - budgetSpent;

    // ??6. Daily line data/ flow over time (OUT &IN)
    //filternya beda sendiri
    const startMonth = new Date(currentYear, currentMonth, 1);
    const endMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const flowOverTimeRaw = await this.prismaService.flowLog.groupBy({
      by: ['createdAt', 'type'],
      _sum: { amount: true },
      where: {
        createdAt: { gte: startMonth, lte: endMonth },
        ...(!isAllQueryValue(selectedWarehouseId) && {
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
    for (const category of categoriesWithNameRawAll) {
      const budgetWhere: any = {
        categoryId: category.categoryId,
        month: Number(currentMonth + 1),
        year: Number(currentYear),
      };

      if (!isAllQueryValue(selectedWarehouseId)) {
        budgetWhere.category = {
          warehouseId: selectedWarehouseId,
        };
      }

      const budget = await this.prismaService.budget.findFirst({
        where: budgetWhere,
      });

      // ?? Ambil nilai amount dengan aman
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
      // 1. Total Pengeluaran murni (inilah yang benar-benar 'spent')
      const budgetSpent = totalOutflow;

      // 2. Net Flow (Selisih pemasukan dan pengeluaran di kategori tersebut)
      // Jika Inflow > Outflow, hasilnya positif. Jika sebaliknya, negatif.
      const netEffect = totalInflow - totalOutflow;

      // 3. Sisa Budget
      // Budget awal ditambah dengan net effect (masuk dikurang keluar)
      const budgetRemaining = budgetAmount + netEffect;

      categoriesToBudget.push({
        totalSpent: budgetSpent, // Realita pengeluaran
        totalInflow: totalInflow, // Opsional: untuk tracking pemasukan di kategori itu
        budgetRemaining: budgetRemaining,
        budget: budgetAmount,
        name: category.name,
      });
    }

    // ??8. Bentuk response final (pertahankan field lama, tambah field baru)
    const analytics: AnalyticResponseDto = {
      totalInflow,
      totalOutflow,
      budgetRemaining,
      budgetSpent,
      topCategories: categoriesWithNameRaw,
      topWarehouses,
      categoriesToBudget,
      currentMonthBudget: totalBudgetAmount,
      flowOverTime,
    };

    return analytics;
  }

  async updateFlow(
    id: string,
    body: FLowLogUpdate,
    userInfo: TokenPayload,
  ): Promise<SimpleSuccess | ErrorResponse> {
    try {
      const existingFlow = await this.prismaService.flowLog.findUnique({
        where: {
          id,
        },
      });

      if (!existingFlow) {
        throw new NotFoundException('Tidak ditemukan dengan id tersebut');
      }

      if (
        existingFlow.createdByUsername !== userInfo.username &&
        !this.isPrivilegedRole(userInfo.role)
      ) {
        throw new ForbiddenException('Anda tidak memiliki izin melakukan request ini');
      }

      const data: Prisma.FlowLogUpdateInput = {};

      if (body.note !== undefined) {
        data.note = body.note;
      }

      if (body.date !== undefined) {
        const nextDate = new Date(body.date);
        if (Number.isNaN(nextDate.getTime())) {
          throw new BadRequestException('Invalid date format');
        }
        data.date = nextDate;
      }

      if (body.category !== undefined) {
        const isValidCategory = await this.prismaService.flowLogCategory.findFirst({
          where: {
            id: body.category,
            warehouseId: existingFlow.warehouseId,
          },
        });

        if (!isValidCategory) {
          throw new BadRequestException(
            'category tidak termasuk di warehouse dipilih',
          );
        }

        data.category = {
          connect: {
            id: body.category,
          },
        };
      }

      if (Object.keys(data).length === 0) {
        throw new BadRequestException('Tidak ada data yang diubah');
      }

      const updatedFlow = await this.prismaService.flowLog.update({
        where: {
          id,
        },
        data,
        include: {
          warehouse: true,
          category: true,
          createdBy: true,
        },
      });

      await Promise.all([
        this.invalidateAnalyticsCache(existingFlow.warehouseId, existingFlow.date),
        this.invalidateAnalyticsCache(updatedFlow.warehouseId, updatedFlow.date),
      ]);

      return {
        statusCode: 200,
        message: 'berhasil update flow',
      }
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        const message =
          typeof response === 'string'
            ? response
            : (response as { message?: string }).message || error.message;

        return {
          statusCode: error.getStatus(),
          message,
        };
      }

      return {
        statusCode: 500,
        message: error?.message || 'Terjadi kesalahan server saat update flow',
      }
    }
  }
  
  async deleteFlow(
    id: string,
    userInfo: TokenPayload,
  ): Promise<SimpleSuccess | ErrorResponse> {
    try {
      const logToDelete = await this.prismaService.flowLog.findUnique({
        where: {
          id: id,
        },
      });

      if (!logToDelete) {
        throw new NotFoundException('Tidak ditemukan dengan id tersebut');
      }

      if (
        logToDelete.createdByUsername !== userInfo.username &&
        !this.isPrivilegedRole(userInfo.role)
      ) {
        throw new ForbiddenException('Anda tidak memiliki izin melakukan request ini');
      }

      await this.prismaService.flowLog.delete({
        where: {
          id: id,
        },
      });

      await this.invalidateAnalyticsCache(
        logToDelete.warehouseId,
        logToDelete.date,
      );

      return {
        statusCode: 200,
        message: 'Berhasil menghapus',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        const message =
          typeof response === 'string'
            ? response
            : (response as { message?: string }).message || error.message;

        return {
          statusCode: error.getStatus(),
          message,
        };
      }

      return {
        statusCode: 500,
        message: error?.message || 'Terjadi kesalahan server',
      }
    }
  }
}
