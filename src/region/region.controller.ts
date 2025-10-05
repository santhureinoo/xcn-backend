import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  async create(@Body() createRegionDto: CreateRegionDto) {
    try {
      return await this.regionService.create(createRegionDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create region: ' + error.message);
    }
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const filters = {
        status: status || 'all',
        search: search || undefined,
        skip: page ? (parseInt(page) - 1) * parseInt(limit || '50') : 0,
        take: limit ? parseInt(limit) : 50,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      };

      return await this.regionService.findAll(filters);
    } catch (error) {
      throw new BadRequestException('Failed to fetch regions: ' + error.message);
    }
  }

  @Get('stats')
  async getRegionStats() {
    try {
      return await this.regionService.getRegionStats();
    } catch (error) {
      throw new BadRequestException('Failed to fetch region statistics: ' + error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.regionService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch region: ' + error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    try {
      return await this.regionService.update(id, updateRegionDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update region: ' + error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.regionService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete region: ' + error.message);
    }
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    try {
      return await this.regionService.toggleStatus(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle region status: ' + error.message);
    }
  }

  // NEW: Get regions by game name
  @Get('by-game/:gameName')
  async getRegionsByGame(@Param('gameName') gameName: string) {
    try {
      const regions = await this.regionService.getRegionsByGame(gameName);
      return {
        success: true,
        regions,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch regions by game: ' + error.message);
    }
  }
}