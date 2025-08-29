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
var SmileOneController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmileOneController = void 0;
const common_1 = require("@nestjs/common");
const smile_one_service_1 = require("./smile-one.service");
const product_list_request_dto_1 = require("./dto/product-list-request.dto");
let SmileOneController = SmileOneController_1 = class SmileOneController {
    smileOneService;
    logger = new common_1.Logger(SmileOneController_1.name);
    constructor(smileOneService) {
        this.smileOneService = smileOneService;
    }
    async getProductList(product) {
        try {
            const result = await this.smileOneService.getProductListSimple(product);
            return result;
        }
        catch (error) {
            this.logger.error(`Error getting product list: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }
    async getProductListPost(body) {
        try {
            if (body.sign) {
                const params = {
                    uid: body.uid,
                    email: body.email,
                    time: body.time || Math.floor(Date.now() / 1000).toString(),
                };
                if (body.product)
                    params.product = body.product;
                if (body.productid)
                    params.productid = body.productid;
                if (body.userid)
                    params.userid = body.userid;
                if (body.zoneid)
                    params.zoneid = body.zoneid;
                params.sign = body.sign;
                return this.smileOneService.makeRequest('smilecoin/api/productlist', params);
            }
            else {
                return this.smileOneService.getProductList(body);
            }
        }
        catch (error) {
            this.logger.error(`Error getting product list: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }
    async getProductListFull(body) {
        try {
            const result = await this.smileOneService.getProductList(body);
            return result;
        }
        catch (error) {
            this.logger.error(`Error getting product list: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }
};
exports.SmileOneController = SmileOneController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('product')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmileOneController.prototype, "getProductList", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_list_request_dto_1.ProductListRequestDto]),
    __metadata("design:returntype", Promise)
], SmileOneController.prototype, "getProductListPost", null);
__decorate([
    (0, common_1.Post)('products/full'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_list_request_dto_1.ProductListRequestDto]),
    __metadata("design:returntype", Promise)
], SmileOneController.prototype, "getProductListFull", null);
exports.SmileOneController = SmileOneController = SmileOneController_1 = __decorate([
    (0, common_1.Controller)('smile-one'),
    __metadata("design:paramtypes", [smile_one_service_1.SmileOneService])
], SmileOneController);
//# sourceMappingURL=smile-one.controller.js.map