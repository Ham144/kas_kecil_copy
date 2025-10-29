import { Injectable } from '@nestjs/common';
import { WarehouseValidation } from './warehouse.validation';
import {
  WarehouseCreateDto,
  WarehouseResponseDto,
  WarehouseUpdateDto,
} from 'src/models/warehouse.model';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async createWarehouse(body: WarehouseCreateDto) {
    // 1️⃣ Validasi input pakai Zod
    const validWarehouse = (await this.validationService.validate(
      WarehouseValidation.CREATE,
      body,
    )) as WarehouseCreateDto;

    // 2️⃣ Ubah array username -> array of { username }
    const memberConnections = await Promise.all(
      validWarehouse.members.map(async (username) => {
        const user = await this.prismaService.user.findUnique({
          where: { username },
        });
        if (!user) {
          throw new Error(`User ${username} tidak ditemukan`);
        }
        return { username: user.username };
      }),
    );

    // 3️⃣ Simpan ke DB
    await this.prismaService.warehouse.create({
      data: {
        name: validWarehouse.name,
        members: {
          connect: memberConnections, // connect by username
        },
      },
    });

    // 4️⃣ Ambil semua warehouse (include members)
    const warehouses = await this.prismaService.warehouse.findMany({
      include: {
        members: true,
      },
    });

    return warehouses as WarehouseResponseDto[];
  }

  async updateWarehouse(body: WarehouseUpdateDto) {
    const validWarehouse = (await this.validationService.validate(
      WarehouseValidation.UPDATE,
      body,
    )) as WarehouseUpdateDto;

    //get members
    const members = await this.prismaService.user.findMany({
      where: {
        username: {
          in: validWarehouse.members,
        },
      },
    });

    await this.prismaService.warehouse.update({
      where: {
        id: body.id,
      },
      data: {
        name: validWarehouse.name,
        members: {
          connect: members,
        },
      },
    });

    return {
      message: 'success',
      statusCode: 200,
    };
  }

  async findAll(searchKey: string): Promise<WarehouseResponseDto[]> {
    return await this.prismaService.warehouse.findMany({
      include: { members: true },
    });
  }

  async deleteWarehouse(id: string): Promise<WarehouseResponseDto[]> {
    await this.prismaService.warehouse.delete({
      where: {
        id: id,
      },
    });

    return await this.prismaService.warehouse.findMany({
      include: { members: true },
    });
  }
}
