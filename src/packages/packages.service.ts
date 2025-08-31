import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageStatus } from '@prisma/client';

@Injectable()
export class PackagesService {
  // Toggle packageStatus between active (1) and inactive (2)
  async togglePackageStatus(id: string) {
    try {
      const packages = await this.findById(id);
      if (!packages || packages.length === 0) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      const pkg = packages[0];
      const newStatus = pkg.packageStatus === 1 ? 2 : 1;
      const updatedPackage = await this.prisma.package.update({
        where: { id },
        data: { packageStatus: newStatus },
      });
      return {
        success: true,
        package: this.transformPackageForResponse(updatedPackage),
        message: `Package status updated to ${newStatus === 1 ? 'ACTIVE' : 'INACTIVE'}`
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to toggle package status: ' + error.message);
    }
  }
  constructor(private prisma: PrismaService) { }

  // Helper method to get correct price for user based on role and vendor
  getPackagePrice(packageData: any, userRole: string): number {
    if (userRole === 'RESELLER' && packageData.vendor === 'Smile') {
      return Number(packageData.baseVendorCost) || 0;
    }
    return Number(packageData.price) || 0;
  }

  // Helper method to check if special pricing applies
  isSpecialPricing(packageData: any, userRole: string): boolean {
    return userRole === 'RESELLER' && packageData.vendor === 'Smile';
  }

  // Helper method to calculate costs for mixed vendor packages
  calculateMixedVendorCosts(packages: any[], userRole: string): {
    xCoinCost: number;
    smileCoinCost: number;
    hasSmilePackages: boolean;
  } {
    let xCoinCost = 0;
    let smileCoinCost = 0;
    let hasSmilePackages = false;

    packages.forEach(pkg => {
      if (this.isSpecialPricing(pkg, userRole)) {
        smileCoinCost += this.getPackagePrice(pkg, userRole);
        hasSmilePackages = true;
      } else {
        xCoinCost += this.getPackagePrice(pkg, userRole);
      }
    });

    return { xCoinCost, smileCoinCost, hasSmilePackages };
  }

  // Helper method to transform package data for frontend response
  private transformPackageForResponse(packageData: any) {
    return {
      ...packageData,
      // Convert vendorPackageCode string back to array for frontend
      vendorPackageCodes: packageData.vendorPackageCode ? packageData.vendorPackageCode.split(',') : [],
  // Ensure packageStatus is lowercase for frontend
  packageStatus: typeof packageData.packageStatus === 'string' ? packageData.packageStatus.toLowerCase() : packageData.packageStatus,
      // Ensure type is lowercase for frontend
      type: packageData.type?.toLowerCase() || 'diamond',
      // Ensure numeric fields are properly typed
      price: Number(packageData.price) || 0,
      vendorPrice: Number(packageData.vendorPrice) || 0,
      stock: Number(packageData.stock) || 0,
      discount: Number(packageData.discount) || 0,
      amount: Number(packageData.amount) || 0,
      duration: Number(packageData.duration) || 0,
    };
  }

  async create(createPackageDto: CreatePackageDto) {
    try {
      // Validate required fields
      if (!createPackageDto.name || !createPackageDto.region || !createPackageDto.gameName || !createPackageDto.vendor) {
        throw new BadRequestException('Missing required fields: name, region, gameName, or vendor');
      }

      // Validate vendorPackageCodes
      if (!createPackageDto.vendorPackageCodes || !Array.isArray(createPackageDto.vendorPackageCodes) || createPackageDto.vendorPackageCodes.length === 0) {
        throw new BadRequestException('vendorPackageCodes must be a non-empty array');
      }

      const vendorExchangeRate = await this.prisma.vendorExchangeRate.findFirst({
        where: {
          vendorName: createPackageDto.vendor
        }
      });

      const packageData = await this.prisma.package.create({
        data: {
          name: createPackageDto.name,
          description: createPackageDto.description || '',
          price: Number(createPackageDto.price) || 0,
          imageUrl: createPackageDto.imageUrl || '',
          type: createPackageDto.type || 'DIAMOND',
          gameId: createPackageDto.gameId || '',
          featured: createPackageDto.featured || false,
          discount: Number(createPackageDto.discount) || 0,
          amount: Number(createPackageDto.amount) || 0,
          duration: Number(createPackageDto.duration) || 0,
          region: createPackageDto.region,
          gameName: createPackageDto.gameName,
          vendor: createPackageDto.vendor,
          vendorPackageCode: createPackageDto.vendorPackageCodes.join(','), // Store as comma-separated
          vendorPrice: Number(createPackageDto.vendorPrice) || 0,
          vendorCurrency: vendorExchangeRate?.vendorCurrency || '',
          currency: createPackageDto.currency || 'USD',
          // packageStatus: createPackageDto.packageStatus || 1,
          packageStatus: 1,
          resellKeyword: createPackageDto.resellKeyword || '',
          stock: Number(createPackageDto.stock) || 0,
          isPriceLocked: createPackageDto.isPriceLocked || false,
          baseVendorCost: Number(createPackageDto.baseVendorCost) || 0,
          // NEW: Markup fields
          markupId: createPackageDto.markupId || null,
          basePrice: createPackageDto.basePrice ? Number(createPackageDto.basePrice) : null,
          markupPercent: Number(createPackageDto.markupPercent) || 15,
          roundToNearest: Number(createPackageDto.roundToNearest) || 1,
          markupAppliedAt: createPackageDto.markupId ? new Date() : null,
        },
        // NEW: Include markup relation
        include: {
          appliedMarkup: true,
        }
      });

      // Transform the response to match frontend expectations
      const transformedPackage = this.transformPackageForResponse(packageData);

      // Return in the required format
      return {
        success: true,
        package: transformedPackage,
        message: 'Package created successfully'
      };
    } catch (error) {
      console.error('Error creating package:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create package: ' + error.message);
    }
  }

  async findAll(filters: {
    region?: string;
    gameName?: string;
    vendor?: string;
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        region,
        gameName,
        vendor,
        status,
        search,
        skip = 0,
        take = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where clause
      const where: any = {

      };

      where.OR = [
        {
          packageStatus: 1
        },
        {
          packageStatus: 2
        }
      ];

      if (region && region !== 'all') {
        where.region = {
          contains: region,
          // mode: 'insensitive',
        };
      }

      if (gameName && gameName !== 'all') {
        where.gameName = {
          contains: gameName,
          // mode: 'insensitive',
        };
      }

      if (vendor && vendor !== 'all') {
        where.vendor = {
          contains: vendor,
          // mode: 'insensitive',
        };
      }

      if (status && status !== 'all') {
        where.packageStatus = status.toUpperCase();
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              // mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              // mode: 'insensitive',
            },
          },
          {
            vendorPackageCode: {
              contains: search,
              // mode: 'insensitive',
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'price') {
        orderBy.price = sortOrder;
      } else if (sortBy === 'stock') {
        orderBy.stock = sortOrder;
      } else if (sortBy === 'updatedAt') {
        orderBy.updatedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [packages, total] = await Promise.all([
        this.prisma.package.findMany({
          where,
          orderBy,
          skip,
          take,
          // NEW: Include markup relation
          include: {
            appliedMarkup: {
              select: {
                id: true,
                name: true,
                description: true,
                percentageAdd: true,
                flatAmountAdd: true,
                isActive: true,
              }
            }
          }
        }),
        this.prisma.package.count({ where }),
      ]);

      // Transform packages for response
      const transformedPackages = packages.map(pkg => this.transformPackageForResponse(pkg));

      // Calculate pagination info for admin side
      const totalPages = Math.ceil(total / take);
      const currentPage = Math.floor(skip / take) + 1;
      const hasMore = skip + take < total;

      // Return BOTH formats - clients can pick what they need
      return {
        // Original format for reseller side (keep existing)
        packages: transformedPackages,
        total,
        hasMore,

        // NEW: Admin format
        pagination: {
          page: currentPage,
          limit: take,
          total,
          totalPages,
          hasMore,
        }
      };
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw new BadRequestException('Failed to fetch packages: ' + error.message);
    }
  }

  async findById(ids: string) {
    const idArr = ids.split(',');
    console.log(ids);
    console.log(idArr);
    try {
      const packageData = await this.prisma.package.findMany({
        where: {
          id: {
            in: idArr,
          }
        }
      });

      if (!packageData || packageData.length === 0) {
        throw new NotFoundException(`Package with ID ${ids} not found`);
      }

      return packageData.map(pkg => this.transformPackageForResponse(pkg));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching package:', error);
      throw new BadRequestException('Failed to fetch package: ' + error.message);
    }
  }
  async update(id: string, updatePackageDto: UpdatePackageDto) {
    try {
      // Check if package exists
      const existingPackage = await this.findById(id);
      if (!existingPackage || existingPackage.length === 0) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      // Prepare update data
      const updateData: any = {};

      // Only update fields that are provided
      if (updatePackageDto.name !== undefined) updateData.name = updatePackageDto.name;
      if (updatePackageDto.description !== undefined) updateData.description = updatePackageDto.description;
      if (updatePackageDto.price !== undefined) updateData.price = Number(updatePackageDto.price);
      if (updatePackageDto.imageUrl !== undefined) updateData.imageUrl = updatePackageDto.imageUrl;
      if (updatePackageDto.type !== undefined) updateData.type = updatePackageDto.type;
      if (updatePackageDto.gameId !== undefined) updateData.gameId = updatePackageDto.gameId;
      if (updatePackageDto.featured !== undefined) updateData.featured = updatePackageDto.featured;
      if (updatePackageDto.discount !== undefined) updateData.discount = Number(updatePackageDto.discount);
      if (updatePackageDto.amount !== undefined) updateData.amount = Number(updatePackageDto.amount);
      if (updatePackageDto.duration !== undefined) updateData.duration = Number(updatePackageDto.duration);
      if (updatePackageDto.region !== undefined) updateData.region = updatePackageDto.region;
      if (updatePackageDto.gameName !== undefined) updateData.gameName = updatePackageDto.gameName;
      if (updatePackageDto.vendor !== undefined) updateData.vendor = updatePackageDto.vendor;
      if (updatePackageDto.vendorPrice !== undefined) updateData.vendorPrice = Number(updatePackageDto.vendorPrice);
      if (updatePackageDto.currency !== undefined) updateData.currency = updatePackageDto.currency;
  if (updatePackageDto.status !== undefined) updateData.packageStatus = updatePackageDto.status;
      if (updatePackageDto.stock !== undefined) updateData.stock = Number(updatePackageDto.stock);
      if (updatePackageDto.baseVendorCost !== undefined) updateData.baseVendorCost = Number(updatePackageDto.baseVendorCost);
      if (updatePackageDto.isPriceLocked !== undefined) updateData.isPriceLocked = updatePackageDto.isPriceLocked; // Add this line
      if (updatePackageDto.resellKeyword !== undefined) updateData.resellKeyword = updatePackageDto.resellKeyword; // Add this line

      // Handle vendorPackageCodes array
      if (updatePackageDto.vendorPackageCodes && Array.isArray(updatePackageDto.vendorPackageCodes)) {
        updateData.vendorPackageCode = updatePackageDto.vendorPackageCodes.join(',');
      }

      // NEW: Handle markup fields
      if (updatePackageDto.markupId !== undefined) {
        updateData.markupId = updatePackageDto.markupId || null;
        updateData.markupAppliedAt = updatePackageDto.markupId ? new Date() : null;
      }
      if (updatePackageDto.basePrice !== undefined) updateData.basePrice = updatePackageDto.basePrice ? Number(updatePackageDto.basePrice) : null;
      if (updatePackageDto.markupPercent !== undefined) updateData.markupPercent = Number(updatePackageDto.markupPercent);
      if (updatePackageDto.vendorCurrency !== undefined) updateData.vendorCurrency = updatePackageDto.vendorCurrency;
      if (updatePackageDto.roundToNearest !== undefined) updateData.roundToNearest = Number(updatePackageDto.roundToNearest);

      const updatedPackage = await this.prisma.package.update({
        where: { id },
        data: updateData,
        // NEW: Include markup relation
        include: {
          appliedMarkup: true,
        }
      });

      const transformedPackage = this.transformPackageForResponse(updatedPackage);

      // Return in the required format
      return {
        success: true,
        package: transformedPackage,
        message: 'Package updated successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating package:', error);
      throw new BadRequestException('Failed to update package: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      // Check if package exists
      await this.findById(id);

      await this.prisma.package.update({
        where: { id },
        data: { packageStatus: 3 },
      });

      return { message: 'Package deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting package:', error);
      throw new BadRequestException('Failed to delete package: ' + error.message);
    }
  }

  async getPackageStats() {
    try {
      const [
        totalPackages,
        activePackages,
        inactivePackages,
        outOfStockPackages,
        totalStock,
        averagePrice,
        regionStats,
        gameStats,
        vendorStats,
      ] = await Promise.all([
        this.prisma.package.count(),
        this.prisma.package.count({ where: { packageStatus: 1 } }),
        this.prisma.package.count({ where: { packageStatus: 2 } }),
        this.prisma.package.count({ where: { packageStatus: 4 } }),
        this.prisma.package.aggregate({
          _sum: { stock: true },
        }),
        this.prisma.package.aggregate({
          _avg: { price: true },
        }),
        this.prisma.package.groupBy({
          by: ['region'],
          _count: { region: true },
          orderBy: { _count: { region: 'desc' } },
          take: 5,
        }),
        this.prisma.package.groupBy({
          by: ['gameName'],
          _count: { gameName: true },
          orderBy: { _count: { gameName: 'desc' } },
          take: 5,
        }),
        this.prisma.package.groupBy({
          by: ['vendor'],
          _count: { vendor: true },
          orderBy: { _count: { vendor: 'desc' } },
          take: 5,
        }),
      ]);

      return {
        totalPackages,
        activePackages,
        inactivePackages,
        outOfStockPackages,
        totalStock: totalStock._sum.stock || 0,
        averagePrice: averagePrice._avg.price || 0,
        topRegions: regionStats.map(stat => ({
          region: stat.region,
          count: stat._count.region,
        })),
        topGames: gameStats.map(stat => ({
          game: stat.gameName,
          count: stat._count.gameName,
        })),
        topVendors: vendorStats.map(stat => ({
          vendor: stat.vendor,
          count: stat._count.vendor,
        })),
      };
    } catch (error) {
      console.error('Error fetching package stats:', error);
      throw new BadRequestException('Failed to fetch package statistics: ' + error.message);
    }
  }

  async getVendors() {
    try {
      // Get unique vendors with their packages
      const vendors = await this.prisma.package.groupBy({
        by: ['vendor', 'region', 'gameName'],
        _count: { vendor: true },
        orderBy: [
          { vendor: 'asc' },
          { region: 'asc' },
          { gameName: 'asc' },
        ],
      });

      // Group by vendor
      const vendorMap = new Map();

      vendors.forEach(vendor => {
        if (!vendorMap.has(vendor.vendor)) {
          vendorMap.set(vendor.vendor, {
            id: vendor.vendor.toLowerCase().replace(/\s+/g, '-'),
            name: vendor.vendor,
            regions: new Set(),
            games: new Set(),
            totalPackages: 0,
          });
        }

        const vendorData = vendorMap.get(vendor.vendor);
        vendorData.regions.add(vendor.region);
        vendorData.games.add(vendor.gameName);
        vendorData.totalPackages += vendor._count.vendor;
      });

      // Convert to array and format
      const formattedVendors = Array.from(vendorMap.values()).map(vendor => ({
        ...vendor,
        regions: Array.from(vendor.regions),
        games: Array.from(vendor.games),
      }));

      return formattedVendors;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new BadRequestException('Failed to fetch vendors: ' + error.message);
    }
  }

  async logStockUpdate(
    packageId: string,
    previousStock: number,
    newStock: number,
    adminId: string,
    notes?: string
  ) {
    try {
      console.log('Stock Update Log:', {
        packageId,
        previousStock,
        newStock,
        adminId,
        notes,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log stock update:', error);
    }
  }

  // Helper method to get unique regions
  async getRegions() {
    try {
      const regions = await this.prisma.package.findMany({
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' },
      });

      return regions.map(r => r.region);
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  }

  // Helper method to get unique games
  async getGames() {
    try {
      const games = await this.prisma.package.findMany({
        select: { gameName: true },
        distinct: ['gameName'],
        orderBy: { gameName: 'asc' },
      });

      return games.map(g => g.gameName);
    } catch (error) {
      console.error('Error fetching vendor names:', error);
      return [];
    }
  }

  async findByCode(code: string, gameName?: string) {
    try {
      const where: any = {
        resellKeyword: {
          contains: code,
          // mode: 'insensitive'
        },
        packageStatus: 1,
      };

      if (gameName) {
        where.gameName = {
          contains: gameName,
          packageStatus: 1,
          // mode: 'insensitive'
        };
      }

      const packageData = await this.prisma.package.findFirst({
        where
      });

      return packageData;
    } catch (error) {
      console.error('Error finding package by code:', error);
      throw new BadRequestException('Failed to find package');
    }
  }

  // NEW: Search multiple packages by codes for bulk orders
  async searchMultiplePackagesByCodes(codes: string[], gameName: string) {
    try {
      const packages = await this.prisma.package.findMany({
        where: {
          vendorPackageCode: {
            in: codes,
          },
          gameName: {
            contains: gameName,
          },
          packageStatus: 1,
        },
      });

      const found = packages;
      const foundCodes = packages.map(pkg => pkg.vendorPackageCode.toLowerCase());
      const notFound = codes.filter(code => !foundCodes.includes(code.toLowerCase()));

      return {
        found,
        notFound,
        foundCount: found.length,
        notFoundCount: notFound.length,
      };
    } catch (error) {
      console.error('Error searching multiple packages:', error);
      throw new BadRequestException('Failed to search packages');
    }
  }

  // NEW: Search single package by code
  async searchPackageByCode(code: string, gameName: string) {
    try {
      const package_ = await this.prisma.package.findFirst({
        where: {
          vendorPackageCode: {
            equals: code,
          },
          gameName: {
            contains: gameName,
          },
          packageStatus: 1,
        },
      });

      return package_;
    } catch (error) {
      console.error('Error searching package by code:', error);
      throw new BadRequestException('Failed to search package');
    }
  }

  // NEW: Calculate total price for multiple packages
  calculateTotalPrice(packages: any[]): number {
    return packages.reduce((total, pkg) => total + pkg.price, 0);
  }

  // NEW: Validate bulk order packages
  async validateBulkOrderPackages(orders: Array<{
    playerId: string;
    identifier: string;
    packageCodes: string[];
    gameName: string;
  }>) {
    const results: Array<{
      playerId: string;
      identifier: string;
      gameName: string;
      foundPackages: any[];
      notFoundCodes: string[];
      isValid: boolean;
      totalCost: number;
    }> = [];

    for (const order of orders) {
      const { found, notFound } = await this.searchMultiplePackagesByCodes(
        order.packageCodes,
        order.gameName
      );

      results.push({
        playerId: order.playerId,
        identifier: order.identifier,
        gameName: order.gameName,
        foundPackages: found,
        notFoundCodes: notFound,
        isValid: notFound.length === 0,
        totalCost: this.calculateTotalPrice(found),
      });
    }

    
        return results;
      }
    
      // NEW: Get regions by game name
      async getRegionsByGame(gameName: string) {
        try {
          const regions = await this.prisma.package.findMany({
            where: {
              gameName: {
                contains: gameName,
              },
            },
            select: {
              region: true,
            },
            distinct: ['region'],
            orderBy: {
              region: 'asc',
            },
          });
    
          return regions.map(r => r.region).filter(region => region);
        } catch (error) {
          console.error('Error fetching regions by game:', error);
          throw new BadRequestException('Failed to fetch regions by game: ' + error.message);
        }
      }
    }