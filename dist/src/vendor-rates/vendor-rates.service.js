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
exports.VendorRatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VendorRatesService = class VendorRatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateVendorRate(vendorName, vendorCurrency, region, newXCoinRate, updatedBy, reason) {
        const currentRate = await this.prisma.vendorExchangeRate.findUnique({
            where: { vendorName_region: { vendorName, region } }
        });
        const trend = currentRate ?
            (newXCoinRate > parseFloat(currentRate.xCoinRate.toString()) ? 'UP' :
                newXCoinRate < parseFloat(currentRate.xCoinRate.toString()) ? 'DOWN' : 'STABLE') : 'STABLE';
        const change24h = currentRate ?
            ((newXCoinRate - parseFloat(currentRate.xCoinRate.toString())) / parseFloat(currentRate.xCoinRate.toString())) * 100 : 0;
        let updatedRate;
        const oldRate = await this.prisma.vendorExchangeRate.findUnique({
            where: { vendorName_region: { vendorName, region } }
        });
        if (oldRate) {
            updatedRate = await this.prisma.vendorExchangeRate.update({
                where: { vendorName_region: { vendorName, region } },
                data: {
                    vendorCurrency,
                    xCoinRate: newXCoinRate,
                    trend: trend,
                    change24h: change24h,
                    updatedBy,
                    updateReason: reason
                }
            });
        }
        else {
            updatedRate = await this.prisma.vendorExchangeRate.create({
                data: {
                    vendorName,
                    vendorCurrency,
                    region,
                    xCoinRate: newXCoinRate,
                    trend: trend,
                    change24h: change24h,
                    updatedBy,
                    updateReason: reason
                }
            });
        }
        await this.updatePackagePrices(vendorName, vendorCurrency, region, oldRate ? oldRate.xCoinRate : updatedRate.xCoinRate);
        return updatedRate;
    }
    async updatePackagePrices(vendorName, vendorCurrency, region, oldRate) {
        const packages = await this.prisma.package.findMany({
            where: {
                vendor: vendorName,
                vendorCurrency: vendorCurrency,
                region: region,
                isPriceLocked: false
            }
        });
        const vendorRate = await this.prisma.vendorExchangeRate.findUnique({
            where: { vendorName_region: { vendorName, region } }
        });
        if (!vendorRate || vendorRate.xCoinRate === null)
            return;
        console.log(`Found ${packages.length} unlocked packages to update for vendor: ${vendorName}`);
        for (const pkg of packages) {
            console.log('Processing unlocked package:', pkg.name);
            console.log('Old rate:', oldRate, 'New rate:', vendorRate.xCoinRate);
            console.log('Base vendor cost:', pkg.baseVendorCost);
            console.log('Current package price:', pkg.price);
            console.log('Current vendor price:', pkg.vendorPrice);
            const expectedOldPrice = this.calculatePackagePrice(parseFloat(pkg.baseVendorCost.toString()), oldRate, parseFloat(pkg.markupPercent.toString()), parseFloat(pkg.roundToNearest.toString()), 0);
            const extraCoinPrice = parseFloat(pkg.price.toString()) - expectedOldPrice;
            console.log('Expected old price (without extra):', expectedOldPrice);
            console.log('Extra coins added to price:', extraCoinPrice);
            const newPrice = this.calculatePackagePrice(parseFloat(pkg.baseVendorCost.toString()), parseFloat(vendorRate.xCoinRate.toString()), parseFloat(pkg.markupPercent.toString()), parseFloat(pkg.roundToNearest.toString()), Math.max(0, extraCoinPrice));
            const expectedOldVendorPrice = this.calculateVendorPrice(parseFloat(pkg.baseVendorCost.toString()), oldRate, 0);
            const extraCoinVendorPrice = parseFloat(pkg.vendorPrice.toString()) - expectedOldVendorPrice;
            console.log('Expected old vendor price (without extra):', expectedOldVendorPrice);
            console.log('Extra coins added to vendor price:', extraCoinVendorPrice);
            const newVendorPrice = this.calculateVendorPrice(parseFloat(pkg.baseVendorCost.toString()), parseFloat(vendorRate.xCoinRate.toString()), Math.max(0, extraCoinVendorPrice));
            console.log('New calculated price:', newPrice);
            console.log('New calculated vendor price:', newVendorPrice);
            console.log('---');
            await this.prisma.package.update({
                where: { id: pkg.id },
                data: {
                    price: newPrice,
                    vendorPrice: newVendorPrice,
                    lockedPrice: newPrice,
                    lastPriceUpdate: new Date(),
                    priceVersion: pkg.priceVersion + 1
                }
            });
        }
        const lockedPackages = await this.prisma.package.count({
            where: {
                vendor: vendorName,
                vendorCurrency: vendorCurrency,
                isPriceLocked: true
            }
        });
        if (lockedPackages > 0) {
            console.log(`Skipped ${lockedPackages} locked packages for vendor: ${vendorName}`);
        }
    }
    calculatePackagePrice(baseVendorCost, vendorRate, markupPercent, roundToNearest, extraCoin) {
        console.log('Calculating price with:');
        console.log('- Base vendor cost:', baseVendorCost);
        console.log('- Vendor rate:', vendorRate);
        console.log('- Markup percent:', markupPercent);
        console.log('- Round to nearest:', roundToNearest);
        console.log('- Extra coin:', extraCoin);
        const basePrice = baseVendorCost * vendorRate;
        console.log('- Base price (cost * rate):', basePrice);
        const priceWithMarkup = basePrice * (1 + markupPercent / 100);
        console.log('- Price with markup:', priceWithMarkup);
        const roundedPrice = Math.ceil(priceWithMarkup / roundToNearest) * roundToNearest;
        console.log('- Rounded price:', roundedPrice);
        const finalPrice = roundedPrice + extraCoin;
        console.log('- Final price (with extra):', finalPrice);
        return Math.max(0, finalPrice);
    }
    calculateVendorPrice(baseVendorCost, vendorRate, extraCoin) {
        console.log('Calculating vendor price with:');
        console.log('- Base vendor cost:', baseVendorCost);
        console.log('- Vendor rate:', vendorRate);
        console.log('- Extra coin:', extraCoin);
        const baseVendorPrice = baseVendorCost * vendorRate;
        console.log('- Base vendor price (cost * rate):', baseVendorPrice);
        const finalVendorPrice = baseVendorPrice + extraCoin;
        console.log('- Final vendor price (with extra):', finalVendorPrice);
        return Math.max(0, finalVendorPrice);
    }
    async getVendorRates() {
        const rates = await this.prisma.vendorExchangeRate.findMany({
            where: { isActive: true },
            orderBy: [
                { vendorName: 'asc' },
                { vendorCurrency: 'asc' }
            ]
        });
        return rates.map(rate => ({
            ...rate,
            xCoinRate: parseFloat(rate.xCoinRate.toString()),
            change24h: parseFloat(rate.change24h.toString()),
            previousRate: rate.previousRate ? parseFloat(rate.previousRate.toString()) : null
        }));
    }
    async getVendorRateHistory(vendorName, vendorCurrency, region) {
        return this.prisma.vendorExchangeRate.findUnique({
            where: { vendorName_region: { vendorName, region } },
            select: {
                rateHistory: true,
                previousRate: true,
                xCoinRate: true,
                updatedAt: true
            }
        });
    }
};
exports.VendorRatesService = VendorRatesService;
exports.VendorRatesService = VendorRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorRatesService);
//# sourceMappingURL=vendor-rates.service.js.map