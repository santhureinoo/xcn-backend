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
var VendorRetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRetryService = void 0;
const common_1 = require("@nestjs/common");
const vendor_service_1 = require("./vendor.service");
let VendorRetryService = VendorRetryService_1 = class VendorRetryService {
    vendorService;
    logger = new common_1.Logger(VendorRetryService_1.name);
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    async triggerRetryProcessing() {
        try {
            const pendingRetries = await this.vendorService.getPendingRetries();
            await this.vendorService.processPendingRetries();
            return {
                message: 'Retry processing triggered successfully',
                processed: pendingRetries.length,
            };
        }
        catch (error) {
            this.logger.error(`Error in manual retry trigger: ${error.message}`);
            throw error;
        }
    }
};
exports.VendorRetryService = VendorRetryService;
exports.VendorRetryService = VendorRetryService = VendorRetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorRetryService);
//# sourceMappingURL=vendor-retry.service.js.map