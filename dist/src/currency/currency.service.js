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
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CurrencyService = class CurrencyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrencyStats() {
        try {
            const [totalXCoinsInCirculation, totalXCoinsPurchased24h, totalXCoinsSpent24h, totalRevenue24h, averageExchangeRate, activeUsers24h] = await Promise.all([
                this.prisma.user.aggregate({
                    _sum: { balance: true }
                }),
                this.prisma.xCoinTransaction.aggregate({
                    where: {
                        type: 'PURCHASE',
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    },
                    _sum: { amount: true }
                }),
                this.prisma.xCoinTransaction.aggregate({
                    where: {
                        type: 'SPEND',
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    },
                    _sum: { amount: true }
                }),
                this.prisma.transaction.aggregate({
                    where: {
                        status: 'COMPLETED',
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    },
                    _sum: { totalCost: true }
                }),
                this.prisma.exchangeRate.findFirst({
                    where: {
                        fromCurrency: 'USD',
                        toCurrency: 'XCN'
                    }
                }),
                this.prisma.user.count({
                    where: {
                        lastLoginAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);
            return {
                totalXCoinsInCirculation: totalXCoinsInCirculation._sum.balance || 0,
                totalXCoinsPurchased24h: totalXCoinsPurchased24h._sum.amount || 0,
                totalXCoinsSpent24h: Math.abs(parseFloat(totalXCoinsSpent24h._sum.amount?.toString() || '0')),
                totalRevenue24h: totalRevenue24h._sum.totalCost || 0,
                averageExchangeRate: averageExchangeRate?.rate || 100,
                activeUsers24h
            };
        }
        catch (error) {
            console.error('Error fetching currency stats:', error);
            throw new common_1.BadRequestException('Failed to fetch currency stats');
        }
    }
    async getExchangeRates() {
        try {
            const rates = await this.prisma.exchangeRate.findMany({
                include: {
                    fromCurrencyRef: true,
                    toCurrencyRef: true
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            return rates.map(rate => ({
                id: rate.id,
                fromCurrency: rate.fromCurrency,
                toCurrency: rate.toCurrency,
                rate: rate.rate,
                trend: rate.trend.toLowerCase(),
                change24h: rate.change24h,
                lastUpdated: rate.updatedAt.toISOString(),
                fromCurrencyName: rate.fromCurrencyRef.name,
                toCurrencyName: rate.toCurrencyRef.name
            }));
        }
        catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw new common_1.BadRequestException('Failed to fetch exchange rates');
        }
    }
    async updateExchangeRate(fromCurrency, toCurrency, newRate) {
        try {
            const existingRate = await this.prisma.exchangeRate.findUnique({
                where: {
                    fromCurrency_toCurrency: {
                        fromCurrency,
                        toCurrency
                    }
                }
            });
            if (!existingRate) {
                throw new common_1.NotFoundException(`Exchange rate from ${fromCurrency} to ${toCurrency} not found`);
            }
            const oldRate = existingRate.rate;
            const change24h = ((newRate - parseFloat(oldRate.toString())) / parseFloat(oldRate.toString())) * 100;
            let trend = 'STABLE';
            if (change24h > 0.1)
                trend = 'UP';
            else if (change24h < -0.1)
                trend = 'DOWN';
            const updatedRate = await this.prisma.exchangeRate.update({
                where: {
                    fromCurrency_toCurrency: {
                        fromCurrency,
                        toCurrency
                    }
                },
                data: {
                    rate: newRate,
                    trend,
                    change24h
                },
                include: {
                    fromCurrencyRef: true,
                    toCurrencyRef: true
                }
            });
            return {
                id: updatedRate.id,
                fromCurrency: updatedRate.fromCurrency,
                toCurrency: updatedRate.toCurrency,
                rate: updatedRate.rate,
                trend: updatedRate.trend.toLowerCase(),
                change24h: updatedRate.change24h,
                lastUpdated: updatedRate.updatedAt.toISOString(),
                fromCurrencyName: updatedRate.fromCurrencyRef.name,
                toCurrencyName: updatedRate.toCurrencyRef.name
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error updating exchange rate:', error);
            throw new common_1.BadRequestException('Failed to update exchange rate');
        }
    }
    async getCurrencies() {
        try {
            const currencies = await this.prisma.currency.findMany({
                where: { isActive: true },
                orderBy: { code: 'asc' }
            });
            return currencies;
        }
        catch (error) {
            console.error('Error fetching currencies:', error);
            throw new common_1.BadRequestException('Failed to fetch currencies');
        }
    }
    async createExchangeRate(fromCurrency, toCurrency, rate) {
        try {
            const [fromCurrencyExists, toCurrencyExists] = await Promise.all([
                this.prisma.currency.findUnique({ where: { code: fromCurrency } }),
                this.prisma.currency.findUnique({ where: { code: toCurrency } })
            ]);
            if (!fromCurrencyExists || !toCurrencyExists) {
                throw new common_1.BadRequestException('One or both currencies do not exist');
            }
            const exchangeRate = await this.prisma.exchangeRate.create({
                data: {
                    fromCurrency,
                    toCurrency,
                    rate,
                    trend: 'STABLE',
                    change24h: 0
                },
                include: {
                    fromCurrencyRef: true,
                    toCurrencyRef: true
                }
            });
            return {
                id: exchangeRate.id,
                fromCurrency: exchangeRate.fromCurrency,
                toCurrency: exchangeRate.toCurrency,
                rate: exchangeRate.rate,
                trend: exchangeRate.trend.toLowerCase(),
                change24h: exchangeRate.change24h,
                lastUpdated: exchangeRate.updatedAt.toISOString(),
                fromCurrencyName: exchangeRate.fromCurrencyRef.name,
                toCurrencyName: exchangeRate.toCurrencyRef.name
            };
        }
        catch (error) {
            console.error('Error creating exchange rate:', error);
            throw new common_1.BadRequestException('Failed to create exchange rate');
        }
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map