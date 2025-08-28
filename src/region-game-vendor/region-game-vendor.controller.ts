import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegionGameVendorService } from './region-game-vendor.service';
import { CreateRegionGameVendorDto, UpdateRegionGameVendorDto, FilterRegionGameVendorDto } from './dto/create-region-game-vendor.dto';
import { validateDto } from '../utils/validation';

@Controller('region-game-vendor')
export class RegionGameVendorController {
  constructor(private readonly regionGameVendorService: RegionGameVendorService) {}

  // Get all region-game-vendor relationships with optional filtering
  @Get()
  async getAll(@Query() query: any, @Res() res: Response) {
    try {
      const filters: FilterRegionGameVendorDto = {
        region: query.region as string,
        gameName: query.gameName as string,
        vendorName: query.vendorName as string,
        isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
        page: parseInt(query.page as string) || 1,
        limit: parseInt(query.limit as string) || 100
      };

      const result = await this.regionGameVendorService.getAll(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Region-game-vendor relationships retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error getting region-game-vendor relationships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get region-game-vendor relationships'
      });
    }
  }

  // Get all unique regions (first level - no dependencies)
  @Get('regions')
  async getRegions(@Query() query: any, @Res() res: Response) {
    try {
      const filters = {
        isActive: query.isActive !== 'false'
      };

      const regions = await this.regionGameVendorService.getUniqueRegions(filters);

      res.status(200).json({
        success: true,
        data: regions,
        message: 'Regions retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error getting regions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get regions'
      });
    }
  }

  // Get games for a specific region (second level - depends on region)
  @Get('games')
  async getGames(@Query() query: any, @Res() res: Response) {
    try {
      const region = query.region as string;
      
      // Region is required for cascading logic
      if (!region || region === 'all') {
        return res.status(400).json({
          success: false,
          message: 'Region parameter is required to get games'
        });
      }

      const filters = {
        region: region,
        isActive: query.isActive !== 'false'
      };

      const games = await this.regionGameVendorService.getUniqueGames(filters);

      res.status(200).json({
        success: true,
        data: games,
        message: `Games for region '${region}' retrieved successfully`
      });
    } catch (error: any) {
      console.error('Error getting games:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get games'
      });
    }
  }

  // Get vendors for a specific region-game combination (third level - depends on region + game)
  @Get('vendors')
  async getVendors(@Query() query: any, @Res() res: Response) {
    try {
      const region = query.region as string;
      const gameName = query.gameName as string;
      
      // Both region and game are required for cascading logic
      if (!region || region === 'all') {
        return res.status(400).json({
          success: false,
          message: 'Region parameter is required to get vendors'
        });
      }

      if (!gameName || gameName === 'all') {
        return res.status(400).json({
          success: false,
          message: 'Game name parameter is required to get vendors'
        });
      }

      const filters = {
        region: region,
        gameName: gameName,
        isActive: query.isActive !== 'false'
      };

      const vendors = await this.regionGameVendorService.getUniqueVendorNames(filters);

      res.status(200).json({
        success: true,
        data: vendors,
        message: `Vendors for region '${region}' and game '${gameName}' retrieved successfully`
      });
    } catch (error: any) {
      console.error('Error getting vendors:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get vendors'
      });
    }
  }

  // Get cascading filter data based on current selection
  @Get('cascade-data')
  async getCascadeData(@Query() query: any, @Res() res: Response) {
    try {
      const region = query.region as string;
      const gameName = query.gameName as string;
      const vendorName = query.vendorName as string;
      const isActive = query.isActive !== 'false';

      const result: any = {
        regions: [],
        games: [],
        vendors: []
      };

      // Always get regions (first level)
      result.regions = await this.regionGameVendorService.getUniqueRegions({ isActive });

      // Get games only if region is selected
      if (region && region !== 'all') {
        result.games = await this.regionGameVendorService.getUniqueGames({
          region,
          isActive
        });

        // Get vendors only if both region and game are selected
        if (gameName && gameName !== 'all') {
          result.vendors = await this.regionGameVendorService.getUniqueVendorNames({
            region,
            gameName,
            isActive
          });
          
          // Check for SmileOne integration
          const smileOneData = await this.regionGameVendorService.checkSmileOneIntegration(
            region,
            gameName,
            vendorName
          );
          
          if (smileOneData) {
            result.smileOneProducts = smileOneData.smileOneProducts;
            result.integrationInfo = smileOneData.integrationInfo;
          }
        }
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Cascade filter data retrieved successfully',
        meta: {
          hasRegion: !!(region && region !== 'all'),
          hasGame: !!(gameName && gameName !== 'all'),
          canSelectGame: !!(region && region !== 'all'),
          canSelectVendor: !!(region && region !== 'all' && gameName && gameName !== 'all'),
          hasSmileOneIntegration: !!(result.smileOneProducts && result.smileOneProducts.length > 0)
        }
      });
    } catch (error: any) {
      console.error('Error getting cascade data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get cascade data'
      });
    }
  }

  // Legacy endpoint - kept for backward compatibility but now follows cascade logic
  @Get('filtered-data')
  async getFilteredData(@Query() query: any, @Res() res: Response) {
    try {
      // Redirect to cascade-data endpoint with same parameters
      return this.getCascadeData(query, res);
    } catch (error: any) {
      console.error('Error getting filtered data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get filtered data'
      });
    }
  }

  // Get statistics
  @Get('stats')
  async getStats(@Res() res: Response) {
    try {
      const stats = await this.regionGameVendorService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get statistics'
      });
    }
  }

  // Get by ID
  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const regionGameVendor = await this.regionGameVendorService.getById(id);

      if (!regionGameVendor) {
        return res.status(404).json({
          success: false,
          message: 'Region-game-vendor relationship not found'
        });
      }

      res.status(200).json({
        success: true,
        data: regionGameVendor,
        message: 'Region-game-vendor relationship retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error getting region-game-vendor relationship:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get region-game-vendor relationship'
      });
    }
  }

  // Create new relationship
  @Post()
  async create(@Body() body: CreateRegionGameVendorDto, @Res() res: Response) {
    try {
      const validationResult = validateDto(CreateRegionGameVendorDto, body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }

      const regionGameVendor = await this.regionGameVendorService.create(body);

      res.status(201).json({
        success: true,
        data: regionGameVendor,
        message: 'Region-game-vendor relationship created successfully'
      });
    } catch (error: any) {
      console.error('Error creating region-game-vendor relationship:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'This region-game-vendor combination already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create region-game-vendor relationship'
      });
    }
  }

  // Bulk create relationships
  @Post('bulk')
  async bulkCreate(@Body() body: { relationships: CreateRegionGameVendorDto[] }, @Res() res: Response) {
    try {
      const { relationships } = body;

      if (!Array.isArray(relationships) || relationships.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Relationships array is required and cannot be empty'
        });
      }

      // Validate each relationship in the array
      for (let i = 0; i < relationships.length; i++) {
        const validationResult = validateDto(CreateRegionGameVendorDto, relationships[i]);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            message: `Validation failed for relationship at index ${i}`,
            errors: validationResult.errors
          });
        }
      }

      const result = await this.regionGameVendorService.bulkCreate(relationships);

      res.status(201).json({
        success: true,
        data: result,
        message: `Successfully created ${result.created} relationships, skipped ${result.skipped} duplicates`
      });
    } catch (error: any) {
      console.error('Error bulk creating region-game-vendor relationships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to bulk create region-game-vendor relationships'
      });
    }
  }

  // Seed initial data
  @Post('seed')
  async seedData(@Res() res: Response) {
    try {
      const result = await this.regionGameVendorService.seedInitialData();

      res.status(201).json({
        success: true,
        data: result,
        message: `Seeded ${result.created} relationships, skipped ${result.skipped} existing ones`
      });
    } catch (error: any) {
      console.error('Error seeding data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to seed data'
      });
    }
  }

  // Update relationship
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRegionGameVendorDto, @Res() res: Response) {
    try {
      const validationResult = validateDto(UpdateRegionGameVendorDto, body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }

      const regionGameVendor = await this.regionGameVendorService.update(id, body);

      if (!regionGameVendor) {
        return res.status(404).json({
          success: false,
          message: 'Region-game-vendor relationship not found'
        });
      }

      res.status(200).json({
        success: true,
        data: regionGameVendor,
        message: 'Region-game-vendor relationship updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating region-game-vendor relationship:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'This region-game-vendor combination already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update region-game-vendor relationship'
      });
    }
  }

  // Toggle active status
  @Put(':id/toggle-status')
  async toggleStatus(@Param('id') id: string, @Res() res: Response) {
    try {
      const regionGameVendor = await this.regionGameVendorService.toggleStatus(id);

      if (!regionGameVendor) {
        return res.status(404).json({
          success: false,
          message: 'Region-game-vendor relationship not found'
        });
      }

      res.status(200).json({
        success: true,
        data: regionGameVendor,
        message: `Region-game-vendor relationship ${regionGameVendor.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error: any) {
      console.error('Error toggling region-game-vendor relationship status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle region-game-vendor relationship status'
      });
    }
  }

  // Delete relationship
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await this.regionGameVendorService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Region-game-vendor relationship not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Region-game-vendor relationship deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting region-game-vendor relationship:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete region-game-vendor relationship'
      });
    }
  }
}