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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getTransactions(query) {
        try {
            const { type, status, userRole, search, dateFrom, dateTo, page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const result = await this.transactionsService.findAll({
                type,
                status,
                userRole,
                search,
                dateFrom,
                dateTo,
                skip,
                take,
                sortBy,
                sortOrder
            });
            return {
                success: true,
                transactions: result.transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / parseInt(limit)),
                    hasMore: result.hasMore
                }
            };
        }
        catch (error) {
            console.error('Error in getTransactions:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    async getTransactionStats() {
        try {
            const stats = await this.transactionsService.getTransactionStats();
            return {
                success: true,
                stats
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    async updateTransactionStatus(id, body) {
        try {
            const transaction = await this.transactionsService.updateTransactionStatus(id, body.status, body.adminNotes);
            return {
                success: true,
                transaction,
                message: `Transaction status updated to ${body.status}`
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    async createOrder(req, createOrderDto) {
        try {
            const userId = req.user?.userId || req.user?.sub;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }
            const { packageId, playerId, identifier, packageCode, gameName, playerDetails } = createOrderDto;
            if (!packageId || !playerId || !packageCode) {
                return {
                    success: false,
                    message: 'Missing required fields: packageId, playerId, packageCode'
                };
            }
            const order = await this.transactionsService.createOrder({
                packageId,
                playerId,
                identifier,
                gameName,
                userId,
                playerDetails
            });
            return {
                success: order.success,
                order,
                orderId: order.order?.id,
                message: 'Order created successfully'
            };
        }
        catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                message: error.message || 'Failed to create order'
            };
        }
    }
    async getSmileCoinBalanceByRegion(req, region) {
        try {
            if (!req.user || !req.user.userId) {
                return {
                    success: false,
                    message: 'User not authenticated or user ID missing',
                    statusCode: 401,
                };
            }
            const balance = await this.transactionsService.getSmileCoinBalanceByRegion(req.user.userId, region);
            return {
                success: true,
                balance: balance,
                region: region,
                currency: 'Smile Coins',
            };
        }
        catch (error) {
            console.error('Smile coin balance by region endpoint error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch smile coin balance',
                statusCode: 500,
            };
        }
    }
    async getXCoinTransactions(req, query) {
        try {
            const userId = req.user?.userId || req.user?.sub;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }
            const { page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const result = await this.transactionsService.getXCoinTransactions({
                userId,
                skip,
                take,
                sortBy,
                sortOrder
            });
            return {
                success: true,
                transactions: result.transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / parseInt(limit)),
                    hasMore: result.hasMore
                }
            };
        }
        catch (error) {
            console.error('Error in getXCoinTransactions:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    async getPackageTransactions(req, query) {
        try {
            const userId = req.user?.userId || req.user?.sub;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }
            const { page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const result = await this.transactionsService.getPackageTransactions({
                userId,
                skip,
                take,
                sortBy,
                sortOrder
            });
            return {
                success: true,
                transactions: result.transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / parseInt(limit)),
                    hasMore: result.hasMore
                }
            };
        }
        catch (error) {
            console.error('Error in getPackageTransactions:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    async getXCoinTransactionById(id) {
        try {
            const transaction = await this.transactionsService.getXCoinTransactionById(id);
            if (!transaction) {
                return {
                    success: false,
                    message: 'XCoin transaction not found'
                };
            }
            return {
                success: true,
                transaction
            };
        }
        catch (error) {
            console.error('Error in getXCoinTransactionById:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    async getSmileCoinTransactions(req, query) {
        try {
            const userId = req.user?.userId || req.user?.sub;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }
            const { page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const result = await this.transactionsService.getSmileCoinTransactions({
                userId,
                skip,
                take,
                sortBy,
                sortOrder
            });
            return {
                success: true,
                transactions: result.transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / parseInt(limit)),
                    hasMore: result.hasMore
                }
            };
        }
        catch (error) {
            console.error('Error in getSmileCoinTransactions:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateTransactionStatus", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('smile-balance/:region'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getSmileCoinBalanceByRegion", null);
__decorate([
    (0, common_1.Get)('xcoin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getXCoinTransactions", null);
__decorate([
    (0, common_1.Get)('packages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getPackageTransactions", null);
__decorate([
    (0, common_1.Get)('xcoin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getXCoinTransactionById", null);
__decorate([
    (0, common_1.Get)('smile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getSmileCoinTransactions", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map