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
exports.VendorRatesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const vendor_rates_service_1 = require("./vendor-rates.service");
let VendorRatesController = class VendorRatesController {
    vendorRatesService;
    constructor(vendorRatesService) {
        this.vendorRatesService = vendorRatesService;
    }
    async getVendorRates() {
        const rates = await this.vendorRatesService.getVendorRates();
        return {
            success: true,
            rates
        };
    }
    async updateVendorRate(updateData) {
        const updatedRate = await this.vendorRatesService.updateVendorRate(updateData.vendorName, updateData.vendorCurrency, updateData.newRate, updateData.updatedBy, updateData.reason);
        return {
            success: true,
            message: 'Vendor rate updated successfully',
            rate: updatedRate
        };
    }
    async getVendorRateHistory(vendorName, vendorCurrency) {
        const history = await this.vendorRatesService.getVendorRateHistory(vendorName, vendorCurrency);
        return {
            success: true,
            history
        };
    }
};
exports.VendorRatesController = VendorRatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorRatesController.prototype, "getVendorRates", null);
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorRatesController.prototype, "updateVendorRate", null);
__decorate([
    (0, common_1.Get)('history/:vendorName/:vendorCurrency'),
    __param(0, (0, common_1.Param)('vendorName')),
    __param(1, (0, common_1.Param)('vendorCurrency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VendorRatesController.prototype, "getVendorRateHistory", null);
exports.VendorRatesController = VendorRatesController = __decorate([
    (0, common_1.Controller)('vendor-rates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vendor_rates_service_1.VendorRatesService])
], VendorRatesController);
//# sourceMappingURL=vendor-rates.controller.js.map