import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto, RegionStatus } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async create(createRegionDto: CreateRegionDto) {
    try {
      // Check if region with same name already exists
      const existingRegion = await this.prisma.region.findUnique({
        where: { name: createRegionDto.name },
      });

      if (existingRegion) {
        throw new BadRequestException(`Region with name '${createRegionDto.name}' already exists`);
      }

      const region = await this.prisma.region.create({
        data: {
          name: createRegionDto.name,
          status: createRegionDto.status || 'ACTIVE',
        },
      });

      return {
        success: true,
        region,
        message: 'Region created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create region: ' + error.message);
    }
  }

  async findAll(filters: {
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        status,
        search,
        skip = 0,
        take = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where clause
      const where: any = {};

      if (status && status !== 'all') {
        where.status = status.toUpperCase();
      }

      if (search) {
        where.name = {
          contains: search,
        };
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'status') {
        orderBy.status = sortOrder;
      } else if (sortBy === 'updatedAt') {
        orderBy.updatedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [regions, total] = await Promise.all([
        this.prisma.region.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        this.prisma.region.count({ where }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / take);
      const currentPage = Math.floor(skip / take) + 1;
      const hasMore = skip + take < total;

      return {
        regions,
        total,
        pagination: {
          page: currentPage,
          limit: take,
          total,
          totalPages,
          hasMore,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch regions: ' + error.message);
    }
  }

  async findOne(id: string) {
    try {
      const region = await this.prisma.region.findUnique({
        where: { id },
      });

      if (!region) {
        throw new NotFoundException(`Region with ID ${id} not found`);
      }

      return region;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch region: ' + error.message);
    }
  }

  async update(id: string, updateRegionDto: UpdateRegionDto) {
    try {
      // Check if region exists
      const existingRegion = await this.findOne(id);

      // If name is being updated, check if another region already has that name
      if (updateRegionDto.name && updateRegionDto.name !== existingRegion.name) {
        const duplicateRegion = await this.prisma.region.findUnique({
          where: { name: updateRegionDto.name },
        });

        if (duplicateRegion) {
          throw new BadRequestException(`Region with name '${updateRegionDto.name}' already exists`);
        }
      }

      const updatedRegion = await this.prisma.region.update({
        where: { id },
        data: {
          name: updateRegionDto.name,
          status: updateRegionDto.status,
        },
      });

      return {
        success: true,
        region: updatedRegion,
        message: 'Region updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update region: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      // Check if region exists
      await this.findOne(id);

      await this.prisma.region.delete({
        where: { id },
      });

      return { message: 'Region deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete region: ' + error.message);
    }
  }

  async getRegionStats() {
    try {
      const [
        totalRegions,
        activeRegions,
        inactiveRegions,
      ] = await Promise.all([
        this.prisma.region.count(),
        this.prisma.region.count({ where: { status: 'ACTIVE' } }),
        this.prisma.region.count({ where: { status: 'INACTIVE' } }),
      ]);

      return {
        totalRegions,
        activeRegions,
        inactiveRegions,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch region statistics: ' + error.message);
    }
  }

  async toggleStatus(id: string) {
    try {
      // Check if region exists
      const existingRegion = await this.findOne(id);

      // Toggle status
      const newStatus = existingRegion.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      const updatedRegion = await this.prisma.region.update({
        where: { id },
        data: {
          status: newStatus,
        },
      });

      return {
        success: true,
        region: updatedRegion,
        message: `Region ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle region status: ' + error.message);
    }
  }

  // NEW: Get regions by game name with vendor information
  async getRegionsByGame(gameName: string) {
    try {
      // Get packages with vendor information for the specified game
      const packages = await this.prisma.package.findMany({
        where: {
          gameName: {
            contains: gameName,
          },
        },
        select: {
          region: true,
          vendorRate: {
            select: {
              vendorName: true,
            },
          },
        },
        distinct: ['region'],
        orderBy: {
          region: 'asc',
        },
      });

      // Map to get regions with vendor information
      return packages.map(p => ({
        region: p.region,
        vendorName: p.vendorRate?.vendorName || null,
      })).filter(p => p.region);
    } catch (error) {
      throw new BadRequestException('Failed to fetch regions by game: ' + error.message);
    }
  }
}