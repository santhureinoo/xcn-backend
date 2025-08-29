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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionGameVendorService = void 0;
const client_1 = require("@prisma/client");
const smile_one_service_1 = require("../smile-one/smile-one.service");
const common_1 = require("@nestjs/common");
const prisma = new client_1.PrismaClient();
let RegionGameVendorService = class RegionGameVendorService {
    smileOneService;
    constructor(smileOneService) {
        this.smileOneService = smileOneService;
    }
    async getAll(filters) {
        const { region, gameName, vendorName, isActive = true, page = 1, limit = 100 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getUniqueRegions(filters) {
        const where = {
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
    async getUniqueGames(filters) {
        const where = {
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
    async getUniqueVendorNames(filters) {
        const where = {
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
    async checkSmileOneIntegration(region, gameName, vendorName) {
        if (region &&
            gameName?.toLowerCase() === 'mobile legends' &&
            vendorName?.toLowerCase() === 'smile') {
            try {
                const productResponse = await this.smileOneService.getProductList({
                    product: gameName.toLowerCase().split(' ').join(''),
                });
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
            }
            catch (error) {
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
        return null;
    }
    async getFilteredData(filters) {
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
    async getById(id) {
        return await prisma.regionGameVendor.findUnique({
            where: { id }
        });
    }
    async create(data) {
        return await prisma.regionGameVendor.create({
            data: {
                region: data.region,
                gameName: data.gameName,
                vendorName: data.vendorName,
                isActive: data.isActive ?? true
            }
        });
    }
    async update(id, data) {
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
        }
        catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            throw error;
        }
    }
    async delete(id) {
        try {
            await prisma.regionGameVendor.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            if (error.code === 'P2025') {
                return false;
            }
            throw error;
        }
    }
    async bulkCreate(relationships) {
        let created = 0;
        let skipped = 0;
        for (const relationship of relationships) {
            try {
                await this.create(relationship);
                created++;
            }
            catch (error) {
                if (error.code === 'P2002') {
                    skipped++;
                }
                else {
                    throw error;
                }
            }
        }
        return { created, skipped };
    }
    async toggleStatus(id) {
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
    async getStats() {
        const [totalRelationships, activeRelationships, uniqueRegions, uniqueGames, uniqueVendors] = await Promise.all([
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
    async seedInitialData() {
        const initialData = [
            { region: 'Malaysia', gameName: 'Mobile Legends', vendorName: 'Razor Gold' },
            { region: 'Malaysia', gameName: 'Free Fire', vendorName: 'Razor Gold' },
            { region: 'Malaysia', gameName: 'PUBG Mobile', vendorName: 'Razor Gold' },
            { region: 'Malaysia', gameName: 'Genshin Impact', vendorName: 'Razor Gold' },
            { region: 'Myanmar', gameName: 'Mobile Legends', vendorName: 'Smile' },
            { region: 'Myanmar', gameName: 'Free Fire', vendorName: 'Smile' },
            { region: 'Myanmar', gameName: 'PUBG Mobile', vendorName: 'Smile' },
            { region: 'Myanmar', gameName: 'Genshin Impact', vendorName: 'Smile' },
            { region: 'Singapore', gameName: 'Mobile Legends', vendorName: 'Garena' },
            { region: 'Singapore', gameName: 'Free Fire', vendorName: 'Garena' },
            { region: 'Singapore', gameName: 'PUBG Mobile', vendorName: 'Garena' },
            { region: 'Singapore', gameName: 'Genshin Impact', vendorName: 'Garena' },
            { region: 'Thailand', gameName: 'Mobile Legends', vendorName: 'Tencent' },
            { region: 'Thailand', gameName: 'Free Fire', vendorName: 'Tencent' },
            { region: 'Thailand', gameName: 'PUBG Mobile', vendorName: 'Tencent' },
            { region: 'Thailand', gameName: 'Genshin Impact', vendorName: 'Tencent' },
            { region: 'Brazil', gameName: 'Mobile Legends', vendorName: 'Razor Gold' },
            { region: 'Brazil', gameName: 'Free Fire', vendorName: 'Razor Gold' },
            { region: 'Brazil', gameName: 'PUBG Mobile', vendorName: 'Razor Gold' },
            { region: 'Brazil', gameName: 'Genshin Impact', vendorName: 'Razor Gold' }
        ];
        return await this.bulkCreate(initialData);
    }
};
exports.RegionGameVendorService = RegionGameVendorService;
exports.RegionGameVendorService = RegionGameVendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [smile_one_service_1.SmileOneService])
], RegionGameVendorService);
//# sourceMappingURL=region-game-vendor.service.js.map