import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { PackageStatus } from './dto/create-package.dto';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // NEW: Search package by code
  @Get('search')
  async searchPackageByCode(
    @Query('code') code: string,
    @Query('game') gameName: string,
  ) {
    try {
      if (!code || !gameName) {
        throw new BadRequestException('Code and game parameters are required');
      }

      const package_ = await this.packagesService.searchPackageByCode(code, gameName);
      
      return {
        success: true,
        package: package_,
        found: !!package_,
      };
    } catch (error) {
      console.error('Error searching package:', error);
      return {
        success: false,
        error: error.message,
        package: null,
        found: false,
      };
    }
  }

  // NEW: Search multiple packages by codes
  @Post('search/bulk')
  async searchMultiplePackages(@Body() body: {
    codes: string[];
    gameName: string;
  }) {
    try {
      if (!body.codes || !Array.isArray(body.codes) || !body.gameName) {
        throw new BadRequestException('Codes array and gameName are required');
      }

      const result = await this.packagesService.searchMultiplePackagesByCodes(
        body.codes,
        body.gameName
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error searching multiple packages:', error);
      return {
        success: false,
        error: error.message,
        found: [],
        notFound: body.codes || [],
      };
    }
  }

  // NEW: Validate bulk order packages
  @Post('validate-bulk')
  async validateBulkOrderPackages(@Body() body: {
    orders: Array<{
      playerId: string;
      identifier: string;
      packageCodes: string[];
      gameName: string;
    }>;
  }) {
    try {
      if (!body.orders || !Array.isArray(body.orders)) {
        throw new BadRequestException('Orders array is required');
      }

      const results = await this.packagesService.validateBulkOrderPackages(body.orders);

      const totalCost = results.reduce((sum, result) => sum + result.totalCost, 0);
      const validOrders = results.filter(result => result.isValid);
      const invalidOrders = results.filter(result => !result.isValid);

      return {
        success: true,
        results,
        summary: {
          totalOrders: results.length,
          validOrders: validOrders.length,
          invalidOrders: invalidOrders.length,
          totalCost,
        },
      };
    } catch (error) {
      console.error('Error validating bulk order:', error);
      return {
        success: false,
        error: error.message,
        results: [],
      };
    }
  }

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('gameName') gameName?: string,
    @Query('vendor') vendor?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters = {
      region,
      gameName,
      vendor,
      status,
      search,
      skip: page ? (parseInt(page) - 1) * parseInt(limit || '50') : 0,
      take: limit ? parseInt(limit) : 50,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    return this.packagesService.findAll(filters);
  }

  @Get('stats')
  getPackageStats() {
    return this.packagesService.getPackageStats();
  }

  @Get('vendors')
  getVendors() {
    return this.packagesService.getVendors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }

  // NEW: Calculate price with markup
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.packagesService.togglePackageStatus(id);
  }

  // NEW: Get regions by game name
  @Get('regions/:gameName')
  async getRegionsByGame(@Param('gameName') gameName: string) {
    try {
      const regions = await this.packagesService.getRegionsByGame(gameName);
      return {
        success: true,
        regions,
      };
    } catch (error) {
      console.error('Error fetching regions by game:', error);
      return {
        success: false,
        error: error.message,
        regions: [],
      };
    }
  }
}