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
exports.RegionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RegionService = class RegionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRegionDto) {
        try {
            const existingRegion = await this.prisma.region.findUnique({
                where: { name: createRegionDto.name },
            });
            if (existingRegion) {
                throw new common_1.BadRequestException(`Region with name '${createRegionDto.name}' already exists`);
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create region: ' + error.message);
        }
    }
    async findAll(filters = {}) {
        try {
            const { status, search, skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc', } = filters;
            const where = {};
            if (status && status !== 'all') {
                where.status = status.toUpperCase();
            }
            if (search) {
                where.name = {
                    contains: search,
                };
            }
            const orderBy = {};
            if (sortBy === 'name') {
                orderBy.name = sortOrder;
            }
            else if (sortBy === 'status') {
                orderBy.status = sortOrder;
            }
            else if (sortBy === 'updatedAt') {
                orderBy.updatedAt = sortOrder;
            }
            else {
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
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch regions: ' + error.message);
        }
    }
    async findOne(id) {
        try {
            const region = await this.prisma.region.findUnique({
                where: { id },
            });
            if (!region) {
                throw new common_1.NotFoundException(`Region with ID ${id} not found`);
            }
            return region;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch region: ' + error.message);
        }
    }
    async update(id, updateRegionDto) {
        try {
            const existingRegion = await this.findOne(id);
            if (updateRegionDto.name && updateRegionDto.name !== existingRegion.name) {
                const duplicateRegion = await this.prisma.region.findUnique({
                    where: { name: updateRegionDto.name },
                });
                if (duplicateRegion) {
                    throw new common_1.BadRequestException(`Region with name '${updateRegionDto.name}' already exists`);
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update region: ' + error.message);
        }
    }
    async remove(id) {
        try {
            await this.findOne(id);
            await this.prisma.region.delete({
                where: { id },
            });
            return { message: 'Region deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete region: ' + error.message);
        }
    }
    async getRegionStats() {
        try {
            const [totalRegions, activeRegions, inactiveRegions,] = await Promise.all([
                this.prisma.region.count(),
                this.prisma.region.count({ where: { status: 'ACTIVE' } }),
                this.prisma.region.count({ where: { status: 'INACTIVE' } }),
            ]);
            return {
                totalRegions,
                activeRegions,
                inactiveRegions,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch region statistics: ' + error.message);
        }
    }
    async toggleStatus(id) {
        try {
            const existingRegion = await this.findOne(id);
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to toggle region status: ' + error.message);
        }
    }
    async getRegionsByGame(gameName) {
        try {
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
            return packages.map(p => ({
                region: p.region,
                vendorName: p.vendorRate?.vendorName || null,
            })).filter(p => p.region);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch regions by game: ' + error.message);
        }
    }
};
exports.RegionService = RegionService;
exports.RegionService = RegionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegionService);
//# sourceMappingURL=region.service.js.map