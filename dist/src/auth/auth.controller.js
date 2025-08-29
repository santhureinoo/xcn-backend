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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(req) {
        try {
            console.log(req.body);
            const result = await this.authService.login(req.body);
            return {
                token: result.access_token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    role: result.user.role.toLowerCase(),
                    status: result.user.status?.toLowerCase(),
                    balance: result.user.balance,
                    totalSpent: result.user.totalSpent,
                    totalOrders: result.user.totalOrders,
                    phone: result.user.phone,
                    address: result.user.address,
                    avatar: result.user.avatar,
                    ...(result.user.role === 'RESELLER' && {
                        commission: result.user.commission,
                        totalEarnings: result.user.totalEarnings,
                        referralCode: result.user.referralCode,
                        referredBy: result.user.referredBy,
                        downlineCount: result.user.downlineCount,
                    }),
                    createdAt: result.user.createdAt,
                    lastLoginAt: result.user.lastLoginAt,
                },
                refresh_token: result.refresh_token,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Login failed',
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async register(createUserDto) {
        try {
            const result = await this.authService.register(createUserDto);
            return {
                token: result.access_token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    role: result.user.role.toLowerCase(),
                    status: result.user.status?.toLowerCase(),
                    balance: result.user.balance || 0,
                    totalSpent: result.user.totalSpent || 0,
                    totalOrders: result.user.totalOrders || 0,
                    phone: result.user.phone,
                    address: result.user.address,
                    avatar: result.user.avatar,
                    createdAt: result.user.createdAt,
                    isVerified: result.user.isVerified,
                },
                refresh_token: result.refresh_token,
                message: 'Registration successful',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Registration failed',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async forgotPassword(body) {
        try {
            const result = await this.authService.forgotPassword(body.email);
            return {
                ...result,
                message: 'Password reset instructions sent to your email',
                success: true
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to process forgot password request',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async resetPassword(body) {
        try {
            const result = await this.authService.resetPassword(body.token, body.password);
            return {
                ...result,
                message: 'Password reset successful',
                success: true
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Password reset failed',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyOTP(body) {
        try {
            const result = await this.authService.verifyOTP(body.email, body.otp);
            return {
                ...result,
                message: 'OTP verification successful',
                success: true,
                isVerified: true,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'OTP verification failed',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getProfile(req) {
        try {
            return {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                role: req.user.role.toLowerCase(),
                status: req.user.status?.toLowerCase(),
                balance: req.user.balance,
                totalSpent: req.user.totalSpent,
                totalOrders: req.user.totalOrders,
                phone: req.user.phone,
                address: req.user.address,
                avatar: req.user.avatar,
                ...(req.user.role === 'RESELLER' && {
                    commission: req.user.commission,
                    totalEarnings: req.user.totalEarnings,
                    referralCode: req.user.referralCode,
                    referredBy: req.user.referredBy,
                    downlineCount: req.user.downlineCount,
                }),
                createdAt: req.user.createdAt,
                lastLoginAt: req.user.lastLoginAt,
                isVerified: req.user.isVerified,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Failed to get user profile',
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async refreshToken(body) {
        try {
            const result = await this.authService.refreshAccessToken(body.refresh_token);
            return {
                token: result.access_token,
                refresh_token: result.refresh_token,
                message: 'Token refreshed successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Token refresh failed',
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async logout(req) {
        try {
            await this.authService.logout(req.user.id);
            return {
                message: 'Logout successful',
                success: true,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Logout failed',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOTP", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map