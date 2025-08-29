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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);
            return {
                success: true,
                message: 'User created successfully. Setup email sent to user.',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role.toLowerCase(),
                    status: user.status.toLowerCase(),
                    balance: user.balance,
                    smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
                    totalSpent: user.totalSpent,
                    totalOrders: user.totalOrders,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    ...(user.role === 'RESELLER' && {
                        commission: user.commission,
                        totalEarnings: user.totalEarnings,
                        referralCode: user.referralCode,
                        referredBy: user.referredBy,
                        downlineCount: user.downlineCount,
                    }),
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    isVerified: user.isVerified,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to create user',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findAll(role, status, search, page, limit, sortBy, sortOrder) {
        try {
            const pageNum = parseInt(page || '1');
            const limitNum = parseInt(limit || '50');
            const skip = (pageNum - 1) * limitNum;
            const result = await this.usersService.findAll({
                role: role || '',
                status: status || '',
                search: search || '',
                skip,
                take: limitNum,
                sortBy: sortBy || '',
                sortOrder: sortOrder || 'asc',
            });
            const formattedUsers = result.users.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.toLowerCase(),
                status: user.status.toLowerCase(),
                balance: user.balance,
                smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                ...(user.role === 'RESELLER' && {
                    commission: user.commission,
                    totalEarnings: user.totalEarnings,
                    referralCode: user.referralCode,
                    referredBy: user.referredBy,
                    downlineCount: user.downlineCount,
                }),
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                isVerified: user.isVerified,
            }));
            return {
                success: true,
                users: formattedUsers,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNum),
                    hasMore: result.hasMore,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch users',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserStats() {
        try {
            const stats = await this.usersService.getUserStats();
            return {
                success: true,
                stats,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch user statistics',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBalance(req) {
        try {
            console.log('Request user:', req.user);
            console.log('request');
            if (!req.user || !req.user.userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'User not authenticated or user ID missing',
                    statusCode: common_1.HttpStatus.UNAUTHORIZED,
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.usersService.findById(req.user.userId);
            if (!user) {
                console.log('User not found in database for ID:', req.user.userId);
                throw new common_1.HttpException({
                    success: false,
                    message: 'User not found',
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                balance: user.balance || 0,
                smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
                currency: 'XCN',
            };
        }
        catch (error) {
            console.error('Balance endpoint error:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch balance',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'User not found',
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role.toLowerCase(),
                    status: user.status.toLowerCase(),
                    balance: user.balance,
                    smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
                    totalSpent: user.totalSpent,
                    totalOrders: user.totalOrders,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    ...(user.role === 'RESELLER' && {
                        commission: user.commission,
                        totalEarnings: user.totalEarnings,
                        referralCode: user.referralCode,
                        referredBy: user.referredBy,
                        downlineCount: user.downlineCount,
                    }),
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    isVerified: user.isVerified,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch user',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateUserDto) {
        try {
            const user = await this.usersService.update(id, updateUserDto);
            return {
                success: true,
                message: 'User updated successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role.toLowerCase(),
                    status: user.status.toLowerCase(),
                    balance: user.balance,
                    smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
                    totalSpent: user.totalSpent,
                    totalOrders: user.totalOrders,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    ...(user.role === 'RESELLER' && {
                        commission: user.commission,
                        totalEarnings: user.totalEarnings,
                        referralCode: user.referralCode,
                        referredBy: user.referredBy,
                        downlineCount: user.downlineCount,
                    }),
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    isVerified: user.isVerified,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to update user',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(id) {
        try {
            await this.usersService.remove(id);
            return {
                success: true,
                message: 'User deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to delete user',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async toggleStatus(id) {
        try {
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            const updatedUser = await this.usersService.update(id, { status: newStatus.toLowerCase() });
            return {
                success: true,
                message: `User ${newStatus.toLowerCase()} successfully`,
                user: {
                    id: updatedUser.id,
                    status: updatedUser.status.toLowerCase(),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to toggle user status',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async rechargeBalance(id, body, req) {
        try {
            const { amount, notes } = body;
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Invalid recharge amount. Amount must be a positive number.',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'User not found',
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const previousBalance = user.balance;
            await this.usersService.updateBalance(id, amount);
            const updatedUser = await this.usersService.findById(id);
            if (!updatedUser) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Failed to update user balance',
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return {
                success: true,
                user: {
                    id: updatedUser.id,
                    balance: updatedUser.balance,
                },
                message: `Successfully recharged ${amount.toLocaleString()} XCN to ${user.firstName} ${user.lastName}`,
                transaction: {
                    amount,
                    previousBalance,
                    newBalance: updatedUser.balance,
                    rechargedBy: req.user.email,
                    timestamp: new Date().toISOString(),
                    notes: notes || null,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to recharge user balance',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async rechargeSmileBalance(id, body, req) {
        try {
            const { amount, region, notes } = body;
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Invalid recharge amount. Amount must be a positive number.',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!region || typeof region !== 'string') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Region is required and must be a string.',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'User not found',
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const updatedBalance = await this.usersService.updateSmileBalance(id, region, amount);
            const updatedUser = await this.usersService.findById(id);
            return {
                success: true,
                user: {
                    id: user.id,
                    region: region,
                    smileCoinBalances: updatedUser?.smileCoinBalances || [],
                },
                message: `Successfully recharged ${amount.toLocaleString()} Smile Coins to ${user.firstName} ${user.lastName} for ${region}`,
                transaction: {
                    amount,
                    region,
                    newBalance: updatedBalance,
                    rechargedBy: req.user.email,
                    timestamp: new Date().toISOString(),
                    notes: notes || null,
                    currency: 'Smile Coins',
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to recharge user Smile coin balance',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resendSetupEmail(id) {
        try {
            const result = await this.usersService.resendSetupEmail(id);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to resend setup email',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async exportUsers(filters) {
        try {
            const result = await this.usersService.findAll({
                ...filters,
                take: 10000,
            });
            const exportData = result.users.map(user => ({
                Name: `${user.firstName} ${user.lastName}`,
                Email: user.email,
                Role: user.role,
                Status: user.status,
                Balance: user.balance,
                'Total Spent': user.totalSpent,
                Orders: user.totalOrders,
                Created: new Date(user.createdAt).toLocaleDateString(),
                Phone: user.phone || '',
                ...(user.role === 'RESELLER' && {
                    Commission: user.commission,
                    'Total Earnings': user.totalEarnings,
                    'Referral Code': user.referralCode,
                    'Downline Count': user.downlineCount,
                }),
            }));
            return {
                success: true,
                data: exportData,
                total: result.total,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to export users',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Post)(':id/recharge'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rechargeBalance", null);
__decorate([
    (0, common_1.Post)(':id/recharge-smile'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rechargeSmileBalance", null);
__decorate([
    (0, common_1.Post)(':id/resend-setup'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resendSetupEmail", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map