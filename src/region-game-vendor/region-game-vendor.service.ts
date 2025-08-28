import { PrismaClient, RegionGameVendor } from '@prisma/client';
import { CreateRegionGameVendorDto, UpdateRegionGameVendorDto, FilterRegionGameVendorDto } from './dto/create-region-game-vendor.dto';
import { SmileOneService } from '../smile-one/smile-one.service';
import { Injectable } from '@nestjs/common';

const prisma = new PrismaClient();

@Injectable()
export class RegionGameVendorService {
  constructor(private readonly smileOneService: SmileOneService) {}
  
  // Get all relationships with filtering and pagination
  async getAll(filters: FilterRegionGameVendorDto) {
    const {
      region,
      gameName,
      vendorName,
      isActive = true,
      page = 1,
      limit = 100
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (region && region !== 'all') {
      where.region = region;
    }
    
    if (gameName && gameName !== 'all') {
      where.gameName = gameName;
    }
    
    if (vendorName && vendorName !== 'all') {
      where.vendorName = vendorName;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      prisma.regionGameVendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.regionGameVendor.count({ where })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get unique regions with optional filtering
  async getUniqueRegions(filters: { gameName?: string; vendorName?: string; isActive?: boolean }) {
    const where: any = {
      isActive: filters.isActive !== false
    };

    if (filters.gameName && filters.gameName !== 'all') {
      where.gameName = filters.gameName;
    }

    if (filters.vendorName && filters.vendorName !== 'all') {
      where.vendorName = filters.vendorName;
    }

    const regions = await prisma.regionGameVendor.findMany({
      where,
      select: {
        region: true
      },
      distinct: ['region'],
      orderBy: {
        region: 'asc'
      }
    });

    return regions.map(r => r.region);
  }

  // Get unique games with optional filtering
  async getUniqueGames(filters: { region?: string; vendorName?: string; isActive?: boolean }) {
    const where: any = {
      isActive: filters.isActive !== false
    };

    if (filters.region && filters.region !== 'all') {
      where.region = filters.region;
    }

    if (filters.vendorName && filters.vendorName !== 'all') {
      where.vendorName = filters.vendorName;
    }

    const games = await prisma.regionGameVendor.findMany({
      where,
      select: {
        gameName: true
      },
      distinct: ['gameName'],
      orderBy: {
        gameName: 'asc'
      }
    });

    return games.map(g => g.gameName);
  }

  // Get unique vendor names with optional filtering
  async getUniqueVendorNames(filters: { region?: string; gameName?: string; isActive?: boolean }) {
    const where: any = {
      isActive: filters.isActive !== false
    };

    if (filters.region && filters.region !== 'all') {
      where.region = filters.region;
    }

    if (filters.gameName && filters.gameName !== 'all') {
      where.gameName = filters.gameName;
    }

    const vendors = await prisma.regionGameVendor.findMany({
      where,
      select: {
        vendorName: true
      },
      distinct: ['vendorName'],
      orderBy: {
        vendorName: 'asc'
      }
    });

    return vendors.map(v => v.vendorName);
  }

  /**
   * Check if SmileOne integration should be triggered and fetch products if needed
   * @param region The selected region
   * @param gameName The selected game name
   * @param vendorName The selected vendor name
   * @returns Object with smileOneProducts and integrationInfo if triggered, null otherwise
   */
  async checkSmileOneIntegration(region?: string, gameName?: string, vendorName?: string) {
    // Check if we have the specific combination that requires SmileOne integration
    // Currently: any region + Mobile Legends + Smile
    if (region &&
        gameName?.toLowerCase() === 'mobile legends' &&
        vendorName?.toLowerCase() === 'smile') {
      
      try {
        // Fetch SmileOne products
        const productResponse = await this.smileOneService.getProductList({
          product: gameName.toLowerCase().split(' ').join(''), // Mobile Legends
          // region: region
        });

// const testParams = {
//   uid: '557779',
//   email: 'skysmile2281@gmail.com',
//   product: 'mobilelegends',
//   region: 'PH',
//   time: '1755932954344'
// };

// this.smileOneService.testDifferentApproaches(testParams);
const result = await this.smileOneService.testWithPostmanParams();

        console.log(productResponse);
        
        return {
          smileOneProducts: productResponse?.data || [],
          integrationInfo: {
            triggered: true,
            reason: 'Mobile Legends + Smile combination detected',
            region,
            gameName,
            productCount: productResponse?.data?.length || 0,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error: any) {
        console.error('Error fetching SmileOne products:', error);
        return {
          smileOneProducts: [],
          integrationInfo: {
            triggered: true,
            reason: 'Mobile Legends + Smile combination detected',
            region,
            gameName,
            productCount: 0,
            timestamp: new Date().toISOString(),
            error: error.message || 'Failed to fetch SmileOne products'
          }
        };
      }
    }
    
    // No SmileOne integration needed
    return null;
  }

  // Get filtered data (all three arrays based on current selection)
  async getFilteredData(filters: { region?: string; gameName?: string; vendorName?: string; isActive?: boolean }) {
    const [regions, games, vendorNames] = await Promise.all([
      this.getUniqueRegions({ 
        gameName: filters.gameName, 
        vendorName: filters.vendorName, 
        isActive: filters.isActive 
      }),
      this.getUniqueGames({ 
        region: filters.region, 
        vendorName: filters.vendorName, 
        isActive: filters.isActive 
      }),
      this.getUniqueVendorNames({ 
        region: filters.region, 
        gameName: filters.gameName, 
        isActive: filters.isActive 
      })
    ]);

    return {
      regions,
      games,
      vendorNames
    };
  }

  // Get by ID
  async getById(id: string): Promise<RegionGameVendor | null> {
    return await prisma.regionGameVendor.findUnique({
      where: { id }
    });
  }

  // Create new relationship
  async create(data: CreateRegionGameVendorDto): Promise<RegionGameVendor> {
    return await prisma.regionGameVendor.create({
      data: {
        region: data.region,
        gameName: data.gameName,
        vendorName: data.vendorName,
        isActive: data.isActive ?? true
      }
    });
  }

  // Update relationship
  async update(id: string, data: UpdateRegionGameVendorDto): Promise<RegionGameVendor | null> {
    try {
      return await prisma.regionGameVendor.update({
        where: { id },
        data: {
          ...(data.region && { region: data.region }),
          ...(data.gameName && { gameName: data.gameName }),
          ...(data.vendorName && { vendorName: data.vendorName }),
          ...(data.isActive !== undefined && { isActive: data.isActive })
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  // Delete relationship
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.regionGameVendor.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false; // Record not found
      }
      throw error;
    }
  }

  // Bulk create relationships
  async bulkCreate(relationships: CreateRegionGameVendorDto[]) {
    let created = 0;
    let skipped = 0;

    for (const relationship of relationships) {
      try {
        await this.create(relationship);
        created++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Duplicate entry, skip
          skipped++;
        } else {
          throw error;
        }
      }
    }

    return { created, skipped };
  }

  // Toggle active status
  async toggleStatus(id: string): Promise<RegionGameVendor | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    return await prisma.regionGameVendor.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      }
    });
  }

  // Get statistics
  async getStats() {
    const [
      totalRelationships,
      activeRelationships,
      uniqueRegions,
      uniqueGames,
      uniqueVendors
    ] = await Promise.all([
      prisma.regionGameVendor.count(),
      prisma.regionGameVendor.count({ where: { isActive: true } }),
      prisma.regionGameVendor.groupBy({
        by: ['region'],
        where: { isActive: true }
      }),
      prisma.regionGameVendor.groupBy({
        by: ['gameName'],
        where: { isActive: true }
      }),
      prisma.regionGameVendor.groupBy({
        by: ['vendorName'],
        where: { isActive: true }
      })
    ]);

    return {
      totalRelationships,
      activeRelationships,
      inactiveRelationships: totalRelationships - activeRelationships,
      uniqueRegionsCount: uniqueRegions.length,
      uniqueGamesCount: uniqueGames.length,
      uniqueVendorsCount: uniqueVendors.length
    };
  }

  // Seed initial data
  async seedInitialData() {
    const initialData = [
      // Malaysia
      { region: 'Malaysia', gameName: 'Mobile Legends', vendorName: 'Razor Gold' },
      { region: 'Malaysia', gameName: 'Free Fire', vendorName: 'Razor Gold' },
      { region: 'Malaysia', gameName: 'PUBG Mobile', vendorName: 'Razor Gold' },
      { region: 'Malaysia', gameName: 'Genshin Impact', vendorName: 'Razor Gold' },
      
      // Myanmar
      { region: 'Myanmar', gameName: 'Mobile Legends', vendorName: 'Smile' },
      { region: 'Myanmar', gameName: 'Free Fire', vendorName: 'Smile' },
      { region: 'Myanmar', gameName: 'PUBG Mobile', vendorName: 'Smile' },
      { region: 'Myanmar', gameName: 'Genshin Impact', vendorName: 'Smile' },
      
      // Singapore
      { region: 'Singapore', gameName: 'Mobile Legends', vendorName: 'Garena' },
      { region: 'Singapore', gameName: 'Free Fire', vendorName: 'Garena' },
      { region: 'Singapore', gameName: 'PUBG Mobile', vendorName: 'Garena' },
      { region: 'Singapore', gameName: 'Genshin Impact', vendorName: 'Garena' },
      
      // Thailand
      { region: 'Thailand', gameName: 'Mobile Legends', vendorName: 'Tencent' },
      { region: 'Thailand', gameName: 'Free Fire', vendorName: 'Tencent' },
      { region: 'Thailand', gameName: 'PUBG Mobile', vendorName: 'Tencent' },
      { region: 'Thailand', gameName: 'Genshin Impact', vendorName: 'Tencent' },
      
      // Brazil
      { region: 'Brazil', gameName: 'Mobile Legends', vendorName: 'Razor Gold' },
      { region: 'Brazil', gameName: 'Free Fire', vendorName: 'Razor Gold' },
      { region: 'Brazil', gameName: 'PUBG Mobile', vendorName: 'Razor Gold' },
      { region: 'Brazil', gameName: 'Genshin Impact', vendorName: 'Razor Gold' }
    ];

    return await this.bulkCreate(initialData);
  }
}