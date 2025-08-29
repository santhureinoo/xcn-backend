"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionGameVendorController = void 0;
const common_1 = require("@nestjs/common");
const region_game_vendor_service_1 = require("./region-game-vendor.service");
const create_region_game_vendor_dto_1 = require("./dto/create-region-game-vendor.dto");
const validation_1 = require("../utils/validation");
let RegionGameVendorController = class RegionGameVendorController {
    regionGameVendorService;
    constructor(regionGameVendorService) {
        this.regionGameVendorService = regionGameVendorService;
    }
    async getAll(query, res) {
        try {
            const filters = {
                region: query.region,
                gameName: query.gameName,
                vendorName: query.vendorName,
                isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
                page: parseInt(query.page) || 1,
                limit: parseInt(query.limit) || 100
            };
            const result = await this.regionGameVendorService.getAll(filters);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Region-game-vendor relationships retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error getting region-game-vendor relationships:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get region-game-vendor relationships'
            });
        }
    }
    async getRegions(query, res) {
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
        }
        catch (error) {
            console.error('Error getting regions:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get regions'
            });
        }
    }
    async getGames(query, res) {
        try {
            const region = query.region;
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
        }
        catch (error) {
            console.error('Error getting games:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get games'
            });
        }
    }
    async getVendors(query, res) {
        try {
            const region = query.region;
            const gameName = query.gameName;
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
        }
        catch (error) {
            console.error('Error getting vendors:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get vendors'
            });
        }
    }
    async getCascadeData(query, res) {
        try {
            const region = query.region;
            const gameName = query.gameName;
            const vendorName = query.vendorName;
            const isActive = query.isActive !== 'false';
            const result = {
                regions: [],
                games: [],
                vendors: []
            };
            result.regions = await this.regionGameVendorService.getUniqueRegions({ isActive });
            if (region && region !== 'all') {
                result.games = await this.regionGameVendorService.getUniqueGames({
                    region,
                    isActive
                });
                if (gameName && gameName !== 'all') {
                    result.vendors = await this.regionGameVendorService.getUniqueVendorNames({
                        region,
                        gameName,
                        isActive
                    });
                    const smileOneData = await this.regionGameVendorService.checkSmileOneIntegration(region, gameName, vendorName);
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
        }
        catch (error) {
            console.error('Error getting cascade data:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get cascade data'
            });
        }
    }
    async getFilteredData(query, res) {
        try {
            return this.getCascadeData(query, res);
        }
        catch (error) {
            console.error('Error getting filtered data:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get filtered data'
            });
        }
    }
    async getStats(res) {
        try {
            const stats = await this.regionGameVendorService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error getting statistics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get statistics'
            });
        }
    }
    async getById(id, res) {
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
        }
        catch (error) {
            console.error('Error getting region-game-vendor relationship:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get region-game-vendor relationship'
            });
        }
    }
    async create(body, res) {
        try {
            const validationResult = (0, validation_1.validateDto)(create_region_game_vendor_dto_1.CreateRegionGameVendorDto, body);
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
        }
        catch (error) {
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
    async bulkCreate(body, res) {
        try {
            const { relationships } = body;
            if (!Array.isArray(relationships) || relationships.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Relationships array is required and cannot be empty'
                });
            }
            for (let i = 0; i < relationships.length; i++) {
                const validationResult = (0, validation_1.validateDto)(create_region_game_vendor_dto_1.CreateRegionGameVendorDto, relationships[i]);
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
        }
        catch (error) {
            console.error('Error bulk creating region-game-vendor relationships:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to bulk create region-game-vendor relationships'
            });
        }
    }
    async seedData(res) {
        try {
            const result = await this.regionGameVendorService.seedInitialData();
            res.status(201).json({
                success: true,
                data: result,
                message: `Seeded ${result.created} relationships, skipped ${result.skipped} existing ones`
            });
        }
        catch (error) {
            console.error('Error seeding data:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to seed data'
            });
        }
    }
    async update(id, body, res) {
        try {
            const validationResult = (0, validation_1.validateDto)(create_region_game_vendor_dto_1.UpdateRegionGameVendorDto, body);
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
        }
        catch (error) {
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
    async toggleStatus(id, res) {
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
        }
        catch (error) {
            console.error('Error toggling region-game-vendor relationship status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to toggle region-game-vendor relationship status'
            });
        }
    }
    async delete(id, res) {
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
        }
        catch (error) {
            console.error('Error deleting region-game-vendor relationship:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete region-game-vendor relationship'
            });
        }
    }
};
exports.RegionGameVendorController = RegionGameVendorController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('regions'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getRegions", null);
__decorate([
    (0, common_1.Get)('games'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getGames", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getVendors", null);
__decorate([
    (0, common_1.Get)('cascade-data'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getCascadeData", null);
__decorate([
    (0, common_1.Get)('filtered-data'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getFilteredData", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_region_game_vendor_dto_1.CreateRegionGameVendorDto, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Post)('seed'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "seedData", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_region_game_vendor_dto_1.UpdateRegionGameVendorDto, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegionGameVendorController.prototype, "delete", null);
exports.RegionGameVendorController = RegionGameVendorController = __decorate([
    (0, common_1.Controller)('region-game-vendor'),
    __metadata("design:paramtypes", [region_game_vendor_service_1.RegionGameVendorService])
], RegionGameVendorController);
//# sourceMappingURL=region-game-vendor.controller.js.map