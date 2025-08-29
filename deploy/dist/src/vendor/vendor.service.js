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
var VendorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
let VendorService = VendorService_1 = class VendorService {
    prisma;
    logger = new common_1.Logger(VendorService_1.name);
    vendorConfigs = {
        'SMILE_COIN': {
            baseUrl: process.env.SMILE_COIN_API_URL || 'https://api.smilecoin.dummy/v1',
            apiKey: process.env.SMILE_COIN_API_KEY || 'dummy_smile_api_key',
            timeout: parseInt(process.env.SMILE_COIN_TIMEOUT || '30000'),
        },
        'RAZOR_GOLD': {
            baseUrl: process.env.RAZOR_GOLD_API_URL || 'https://api.razorgold.dummy/v1',
            apiKey: process.env.RAZOR_GOLD_API_KEY || 'dummy_razor_api_key',
            timeout: parseInt(process.env.RAZOR_GOLD_TIMEOUT || '30000'),
        },
    };
    retryConfig = {
        maxRetries: parseInt(process.env.VENDOR_MAX_RETRIES || '3'),
        initialDelay: parseInt(process.env.VENDOR_INITIAL_RETRY_DELAY || '5000'),
        backoffMultiplier: parseFloat(process.env.VENDOR_BACKOFF_MULTIPLIER || '2'),
        maxDelay: parseInt(process.env.VENDOR_MAX_RETRY_DELAY || '60000'),
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processVendorCall(orderId, vendorName, vendorPackageCode, playerId, serverId) {
        const vendorCall = await this.prisma.vendorCall.create({
            data: {
                orderId,
                vendorName,
                vendorPackageCode,
                status: 'PENDING',
                maxRetries: this.retryConfig.maxRetries,
                retryIntervalMs: this.retryConfig.initialDelay,
                requestPayload: {
                    playerId,
                    serverId,
                    packageCode: vendorPackageCode,
                    timestamp: new Date().toISOString(),
                },
            },
        });
        return this.attemptVendorCall(vendorCall.id, playerId, serverId);
    }
    async attemptVendorCall(vendorCallId, playerId, serverId) {
        const vendorCall = await this.prisma.vendorCall.findUnique({
            where: { id: vendorCallId },
        });
        if (!vendorCall) {
            throw new Error(`VendorCall ${vendorCallId} not found`);
        }
        const startTime = Date.now();
        try {
            await this.prisma.vendorCall.update({
                where: { id: vendorCallId },
                data: {
                    retryCount: { increment: 1 },
                    lastAttemptAt: new Date(),
                    status: 'PENDING',
                },
            });
            const result = await this.makeVendorApiCall(vendorCall.vendorName, vendorCall.vendorPackageCode, playerId, serverId);
            const responseTime = Date.now() - startTime;
            if (result.success) {
                await this.prisma.vendorCall.update({
                    where: { id: vendorCallId },
                    data: {
                        status: 'COMPLETED',
                        vendorOrderId: result.vendorOrderId,
                        vendorResponse: result.vendorResponse,
                        responseTime,
                        nextRetryAt: null,
                    },
                });
                this.logger.log(`✅ Vendor call successful: ${vendorCall.vendorName} - ${vendorCall.vendorPackageCode} - Order: ${result.vendorOrderId}`);
                return result;
            }
            else {
                const shouldRetry = this.shouldRetryCall(vendorCall, result);
                if (shouldRetry && vendorCall.retryCount < vendorCall.maxRetries) {
                    const nextRetryDelay = this.calculateRetryDelay(vendorCall.retryCount);
                    const nextRetryAt = new Date(Date.now() + nextRetryDelay);
                    await this.prisma.vendorCall.update({
                        where: { id: vendorCallId },
                        data: {
                            status: 'PENDING',
                            errorMessage: result.error,
                            vendorResponse: result.vendorResponse,
                            responseTime,
                            nextRetryAt,
                            retryIntervalMs: nextRetryDelay,
                        },
                    });
                    this.logger.warn(`⏳ Scheduling retry ${vendorCall.retryCount + 1}/${vendorCall.maxRetries} for ${vendorCall.vendorName} in ${nextRetryDelay}ms`);
                    setTimeout(() => {
                        this.attemptVendorCall(vendorCallId, playerId, serverId);
                    }, nextRetryDelay);
                    return {
                        success: false,
                        error: `Retrying... (${vendorCall.retryCount}/${vendorCall.maxRetries})`,
                        vendorResponse: result.vendorResponse,
                        shouldRetry: true,
                    };
                }
                else {
                    await this.prisma.vendorCall.update({
                        where: { id: vendorCallId },
                        data: {
                            status: 'FAILED',
                            errorMessage: result.error,
                            vendorResponse: result.vendorResponse,
                            responseTime,
                            nextRetryAt: null,
                        },
                    });
                    this.logger.error(`❌ Vendor call failed permanently: ${vendorCall.vendorName} - ${result.error}`);
                    return result;
                }
            }
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.prisma.vendorCall.update({
                where: { id: vendorCallId },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                    responseTime,
                    vendorResponse: {
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
            this.logger.error(`💥 Vendor call exception: ${error.message}`);
            return {
                success: false,
                error: error.message,
                vendorResponse: { error: error.message },
                shouldRetry: false,
            };
        }
    }
    async makeVendorApiCall(vendorName, packageCode, playerId, serverId) {
        const config = this.vendorConfigs[vendorName];
        if (!config) {
            return {
                success: false,
                error: `Unknown vendor: ${vendorName}`,
                vendorResponse: { error: 'Vendor not configured' },
                shouldRetry: false,
            };
        }
        switch (vendorName) {
            case 'SMILE_COIN':
                return this.callSmileCoinApi(config, packageCode, playerId, serverId);
            case 'RAZOR_GOLD':
                return this.callRazorGoldApi(config, packageCode, playerId, serverId);
            default:
                return {
                    success: false,
                    error: `Unsupported vendor: ${vendorName}`,
                    vendorResponse: { error: 'Vendor not implemented' },
                    shouldRetry: false,
                };
        }
    }
    async callSmileCoinApi(config, packageCode, playerId, serverId) {
        try {
            const request = {
                playerId,
                packageCode,
                serverId,
                quantity: 1,
            };
            const response = await axios_1.default.post(`${config.baseUrl}/packages/purchase`, request, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: config.timeout,
            });
            const data = response.data;
            if (data.success) {
                return {
                    success: true,
                    vendorOrderId: data.orderId || data.transactionId,
                    vendorResponse: data,
                    shouldRetry: false,
                };
            }
            else {
                const shouldRetry = this.isRetryableSmileCoinError(data.errorCode);
                return {
                    success: false,
                    error: data.message || 'Smile Coin API error',
                    vendorResponse: data,
                    shouldRetry,
                };
            }
        }
        catch (error) {
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Request timeout',
                    vendorResponse: { error: 'timeout', code: error.code },
                    shouldRetry: true,
                };
            }
            if (error.response?.status >= 500) {
                return {
                    success: false,
                    error: `Server error: ${error.response?.status}`,
                    vendorResponse: error.response?.data || { error: 'server_error' },
                    shouldRetry: true,
                };
            }
            return {
                success: false,
                error: error.message,
                vendorResponse: error.response?.data || { error: error.message },
                shouldRetry: false,
            };
        }
    }
    async callRazorGoldApi(config, packageCode, playerId, serverId) {
        try {
            const request = {
                player_id: playerId,
                package_code: packageCode,
                server_id: serverId,
            };
            const response = await axios_1.default.post(`${config.baseUrl}/topup`, request, {
                headers: {
                    'X-API-Key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: config.timeout,
            });
            const data = response.data;
            if (data.status === 'success') {
                return {
                    success: true,
                    vendorOrderId: data.transaction_id,
                    vendorResponse: data,
                    shouldRetry: false,
                };
            }
            else {
                return {
                    success: false,
                    error: data.message || 'Razor Gold API error',
                    vendorResponse: data,
                    shouldRetry: data.error_code !== 'INVALID_PLAYER_ID',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                vendorResponse: error.response?.data || { error: error.message },
                shouldRetry: error.response?.status >= 500 || error.code === 'ECONNABORTED',
            };
        }
    }
    isRetryableSmileCoinError(errorCode) {
        const nonRetryableErrors = [
            'INVALID_PLAYER_ID',
            'INVALID_PACKAGE_CODE',
            'INSUFFICIENT_BALANCE',
            'PLAYER_NOT_FOUND',
            'PACKAGE_NOT_AVAILABLE',
        ];
        return !errorCode || !nonRetryableErrors.includes(errorCode);
    }
    shouldRetryCall(vendorCall, result) {
        if (!result.shouldRetry)
            return false;
        if (vendorCall.retryCount >= vendorCall.maxRetries)
            return false;
        return true;
    }
    calculateRetryDelay(retryCount) {
        const delay = this.retryConfig.initialDelay *
            Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        return Math.min(delay, this.retryConfig.maxDelay);
    }
    async getPendingRetries() {
        return this.prisma.vendorCall.findMany({
            where: {
                status: 'PENDING',
                nextRetryAt: {
                    lte: new Date(),
                },
                retryCount: {
                    lt: this.prisma.vendorCall.fields.maxRetries,
                },
            },
            include: {
                order: true,
            },
        });
    }
    async processPendingRetries() {
        const pendingRetries = await this.getPendingRetries();
        this.logger.log(`Processing ${pendingRetries.length} pending retries`);
        for (const vendorCall of pendingRetries) {
            const { playerId, serverId } = vendorCall.requestPayload;
            this.attemptVendorCall(vendorCall.id, playerId, serverId)
                .catch(error => {
                this.logger.error(`Error processing retry ${vendorCall.id}: ${error.message}`);
            });
        }
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = VendorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map