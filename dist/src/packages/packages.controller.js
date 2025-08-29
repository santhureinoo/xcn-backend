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
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
const packages_service_1 = require("./packages.service");
const create_package_dto_1 = require("./dto/create-package.dto");
const update_package_dto_1 = require("./dto/update-package.dto");
let PackagesController = class PackagesController {
    packagesService;
    constructor(packagesService) {
        this.packagesService = packagesService;
    }
    async searchPackageByCode(code, gameName) {
        try {
            if (!code || !gameName) {
                throw new common_1.BadRequestException('Code and game parameters are required');
            }
            const package_ = await this.packagesService.searchPackageByCode(code, gameName);
            return {
                success: true,
                package: package_,
                found: !!package_,
            };
        }
        catch (error) {
            console.error('Error searching package:', error);
            return {
                success: false,
                error: error.message,
                package: null,
                found: false,
            };
        }
    }
    async searchMultiplePackages(body) {
        try {
            if (!body.codes || !Array.isArray(body.codes) || !body.gameName) {
                throw new common_1.BadRequestException('Codes array and gameName are required');
            }
            const result = await this.packagesService.searchMultiplePackagesByCodes(body.codes, body.gameName);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            console.error('Error searching multiple packages:', error);
            return {
                success: false,
                error: error.message,
                found: [],
                notFound: body.codes || [],
            };
        }
    }
    async validateBulkOrderPackages(body) {
        try {
            if (!body.orders || !Array.isArray(body.orders)) {
                throw new common_1.BadRequestException('Orders array is required');
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
        }
        catch (error) {
            console.error('Error validating bulk order:', error);
            return {
                success: false,
                error: error.message,
                results: [],
            };
        }
    }
    create(createPackageDto) {
        return this.packagesService.create(createPackageDto);
    }
    findAll(region, gameName, vendor, status, search, page, limit, sortBy, sortOrder) {
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
    getPackageStats() {
        return this.packagesService.getPackageStats();
    }
    getVendors() {
        return this.packagesService.getVendors();
    }
    findOne(id) {
        return this.packagesService.findById(id);
    }
    update(id, updatePackageDto) {
        return this.packagesService.update(id, updatePackageDto);
    }
    remove(id) {
        return this.packagesService.remove(id);
    }
    async toggleStatus(id) {
        return this.packagesService.togglePackageStatus(id);
    }
};
exports.PackagesController = PackagesController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('game')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "searchPackageByCode", null);
__decorate([
    (0, common_1.Post)('search/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "searchMultiplePackages", null);
__decorate([
    (0, common_1.Post)('validate-bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "validateBulkOrderPackages", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Query)('gameName')),
    __param(2, (0, common_1.Query)('vendor')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "getPackageStats", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "getVendors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_package_dto_1.UpdatePackageDto]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "toggleStatus", null);
exports.PackagesController = PackagesController = __decorate([
    (0, common_1.Controller)('packages'),
    __metadata("design:paramtypes", [packages_service_1.PackagesService])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map