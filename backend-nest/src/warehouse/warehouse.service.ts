import {
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
import { User } from '@prisma/client';
import { ErrorResponse, SimpleSuccess } from 'src/models/error.model';

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
      location: entity.location,
      description: entity.description,
      members: entity.members?.map((member) => member.username) ?? [],
      budgetsCount: entity.budgets?.length ?? 0,
    };
  }

  async createWarehouse(
    body: WarehouseCreateDto,
  ): Promise<WarehouseResponseDto> {
    const validWarehouse = (await this.validationService.validate(
      WarehouseValidation.CREATE,
      body,
    )) as WarehouseCreateDto;

    const memberConnections = await this.resolveMembers(validWarehouse.members);

    const data: any = {
      name: validWarehouse.name,
      location: validWarehouse.location ?? null,
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
        budgets: true,
      },
    });

    return this.mapWarehouse(warehouse);
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

    if (validWarehouse.location !== undefined) {
      data.location = validWarehouse.location || null;
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
        budgets: true,
      },
    });

    return this.mapWarehouse(warehouse);
  }

  async getWarehouses(searchKey?: string): Promise<WarehouseResponseDto[]> {
    const warehouses = await this.prismaService.warehouse.findMany({
      where: searchKey
        ? {
            name: {
              contains: searchKey,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        members: true,
        budgets: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return warehouses.map((warehouse) => this.mapWarehouse(warehouse));
  }

  async getWarehouse(id: string): Promise<WarehouseResponseDto> {
    const warehouse = await this.prismaService.warehouse.findUnique({
      where: {
        id,
      },
      include: {
        members: true,
        budgets: true,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse tidak ditemukan');
    }

    return this.mapWarehouse(warehouse);
  }
  async deleteWarehouse(id: string): Promise<SimpleSuccess> {
    try {
      const result = await this.prismaService.warehouse.deleteMany({
        where: { id },
      });

      if (result.count === 0) {
        throw new NotFoundException('Warehouse tidak ditemukan');
      }

      return {
        message: 'Warehouse berhasil dihapus',
        statusCode: 200,
      };
    } catch (error) {
      // Prisma error misalnya invalid id, connection issue, dsb
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Gagal menghapus warehouse');
    }
  }
}
