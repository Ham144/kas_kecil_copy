import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WarehouseValidation } from './warehouse.validation';
import {
  WarehouseCreateDto,
  WarehouseResponseDto,
  WarehouseUpdateDto,
} from 'src/models/warehouse.model';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { ROLE, User } from '@prisma/client';
import { SimpleSuccess } from 'src/models/error.model';
import { TokenPayload } from 'src/models/tokenPayload.model';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  private async resolveMembers(usernames?: string[]) {
    if (!usernames || usernames.length === 0) {
      return [];
    }

    const users = await this.prismaService.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
    });

    const foundUsernames = new Set(users.map((user) => user.username));

    const missingUsers = usernames.filter(
      (username) => !foundUsernames.has(username),
    );
    if (missingUsers.length > 0) {
      throw new NotFoundException(
        `User${missingUsers.length > 1 ? 's' : ''} ${missingUsers.join(', ')} tidak ditemukan`,
      );
    }

    return users.map((user: User) => ({ username: user.username }));
  }

  private mapWarehouse(entity: any): WarehouseResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      members: entity.members?.map((member) => member.username) ?? [],
      budgetsCount: entity.budgets?.length ?? 0,
    };
  }

  async createWarehouse(
    body: WarehouseCreateDto,
  ): Promise<WarehouseResponseDto> {
    try {
      const validWarehouse = (await this.validationService.validate(
        WarehouseValidation.CREATE,
        body,
      )) as WarehouseCreateDto;

      const memberConnections = await this.resolveMembers(
        validWarehouse.members,
      );

      const data: any = {
        name: validWarehouse.name,
        description: validWarehouse.description ?? null,
      };

      if (memberConnections.length > 0) {
        data.members = {
          connect: memberConnections,
        };
      }

      const warehouse = await this.prismaService.warehouse.create({
        data,
        include: {
          members: true,
        },
      });

      return this.mapWarehouse(warehouse);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Nama Warehouse sudah ada', error);
      }
      throw new BadRequestException(error.message);
    }
  }

  async updateWarehouse(
    id: string,
    body: WarehouseUpdateDto,
  ): Promise<WarehouseResponseDto> {
    const validWarehouse = (await this.validationService.validate(
      WarehouseValidation.UPDATE,
      { ...body, id },
    )) as WarehouseUpdateDto;

    const data: any = {};

    if (validWarehouse.name !== undefined) {
      data.name = validWarehouse.name;
    }

    if (validWarehouse.description !== undefined) {
      data.description = validWarehouse.description || null;
    }

    if (validWarehouse.members !== undefined) {
      const memberConnections = await this.resolveMembers(
        validWarehouse.members,
      );
      data.members = {
        set: [],
        ...(memberConnections.length > 0
          ? {
              connect: memberConnections,
            }
          : {}),
      };
    }

    const warehouse = await this.prismaService.warehouse.update({
      where: {
        id,
      },
      data,
      include: {
        members: true,
      },
    });

    return this.mapWarehouse(warehouse);
  }

  async getWarehouses(
    searchKey?: string,
    userInfo?: TokenPayload,
  ): Promise<WarehouseResponseDto[]> {
    let where: any = {};

    if (userInfo.role === ROLE.IT || userInfo.role === ROLE.ADMIN) {
      // Bentuk where dasar
      where = {
        ...(searchKey && {
          name: {
            contains: searchKey,
            mode: 'insensitive',
          },
        }),
      };
    }

    // Jika bukan superadmin, tampilkan hanya warehouse miliknya
    if (userInfo.role !== ROLE.IT && userInfo.role !== ROLE.ADMIN) {
      where.members = {
        some: {
          username: userInfo.username,
        },
      };
    }

    // Query prisma
    const warehouses = await this.prismaService.warehouse.findMany({
      where,
      include: {
        members: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return warehouses.map((warehouse) => this.mapWarehouse(warehouse));
  }
  async deleteWarehouse(id: string): Promise<SimpleSuccess> {
    return await this.prismaService
      .$transaction(async (tx) => {
        // 1. Cek dulu apakah gudangnya ada?
        const warehouse = await tx.warehouse.findUnique({
          where: { id },
          include: {
            // Ambil kategori lewat flowLogs untuk hapus budget
            flowLogs: { include: { warehouse: true } },
          },
        });

        if (!warehouse) {
          throw new NotFoundException('Warehouse tidak ditemukan');
        }

        // 2. Kumpulkan ID kategori yang bersangkutan
        const categoryIds = warehouse.flowLogs.map((log) => log.categoryId);

        // 3. Eksekusi hapus berurutan (Anak -> Bapak)
        if (categoryIds.length > 0) {
          await tx.budget.deleteMany({
            where: { categoryId: { in: categoryIds } },
          });
        }

        await tx.flowLog.deleteMany({
          where: { warehouseId: id },
        });

        await tx.warehouse.delete({
          where: { id },
        });

        return {
          message: 'Warehouse dan data terkait berhasil dihapus',
          statusCode: 200,
        };
      })
      .catch((error) => {
        // Jika error sudah berupa NestJS Exception (seperti NotFound), lempar lagi saja
        if (error instanceof HttpException) throw error;

        console.error('Delete error:', error);
        throw new InternalServerErrorException(
          'Gagal menghapus warehouse karena masalah sistem',
        );
      });
  }
}
