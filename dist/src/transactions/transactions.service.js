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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const packages_service_1 = require("../packages/packages.service");
const vendor_service_1 = require("../vendor/vendor.service");
let TransactionsService = class TransactionsService {
    prisma;
    packagesService;
    vendorService;
    constructor(prisma, packagesService, vendorService) {
        this.prisma = prisma;
        this.packagesService = packagesService;
        this.vendorService = vendorService;
    }
    async findAll(filters = {}) {
        try {
            const { type, status, userRole, search, dateFrom, dateTo, skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc', } = filters;
            const where = {};
            if (type) {
                where.type = type;
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    {
                        gameUserId: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        playerName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        notes: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) {
                    where.createdAt.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    where.createdAt.lte = new Date(dateTo);
                }
            }
            const orderBy = {};
            if (sortBy === 'createdAt') {
                orderBy.createdAt = sortOrder;
            }
            else if (sortBy === 'updatedAt') {
                orderBy.updatedAt = sortOrder;
            }
            else if (sortBy === 'totalCost') {
                orderBy.totalCost = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [transactions, total] = await Promise.all([
                this.prisma.transaction.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                }),
                this.prisma.transaction.count({ where }),
            ]);
            return {
                transactions,
                total,
                hasMore: skip + take < total,
            };
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            throw new common_1.BadRequestException('Failed to fetch transactions');
        }
    }
    async getTransactionStats() {
        try {
            const [totalTransactions, completedTransactions, failedTransactions, processingTransactions, totalRevenue, todayTransactions,] = await Promise.all([
                this.prisma.transaction.count(),
                this.prisma.transaction.count({ where: { status: 'COMPLETED' } }),
                this.prisma.transaction.count({ where: { status: 'FAILED' } }),
                this.prisma.transaction.count({ where: { status: 'PROCESSING' } }),
                this.prisma.transaction.aggregate({
                    where: { status: 'COMPLETED' },
                    _sum: { totalCost: true },
                }),
                this.prisma.transaction.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
            ]);
            return {
                totalTransactions,
                completedTransactions,
                failedTransactions,
                processingTransactions,
                totalRevenue: totalRevenue._sum.totalCost || 0,
                todayTransactions,
                successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
            };
        }
        catch (error) {
            console.error('Error fetching transaction stats:', error);
            throw new common_1.BadRequestException('Failed to fetch transaction statistics');
        }
    }
    async updateTransactionStatus(id, status, adminNotes) {
        try {
            const transaction = await this.prisma.transaction.findUnique({
                where: { id },
            });
            if (!transaction) {
                throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
            }
            const updatedTransaction = await this.prisma.transaction.update({
                where: { id },
                data: {
                    status: status,
                    notes: adminNotes || transaction.notes,
                    updatedAt: new Date(),
                },
            });
            return updatedTransaction;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error updating transaction status:', error);
            throw new common_1.BadRequestException('Failed to update transaction status');
        }
    }
    async processBulkOrder(bulkOrderData) {
        try {
            console.log('Processing bulk order:', bulkOrderData);
            const validationResults = await this.packagesService.validateBulkOrderPackages(bulkOrderData.orders);
            const totalCost = validationResults.reduce((sum, result) => sum + result.totalCost, 0);
            const user = await this.prisma.user.findUnique({
                where: { id: bulkOrderData.placedBy },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (parseFloat(user.balance.toString()) < totalCost) {
                throw new common_1.BadRequestException(`Insufficient balance. Required: ${totalCost}, Available: ${user.balance}`);
            }
            const results = [];
            let successfulOrders = 0;
            let failedOrders = 0;
            let partialSuccessOrders = 0;
            let actualTotalCost = 0;
            for (const validationResult of validationResults) {
                const userResult = await this.processUserOrder(validationResult, bulkOrderData.placedBy, user.role);
                results.push(userResult);
                const successfulPackagesCost = userResult.packages
                    .filter(pkg => pkg.success)
                    .reduce((sum, pkg) => sum + pkg.price, 0);
                actualTotalCost += successfulPackagesCost;
                if (userResult.success) {
                    successfulOrders++;
                }
                else if (userResult.packages.some(pkg => pkg.success)) {
                    partialSuccessOrders++;
                }
                else {
                    failedOrders++;
                }
            }
            if (actualTotalCost > 0) {
                await this.prisma.user.update({
                    where: { id: bulkOrderData.placedBy },
                    data: {
                        balance: { decrement: actualTotalCost },
                        totalSpent: { increment: actualTotalCost },
                        totalOrders: { increment: successfulOrders + partialSuccessOrders },
                    },
                });
            }
            return {
                success: true,
                results,
                summary: {
                    totalOrders: results.length,
                    successfulOrders,
                    failedOrders,
                    partialSuccessOrders,
                    totalCost: actualTotalCost,
                },
                message: `Bulk order processed: ${successfulOrders} successful, ${failedOrders} failed, ${partialSuccessOrders} partial`,
            };
        }
        catch (error) {
            console.error('Error processing bulk order:', error);
            throw new common_1.BadRequestException(`Failed to process bulk order: ${error.message}`);
        }
    }
    async processUserOrder(validationResult, placedBy, userRole) {
        try {
            const { playerId, identifier, gameName, foundPackages, notFoundCodes, totalCost } = validationResult;
            if (foundPackages.length === 0) {
                return {
                    playerId,
                    identifier,
                    gameName,
                    success: false,
                    packages: notFoundCodes.map(code => ({
                        packageCode: code,
                        packageName: 'Unknown',
                        price: 0,
                        success: false,
                        error: 'Package not found',
                    })),
                    totalCost: 0,
                    error: 'No valid packages found',
                };
            }
            const transaction = await this.prisma.transaction.create({
                data: {
                    userId: placedBy,
                    type: userRole === 'RESELLER' ? 'RESELLER_BULK_PURCHASE' : 'RETAILER_PACKAGE_PURCHASE',
                    status: 'PROCESSING',
                    gameUserId: playerId,
                    serverId: identifier,
                    playerName: `Player_${playerId}`,
                    region: foundPackages[0]?.region || 'Unknown',
                    quantity: foundPackages.length,
                    notes: `Bulk order for ${gameName}`,
                },
            });
            const packageResults = [];
            let hasFailures = false;
            let successfulPackagesCost = 0;
            for (const pkg of foundPackages) {
                try {
                    const order = await this.prisma.order.create({
                        data: {
                            transactionId: transaction.id,
                            gameUserId: playerId,
                            serverId: identifier,
                            playerName: `Player_${playerId}`,
                            packageKeywords: pkg.vendorPackageCode,
                            status: 'PENDING',
                            totalAmount: pkg.price,
                        },
                    });
                    const packageResult = await this.processPackage(pkg, playerId, identifier, order.id);
                    packageResults.push({
                        packageCode: pkg.vendorPackageCode,
                        packageName: pkg.name,
                        price: pkg.price,
                        success: packageResult.success,
                        error: packageResult.error,
                    });
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: packageResult.success ? 'COMPLETED' : 'FAILED',
                        },
                    });
                    if (packageResult.success) {
                        successfulPackagesCost += pkg.price;
                    }
                    else {
                        hasFailures = true;
                    }
                }
                catch (error) {
                    console.error(`Error processing package ${pkg.vendorPackageCode}:`, error);
                    packageResults.push({
                        packageCode: pkg.vendorPackageCode,
                        packageName: pkg.name,
                        price: pkg.price,
                        success: false,
                        error: error.message,
                    });
                    hasFailures = true;
                }
            }
            notFoundCodes.forEach(code => {
                packageResults.push({
                    packageCode: code,
                    packageName: 'Unknown',
                    price: 0,
                    success: false,
                    error: 'Package not found',
                });
                hasFailures = true;
            });
            const finalStatus = hasFailures ?
                (packageResults.some(pkg => pkg.success) ? 'COMPLETED' : 'FAILED') :
                'COMPLETED';
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: finalStatus,
                    totalCost: successfulPackagesCost,
                },
            });
            return {
                playerId,
                identifier,
                gameName,
                success: !hasFailures,
                packages: packageResults,
                totalCost: successfulPackagesCost,
                transactionId: transaction.id,
            };
        }
        catch (error) {
            console.error('Error processing user order:', error);
            return {
                playerId: validationResult.playerId,
                identifier: validationResult.identifier,
                gameName: validationResult.gameName,
                success: false,
                packages: [],
                totalCost: 0,
                error: error.message,
            };
        }
    }
    async processPackage(pkg, playerId, identifier, orderId) {
        try {
            const results = [];
            const packageVendorCodes = pkg.vendorPackageCode.split(',').map((code) => code.trim());
            try {
                console.log(`🔄 Processing package ${pkg.vendorPackageCode} for player ${playerId}...`);
                for (let i = 0; i < packageVendorCodes.length; i++) {
                    const vendorResult = await this.vendorService.processVendorCall(orderId, pkg.vendor, packageVendorCodes[i], playerId, identifier);
                    if (vendorResult.success) {
                        console.log(`✅ Package ${packageVendorCodes[i]} processed successfully for player ${playerId}`);
                        results.push({
                            success: true,
                            packageCode: packageVendorCodes[i],
                            vendorOrderId: vendorResult.vendorOrderId
                        });
                    }
                    else {
                        console.log(`❌ Package ${packageVendorCodes[i]} failed for player ${playerId}: ${vendorResult.error}`);
                        results.push({
                            success: false,
                            packageCode: packageVendorCodes[i],
                            error: vendorResult.error || 'Vendor API call failed'
                        });
                    }
                }
            }
            catch (packageError) {
                console.error(`💥 Error processing package ${pkg.vendorPackageCode}:`, packageError);
                results.push({
                    success: false,
                    packageCode: pkg.vendorPackageCode,
                    error: packageError.message
                });
            }
            const successfulPackages = results.filter(r => r.success);
            const failedPackages = results.filter(r => !r.success);
            if (successfulPackages.length === packageVendorCodes.length) {
                return { success: true };
            }
            else if (successfulPackages.length > 0) {
                return {
                    success: false,
                    error: `Partial success: ${successfulPackages.length}/${packageVendorCodes.length} packages processed. Failed: ${failedPackages.map(f => f.packageCode).join(', ')}`
                };
            }
            else {
                return {
                    success: false,
                    error: `All packages failed: ${failedPackages.map(f => f.error).join(', ')}`
                };
            }
        }
        catch (error) {
            console.error('Package processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async createOrder(orderData) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: orderData.userId },
                include: {
                    smileCoinBalances: true
                }
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const packageIds = orderData.packageId.split(',').map(id => id.trim());
            const uniquePackageIds = [...new Set(packageIds)];
            const uniquePackages = await this.prisma.package.findMany({
                where: {
                    id: {
                        in: uniquePackageIds,
                    },
                    gameName: orderData.gameName,
                },
                include: {
                    vendorRate: true,
                }
            });
            if (!uniquePackages || uniquePackages.length === 0) {
                throw new common_1.NotFoundException(`Package not found`);
            }
            const pkg = packageIds.map(id => {
                const foundPackage = uniquePackages.find(p => p.id === id);
                if (!foundPackage) {
                    throw new common_1.NotFoundException(`Package with ID ${id} not found`);
                }
                return foundPackage;
            });
            const { xCoinCost: totalPrice, smileCoinCost, hasSmilePackages } = await this.packagesService.calculateMixedVendorCosts(pkg, user.role);
            if (hasSmilePackages) {
                for (const pkgItem of pkg) {
                    if (pkgItem.vendor.toLowerCase() === 'smile') {
                        const region = pkgItem.region;
                        if (!region) {
                            throw new common_1.BadRequestException('Region not found for Smile package');
                        }
                        const selectedRegionalBalance = user.smileCoinBalances.find(bal => bal.region === region);
                        const packagePrice = this.packagesService.getPackagePrice(pkgItem, user.role);
                        if (selectedRegionalBalance) {
                            if (parseFloat(selectedRegionalBalance.balance.toString()) < packagePrice) {
                                throw new common_1.BadRequestException(`insufficient Smile Coin`);
                            }
                        }
                        else {
                            throw new common_1.BadRequestException(`insufficient Smile Coin`);
                        }
                    }
                }
            }
            if (totalPrice > 0) {
                if (parseFloat(user.balance.toString()) < totalPrice) {
                    throw new common_1.BadRequestException(`Insufficient xCoin balance. Required: ${totalPrice}, Available: ${user.balance}`);
                }
            }
            const combinedCost = totalPrice + smileCoinCost;
            const transaction = await this.prisma.transaction.create({
                data: {
                    userId: orderData.userId,
                    type: user.role === 'RESELLER' ? 'RESELLER_BULK_PURCHASE' : 'RETAILER_PACKAGE_PURCHASE',
                    status: 'PROCESSING',
                    gameUserId: orderData.playerDetails.playerId,
                    serverId: orderData.playerDetails.identifier,
                    playerName: `Player_${orderData.playerDetails.playerId}`,
                    region: pkg[0]?.region,
                    totalCost: combinedCost,
                    quantity: pkg.length,
                    specialPricing: hasSmilePackages,
                    priceType: hasSmilePackages ? 'BASE_VENDOR_COST' : 'VENDOR_PRICE',
                },
            });
            for (const pkgItem of pkg) {
                const packagePrice = this.packagesService.getPackagePrice(pkgItem, user.role);
                const isSpecial = await this.packagesService.isSpecialPricing(pkgItem, user.role);
                await this.prisma.transactionPackage.create({
                    data: {
                        transactionId: transaction.id,
                        packageId: pkgItem.id,
                        quantity: 1,
                        unitPrice: packagePrice,
                        totalPrice: packagePrice,
                        basePrice: parseFloat(pkgItem.price.toString()),
                        markupApplied: isSpecial ? 0 : (parseFloat(pkgItem.price.toString()) - parseFloat(pkgItem.baseVendorCost.toString())),
                        markupType: isSpecial ? 'BASE_VENDOR_COST' : 'VENDOR_PRICE',
                    },
                });
            }
            const order = await this.prisma.order.create({
                data: {
                    transactionId: transaction.id,
                    gameUserId: orderData.playerId,
                    serverId: orderData.identifier,
                    playerName: `Player_${orderData.playerId}`,
                    packageKeywords: pkg.map(p => p.vendorPackageCode).join(','),
                    status: 'PENDING',
                    totalAmount: combinedCost,
                },
            });
            let overallResult = { success: true };
            for (const singlePackage of pkg) {
                const packageResult = await this.processPackage(singlePackage, orderData.playerId, orderData.identifier, order.id);
                if (!packageResult.success) {
                    overallResult = { success: false, error: packageResult.error || 'Package processing failed' };
                    break;
                }
            }
            const result = overallResult;
            const finalStatus = result.success ? 'COMPLETED' : 'FAILED';
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: finalStatus },
            });
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: finalStatus },
            });
            if (result.success) {
                const updateData = {
                    totalOrders: { increment: 1 },
                };
                if (totalPrice > 0) {
                    updateData.balance = { decrement: totalPrice };
                    updateData.totalSpent = { increment: totalPrice };
                }
                if (smileCoinCost > 0) {
                    const region = pkg[0]?.region;
                    if (region) {
                        const selectedRegionalBalance = user.smileCoinBalances.find(bal => bal.region === region);
                        if (selectedRegionalBalance) {
                            updateData.smileCoinBalances = {
                                update: {
                                    where: {
                                        userId_region: {
                                            userId: orderData.userId,
                                            region: region,
                                        },
                                    },
                                    data: {
                                        balance: { decrement: smileCoinCost },
                                    },
                                },
                            };
                        }
                    }
                    updateData.totalSpent = { increment: updateData.totalSpent ? updateData.totalSpent.increment + smileCoinCost : smileCoinCost };
                }
                await this.prisma.user.update({
                    where: { id: orderData.userId },
                    data: updateData,
                });
            }
            return {
                success: result.success,
                order: {
                    id: order.id,
                    status: finalStatus,
                    amount: combinedCost,
                    packageName: pkg.map(p => p.name).join(', '),
                    playerId: orderData.playerId,
                    createdAt: order.createdAt,
                },
                orderId: order.id,
                message: result.success ? 'Order processed successfully' : `Order failed: ${result.error}`,
            };
        }
        catch (error) {
            console.error('Error creating order:', error);
            throw new common_1.BadRequestException(`Failed to create order: ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const packageData = await this.prisma.package.findUnique({
                where: { id },
            });
            if (!packageData) {
                throw new common_1.NotFoundException(`Package with ID ${id} not found`);
            }
            return [packageData];
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error fetching package:', error);
            throw new common_1.BadRequestException('Failed to fetch package');
        }
    }
    async createTransaction(userId, packageId, quantity = 1) {
        const packageData = await this.prisma.package.findUnique({
            where: { id: packageId },
            include: {
                vendorRate: true,
            }
        });
        if (!packageData || !packageData.lockedPrice) {
            throw new Error('Package not found or price not set');
        }
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                type: 'RESELLER_BULK_PURCHASE',
                quantity,
                packagePriceAtPurchase: packageData.lockedPrice,
                packagePriceVersion: packageData.priceVersion,
                vendorRateAtPurchase: packageData.vendorRate?.[0]?.xCoinRate,
                exchangeRateSnapshot: {
                    packagePrice: packageData.lockedPrice,
                    vendorRate: packageData.vendorRate?.[0]?.xCoinRate,
                    timestamp: new Date().toISOString()
                },
                totalCost: parseFloat(packageData.lockedPrice.toString()) * quantity,
                status: 'PENDING'
            }
        });
        return transaction;
    }
    async getSmileCoinBalanceByRegion(userId, region) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    smileCoinBalances: true,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const smileCoinBalance = user.smileCoinBalances?.find(balance => balance.region === region);
            return smileCoinBalance ? parseFloat(smileCoinBalance.balance.toString()) : 0;
        }
        catch (error) {
            console.error('Error fetching smile coin balance for region:', error);
            return 0;
        }
    }
    async getXCoinTransactions(params) {
        try {
            const { userId, skip, take, sortBy, sortOrder } = params;
            const orderBy = {};
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                orderBy[sortBy] = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [transactions, total] = await Promise.all([
                this.prisma.xCoinTransaction.findMany({
                    where: {
                        userId: userId,
                    },
                    orderBy,
                    skip,
                    take,
                }),
                this.prisma.xCoinTransaction.count({
                    where: {
                        userId: userId,
                    },
                }),
            ]);
            return {
                transactions,
                total,
                hasMore: skip + take < total,
            };
        }
        catch (error) {
            console.error('Error fetching XCoin transactions:', error);
            throw new common_1.BadRequestException('Failed to fetch XCoin transactions');
        }
    }
    async getPackageTransactions(params) {
        try {
            const { userId, skip, take, sortBy, sortOrder } = params;
            const orderBy = {};
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                orderBy[sortBy] = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [transactions, total] = await Promise.all([
                this.prisma.transaction.findMany({
                    where: {
                        userId: userId,
                    },
                    orderBy,
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            },
                        },
                        transactionPackages: {
                            include: {
                                package: true,
                            },
                        },
                    },
                }),
                this.prisma.transaction.count({
                    where: {
                        userId: userId,
                    },
                }),
            ]);
            return {
                transactions,
                total,
                hasMore: skip + take < total,
            };
        }
        catch (error) {
            console.error('Error fetching package transactions:', error);
            throw new common_1.BadRequestException('Failed to fetch package transactions');
        }
    }
    async getXCoinTransactionById(id) {
        try {
            const transaction = await this.prisma.xCoinTransaction.findUnique({
                where: { id },
            });
            return transaction;
        }
        catch (error) {
            console.error('Error fetching single XCoin transaction:', error);
            throw new common_1.BadRequestException('Failed to fetch XCoin transaction');
        }
    }
    async getSmileCoinTransactions(params) {
        try {
            const { userId, skip, take, sortBy, sortOrder } = params;
            const orderBy = {};
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                orderBy[sortBy] = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [transactions, total] = await Promise.all([
                this.prisma.transaction.findMany({
                    where: {
                        userId: userId,
                        specialPricing: true,
                    },
                    orderBy,
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            },
                        },
                        transactionPackages: {
                            include: {
                                package: true,
                            },
                        },
                    },
                }),
                this.prisma.transaction.count({
                    where: {
                        userId: userId,
                        specialPricing: true,
                    },
                }),
            ]);
            return {
                transactions,
                total,
                hasMore: skip + take < total,
            };
        }
        catch (error) {
            console.error('Error fetching Smile coin transactions:', error);
            throw new common_1.BadRequestException('Failed to fetch Smile coin transactions');
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        packages_service_1.PackagesService,
        vendor_service_1.VendorService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map