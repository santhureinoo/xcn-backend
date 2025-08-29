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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PackagesService = class PackagesService {
    prisma;
    async togglePackageStatus(id) {
        try {
            const packages = await this.findById(id);
            if (!packages || packages.length === 0) {
                throw new common_1.NotFoundException(`Package with ID ${id} not found`);
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to toggle package status: ' + error.message);
        }
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPackagePrice(packageData, userRole) {
        if (userRole === 'RESELLER' && packageData.vendor === 'Smile') {
            return Number(packageData.baseVendorCost) || 0;
        }
        return Number(packageData.price) || 0;
    }
    isSpecialPricing(packageData, userRole) {
        return userRole === 'RESELLER' && packageData.vendor === 'Smile';
    }
    calculateMixedVendorCosts(packages, userRole) {
        let xCoinCost = 0;
        let smileCoinCost = 0;
        let hasSmilePackages = false;
        packages.forEach(pkg => {
            if (this.isSpecialPricing(pkg, userRole)) {
                smileCoinCost += this.getPackagePrice(pkg, userRole);
                hasSmilePackages = true;
            }
            else {
                xCoinCost += this.getPackagePrice(pkg, userRole);
            }
        });
        return { xCoinCost, smileCoinCost, hasSmilePackages };
    }
    transformPackageForResponse(packageData) {
        return {
            ...packageData,
            vendorPackageCodes: packageData.vendorPackageCode ? packageData.vendorPackageCode.split(',') : [],
            packageStatus: typeof packageData.packageStatus === 'string' ? packageData.packageStatus.toLowerCase() : packageData.packageStatus,
            type: packageData.type?.toLowerCase() || 'diamond',
            price: Number(packageData.price) || 0,
            vendorPrice: Number(packageData.vendorPrice) || 0,
            stock: Number(packageData.stock) || 0,
            discount: Number(packageData.discount) || 0,
            amount: Number(packageData.amount) || 0,
            duration: Number(packageData.duration) || 0,
        };
    }
    async create(createPackageDto) {
        try {
            if (!createPackageDto.name || !createPackageDto.region || !createPackageDto.gameName || !createPackageDto.vendor) {
                throw new common_1.BadRequestException('Missing required fields: name, region, gameName, or vendor');
            }
            if (!createPackageDto.vendorPackageCodes || !Array.isArray(createPackageDto.vendorPackageCodes) || createPackageDto.vendorPackageCodes.length === 0) {
                throw new common_1.BadRequestException('vendorPackageCodes must be a non-empty array');
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
                    vendorPackageCode: createPackageDto.vendorPackageCodes.join(','),
                    vendorPrice: Number(createPackageDto.vendorPrice) || 0,
                    vendorCurrency: vendorExchangeRate?.vendorCurrency || '',
                    currency: createPackageDto.currency || 'USD',
                    packageStatus: 1,
                    resellKeyword: createPackageDto.resellKeyword || '',
                    stock: Number(createPackageDto.stock) || 0,
                    isPriceLocked: createPackageDto.isPriceLocked || false,
                    baseVendorCost: Number(createPackageDto.baseVendorCost) || 0,
                    markupId: createPackageDto.markupId || null,
                    basePrice: createPackageDto.basePrice ? Number(createPackageDto.basePrice) : null,
                    markupPercent: Number(createPackageDto.markupPercent) || 15,
                    roundToNearest: Number(createPackageDto.roundToNearest) || 1,
                    markupAppliedAt: createPackageDto.markupId ? new Date() : null,
                },
                include: {
                    appliedMarkup: true,
                }
            });
            const transformedPackage = this.transformPackageForResponse(packageData);
            return {
                success: true,
                package: transformedPackage,
                message: 'Package created successfully'
            };
        }
        catch (error) {
            console.error('Error creating package:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create package: ' + error.message);
        }
    }
    async findAll(filters = {}) {
        try {
            const { region, gameName, vendor, status, search, skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc', } = filters;
            const where = {};
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
                };
            }
            if (gameName && gameName !== 'all') {
                where.gameName = {
                    contains: gameName,
                };
            }
            if (vendor && vendor !== 'all') {
                where.vendor = {
                    contains: vendor,
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
                        },
                    },
                    {
                        description: {
                            contains: search,
                        },
                    },
                    {
                        vendorPackageCode: {
                            contains: search,
                        },
                    },
                ];
            }
            const orderBy = {};
            if (sortBy === 'name') {
                orderBy.name = sortOrder;
            }
            else if (sortBy === 'price') {
                orderBy.price = sortOrder;
            }
            else if (sortBy === 'stock') {
                orderBy.stock = sortOrder;
            }
            else if (sortBy === 'updatedAt') {
                orderBy.updatedAt = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [packages, total] = await Promise.all([
                this.prisma.package.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
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
            const transformedPackages = packages.map(pkg => this.transformPackageForResponse(pkg));
            const totalPages = Math.ceil(total / take);
            const currentPage = Math.floor(skip / take) + 1;
            const hasMore = skip + take < total;
            return {
                packages: transformedPackages,
                total,
                hasMore,
                pagination: {
                    page: currentPage,
                    limit: take,
                    total,
                    totalPages,
                    hasMore,
                }
            };
        }
        catch (error) {
            console.error('Error fetching packages:', error);
            throw new common_1.BadRequestException('Failed to fetch packages: ' + error.message);
        }
    }
    async findById(ids) {
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
                throw new common_1.NotFoundException(`Package with ID ${ids} not found`);
            }
            return packageData.map(pkg => this.transformPackageForResponse(pkg));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error fetching package:', error);
            throw new common_1.BadRequestException('Failed to fetch package: ' + error.message);
        }
    }
    async update(id, updatePackageDto) {
        try {
            const existingPackage = await this.findById(id);
            if (!existingPackage || existingPackage.length === 0) {
                throw new common_1.NotFoundException(`Package with ID ${id} not found`);
            }
            const updateData = {};
            if (updatePackageDto.name !== undefined)
                updateData.name = updatePackageDto.name;
            if (updatePackageDto.description !== undefined)
                updateData.description = updatePackageDto.description;
            if (updatePackageDto.price !== undefined)
                updateData.price = Number(updatePackageDto.price);
            if (updatePackageDto.imageUrl !== undefined)
                updateData.imageUrl = updatePackageDto.imageUrl;
            if (updatePackageDto.type !== undefined)
                updateData.type = updatePackageDto.type;
            if (updatePackageDto.gameId !== undefined)
                updateData.gameId = updatePackageDto.gameId;
            if (updatePackageDto.featured !== undefined)
                updateData.featured = updatePackageDto.featured;
            if (updatePackageDto.discount !== undefined)
                updateData.discount = Number(updatePackageDto.discount);
            if (updatePackageDto.amount !== undefined)
                updateData.amount = Number(updatePackageDto.amount);
            if (updatePackageDto.duration !== undefined)
                updateData.duration = Number(updatePackageDto.duration);
            if (updatePackageDto.region !== undefined)
                updateData.region = updatePackageDto.region;
            if (updatePackageDto.gameName !== undefined)
                updateData.gameName = updatePackageDto.gameName;
            if (updatePackageDto.vendor !== undefined)
                updateData.vendor = updatePackageDto.vendor;
            if (updatePackageDto.vendorPrice !== undefined)
                updateData.vendorPrice = Number(updatePackageDto.vendorPrice);
            if (updatePackageDto.currency !== undefined)
                updateData.currency = updatePackageDto.currency;
            if (updatePackageDto.status !== undefined)
                updateData.packageStatus = updatePackageDto.status;
            if (updatePackageDto.stock !== undefined)
                updateData.stock = Number(updatePackageDto.stock);
            if (updatePackageDto.baseVendorCost !== undefined)
                updateData.baseVendorCost = Number(updatePackageDto.baseVendorCost);
            if (updatePackageDto.isPriceLocked !== undefined)
                updateData.isPriceLocked = updatePackageDto.isPriceLocked;
            if (updatePackageDto.resellKeyword !== undefined)
                updateData.resellKeyword = updatePackageDto.resellKeyword;
            if (updatePackageDto.vendorPackageCodes && Array.isArray(updatePackageDto.vendorPackageCodes)) {
                updateData.vendorPackageCode = updatePackageDto.vendorPackageCodes.join(',');
            }
            if (updatePackageDto.markupId !== undefined) {
                updateData.markupId = updatePackageDto.markupId || null;
                updateData.markupAppliedAt = updatePackageDto.markupId ? new Date() : null;
            }
            if (updatePackageDto.basePrice !== undefined)
                updateData.basePrice = updatePackageDto.basePrice ? Number(updatePackageDto.basePrice) : null;
            if (updatePackageDto.markupPercent !== undefined)
                updateData.markupPercent = Number(updatePackageDto.markupPercent);
            if (updatePackageDto.vendorCurrency !== undefined)
                updateData.vendorCurrency = updatePackageDto.vendorCurrency;
            if (updatePackageDto.roundToNearest !== undefined)
                updateData.roundToNearest = Number(updatePackageDto.roundToNearest);
            const updatedPackage = await this.prisma.package.update({
                where: { id },
                data: updateData,
                include: {
                    appliedMarkup: true,
                }
            });
            const transformedPackage = this.transformPackageForResponse(updatedPackage);
            return {
                success: true,
                package: transformedPackage,
                message: 'Package updated successfully'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error updating package:', error);
            throw new common_1.BadRequestException('Failed to update package: ' + error.message);
        }
    }
    async remove(id) {
        try {
            await this.findById(id);
            await this.prisma.package.update({
                where: { id },
                data: { packageStatus: 3 },
            });
            return { message: 'Package deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error deleting package:', error);
            throw new common_1.BadRequestException('Failed to delete package: ' + error.message);
        }
    }
    async getPackageStats() {
        try {
            const [totalPackages, activePackages, inactivePackages, outOfStockPackages, totalStock, averagePrice, regionStats, gameStats, vendorStats,] = await Promise.all([
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
        }
        catch (error) {
            console.error('Error fetching package stats:', error);
            throw new common_1.BadRequestException('Failed to fetch package statistics: ' + error.message);
        }
    }
    async getVendors() {
        try {
            const vendors = await this.prisma.package.groupBy({
                by: ['vendor', 'region', 'gameName'],
                _count: { vendor: true },
                orderBy: [
                    { vendor: 'asc' },
                    { region: 'asc' },
                    { gameName: 'asc' },
                ],
            });
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
            const formattedVendors = Array.from(vendorMap.values()).map(vendor => ({
                ...vendor,
                regions: Array.from(vendor.regions),
                games: Array.from(vendor.games),
            }));
            return formattedVendors;
        }
        catch (error) {
            console.error('Error fetching vendors:', error);
            throw new common_1.BadRequestException('Failed to fetch vendors: ' + error.message);
        }
    }
    async logStockUpdate(packageId, previousStock, newStock, adminId, notes) {
        try {
            console.log('Stock Update Log:', {
                packageId,
                previousStock,
                newStock,
                adminId,
                notes,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error('Failed to log stock update:', error);
        }
    }
    async getRegions() {
        try {
            const regions = await this.prisma.package.findMany({
                select: { region: true },
                distinct: ['region'],
                orderBy: { region: 'asc' },
            });
            return regions.map(r => r.region);
        }
        catch (error) {
            console.error('Error fetching regions:', error);
            return [];
        }
    }
    async getGames() {
        try {
            const games = await this.prisma.package.findMany({
                select: { gameName: true },
                distinct: ['gameName'],
                orderBy: { gameName: 'asc' },
            });
            return games.map(g => g.gameName);
        }
        catch (error) {
            console.error('Error fetching vendor names:', error);
            return [];
        }
    }
    async findByCode(code, gameName) {
        try {
            const where = {
                resellKeyword: {
                    contains: code,
                },
                packageStatus: 1,
            };
            if (gameName) {
                where.gameName = {
                    contains: gameName,
                    packageStatus: 1,
                };
            }
            const packageData = await this.prisma.package.findFirst({
                where
            });
            return packageData;
        }
        catch (error) {
            console.error('Error finding package by code:', error);
            throw new common_1.BadRequestException('Failed to find package');
        }
    }
    async searchMultiplePackagesByCodes(codes, gameName) {
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
        }
        catch (error) {
            console.error('Error searching multiple packages:', error);
            throw new common_1.BadRequestException('Failed to search packages');
        }
    }
    async searchPackageByCode(code, gameName) {
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
        }
        catch (error) {
            console.error('Error searching package by code:', error);
            throw new common_1.BadRequestException('Failed to search package');
        }
    }
    calculateTotalPrice(packages) {
        return packages.reduce((total, pkg) => total + pkg.price, 0);
    }
    async validateBulkOrderPackages(orders) {
        const results = [];
        for (const order of orders) {
            const { found, notFound } = await this.searchMultiplePackagesByCodes(order.packageCodes, order.gameName);
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
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackagesService);
//# sourceMappingURL=packages.service.js.map