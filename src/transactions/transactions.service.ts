import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackagesService } from '../packages/packages.service';
import { VendorService } from '../vendor/vendor.service';
import { Package } from '@prisma/client';

interface BulkOrderData {
  orders: Array<{
    playerId: string;
    identifier: string;
    packageCodes: string[];
    gameName: string;
  }>;
  placedBy: string; // User ID who is placing the bulk order
}

interface UserOrderResult {
  playerId: string;
  identifier: string;
  gameName: string;
  success: boolean;
  packages: Array<{
    packageCode: string;
    packageName: string;
    price: number;
    success: boolean;
    error?: string;
  }>;
  totalCost: number;
  transactionId?: string;
  orderId?: string;
  error?: string;
}

interface BulkOrderResponse {
  success: boolean;
  results: UserOrderResult[];
  summary: {
    totalOrders: number;
    successfulOrders: number;
    failedOrders: number;
    totalCost: number;
    partialSuccessOrders: number;
  };
  message: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private packagesService: PackagesService,
    private vendorService: VendorService,
  ) { }

  // EXISTING: Find all transactions with filters
  async findAll(filters: {
    type?: string;
    status?: string;
    userRole?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        type,
        status,
        userRole,
        search,
        dateFrom,
        dateTo,
        skip = 0,
        take = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where clause
      const where: any = {};

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

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === 'createdAt') {
        orderBy.createdAt = sortOrder;
      } else if (sortBy === 'updatedAt') {
        orderBy.updatedAt = sortOrder;
      } else if (sortBy === 'totalCost') {
        orderBy.totalCost = sortOrder;
      } else {
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
            // package: {
            //   select: {
            //     id: true,
            //     name: true,
            //     vendorPackageCode: true,
            //   },
            // },
          },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      return {
        transactions,
        total,
        hasMore: skip + take < total,
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new BadRequestException('Failed to fetch transactions');
    }
  }

  // EXISTING: Get transaction statistics
  async getTransactionStats() {
    try {
      const [
        totalTransactions,
        completedTransactions,
        failedTransactions,
        processingTransactions,
        totalRevenue,
        todayTransactions,
      ] = await Promise.all([
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
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw new BadRequestException('Failed to fetch transaction statistics');
    }
  }

  // EXISTING: Update transaction status
  async updateTransactionStatus(id: string, status: string, adminNotes?: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          status: status as any,
          notes: adminNotes || transaction.notes,
          updatedAt: new Date(),
        },
      });

      return updatedTransaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating transaction status:', error);
      throw new BadRequestException('Failed to update transaction status');
    }
  }

  // NEW: Process bulk orders with multiple users and packages
  async processBulkOrder(bulkOrderData: BulkOrderData): Promise<BulkOrderResponse> {
    try {
      console.log('Processing bulk order:', bulkOrderData);

      // Step 1: Validate all packages first
      const validationResults = await this.packagesService.validateBulkOrderPackages(
        bulkOrderData.orders
      );

      // Step 2: Calculate total cost
      const totalCost = validationResults.reduce((sum, result) => sum + result.totalCost, 0);

      // Step 3: Check user balance
      const user = await this.prisma.user.findUnique({
        where: { id: bulkOrderData.placedBy },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (parseFloat(user.balance.toString()) < totalCost) {
        throw new BadRequestException(`Insufficient balance. Required: ${totalCost}, Available: ${user.balance}`);
      }

      // Step 4: Process each user's order
      const results: UserOrderResult[] = [];
      let successfulOrders = 0;
      let failedOrders = 0;
      let partialSuccessOrders = 0;
      let actualTotalCost = 0;

      for (const validationResult of validationResults) {
        const userResult = await this.processUserOrder(validationResult, bulkOrderData.placedBy, user.role);
        results.push(userResult);

        // Only count cost for successful packages
        const successfulPackagesCost = userResult.packages
          .filter(pkg => pkg.success)
          .reduce((sum, pkg) => sum + pkg.price, 0);
        actualTotalCost += successfulPackagesCost;

        if (userResult.success) {
          successfulOrders++;
        } else if (userResult.packages.some(pkg => pkg.success)) {
          partialSuccessOrders++;
        } else {
          failedOrders++;
        }
      }

      // Step 5: Update user balance (deduct only successful packages cost)
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

    } catch (error) {
      console.error('Error processing bulk order:', error);
      throw new BadRequestException(`Failed to process bulk order: ${error.message}`);
    }
  }

  // NEW: Process individual user order
  private async processUserOrder(
    validationResult: any,
    placedBy: string,
    userRole: string
  ): Promise<UserOrderResult> {
    try {
      const { playerId, identifier, gameName, foundPackages, notFoundCodes, totalCost } = validationResult;

      // If no packages found, return failed result
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

      // Create transaction record
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

      // Process each package and create orders
      const packageResults: any[] = [];
      let hasFailures = false;
      let successfulPackagesCost = 0;

      for (const pkg of foundPackages) {
        try {
          // Create individual order for each package
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

          // Process the package (simulate vendor API call)
          const packageResult = await this.processPackage(pkg, playerId, identifier, order.id);

          packageResults.push({
            packageCode: pkg.vendorPackageCode,
            packageName: pkg.name,
            price: pkg.price,
            success: packageResult.success,
            error: packageResult.error,
          });

          // Update order status
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: packageResult.success ? 'COMPLETED' : 'FAILED',
            },
          });

          if (packageResult.success) {
            successfulPackagesCost += pkg.price;
          } else {
            hasFailures = true;
          }

        } catch (error) {
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

      // Add not found packages to results
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

      // Update transaction status and amounts
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

    } catch (error) {
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

  // NEW: Process multiple packages with vendor API simulation
  private async processPackage(
    pkgs: any[], // Multiple packages
    playerId: string,
    identifier: string,
    orderId: string
  ): Promise<{ success: boolean; error?: string; }> {
    try {
      const results: any[] = [];

      // Process each package
      for (let i = 0; i < pkgs.length; i++) {
        const pkg = pkgs[i];

        try {
          console.log(`🔄 Processing package ${pkg.vendorPackageCode} for player ${playerId}...`);

          // Call vendor service with retry logic
          const vendorResult = await this.vendorService.processVendorCall(
            orderId,
            pkg.vendor,
            pkg.vendorPackageCode,
            playerId,
            identifier
          );

          if (vendorResult.success) {
            console.log(`✅ Package ${pkg.vendorPackageCode} processed successfully for player ${playerId}`);
            results.push({
              success: true,
              packageCode: pkg.vendorPackageCode,
              vendorOrderId: vendorResult.vendorOrderId
            });
          } else {
            console.log(`❌ Package ${pkg.vendorPackageCode} failed for player ${playerId}: ${vendorResult.error}`);
            results.push({
              success: false,
              packageCode: pkg.vendorPackageCode,
              error: vendorResult.error || 'Vendor API call failed'
            });
          }

        } catch (packageError) {
          console.error(`💥 Error processing package ${pkg.vendorPackageCode}:`, packageError);
          results.push({
            success: false,
            packageCode: pkg.vendorPackageCode,
            error: packageError.message
          });
        }
      }

      // Determine overall success
      const successfulPackages = results.filter(r => r.success);
      const failedPackages = results.filter(r => !r.success);

      if (successfulPackages.length === pkgs.length) {
        // All packages successful
        return { success: true };
      } else if (successfulPackages.length > 0) {
        // Partial success
        return {
          success: false,
          error: `Partial success: ${successfulPackages.length}/${pkgs.length} packages processed. Failed: ${failedPackages.map(f => f.packageCode).join(', ')}`
        };
      } else {
        // All failed
        return {
          success: false,
          error: `All packages failed: ${failedPackages.map(f => f.error).join(', ')}`
        };
      }

    } catch (error) {
      console.error('Package processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  // EXISTING: Create single order (keeping your existing functionality)
  async createOrder(orderData: {
    packageId: string;
    playerId: string;
    identifier: string;
    packageCode: string;
    gameName: string;
    userId: string;
    playerDetails: {
      playerId: string;
      identifier: string;
      game: string;
    };
  }) {
    try {
      // Parse package codes (split by comma if multiple)
      const packageCodes = orderData.packageCode.split(',').map(code => code.trim());

      // Get user to check role for pricing
      const user = await this.prisma.user.findUnique({
        where: { id: orderData.userId },
        include: {
          smileCoinBalances: true
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get all packages
      const packages: Package[] = [];

      for (const code of packageCodes) {
        // Find package by vendor code
        const pkg = await this.prisma.package.findFirst({
          where: {
            vendorPackageCode: {
              contains: code,
            },
            gameName: orderData.gameName,
          },
        });

        if (!pkg) {
          throw new NotFoundException(`Package with code ${code} not found`);
        }

        packages.push(pkg);
      }

      // Calculate costs using helper method
      const { xCoinCost: totalPrice, smileCoinCost, hasSmilePackages } =
        this.packagesService.calculateMixedVendorCosts(packages, user.role);

      // Check user balance - handle both xCoin and Smile coin
      if (hasSmilePackages) {
        // Check each package's vendor and region
        for (const pkg of packages) {
          console.log(pkg);
          // If vendor is smile, check the smile coin balance for that region
          if (pkg.vendor.toLowerCase() === 'smile') {
            const region = pkg.region;
            if (!region) {
              throw new BadRequestException('Region not found for Smile package');
            }

            // Find the smile coin balance for the specific region
            const selectedRegionalBalance = user.smileCoinBalances.find(bal => bal.region === region);
            const packagePrice = this.packagesService.getPackagePrice(pkg, user.role);
            
            if (selectedRegionalBalance) {
              if (parseFloat(selectedRegionalBalance.balance.toString()) < packagePrice) {
                throw new BadRequestException(`insufficient Smile Coin`);
              }
            } else {
              throw new BadRequestException(`insufficient Smile Coin`);
            }
          }
        }
      }

      if (totalPrice > 0) {
        if (parseFloat(user.balance.toString()) < totalPrice) {
          throw new BadRequestException(`Insufficient xCoin balance. Required: ${totalPrice}, Available: ${user.balance}`);
        }
      }

      // Calculate combined cost for transaction record
      const combinedCost = totalPrice + smileCoinCost;

      // Create transaction - UPDATED: No single packageId
      const transaction = await this.prisma.transaction.create({
        data: {
          userId: orderData.userId,
          type: user.role === 'RESELLER' ? 'RESELLER_BULK_PURCHASE' : 'RETAILER_PACKAGE_PURCHASE',
          status: 'PROCESSING',
          gameUserId: orderData.playerDetails.playerId,
          serverId: orderData.playerDetails.identifier,
          playerName: `Player_${orderData.playerDetails.playerId}`,
          region: packages[0].region,
          totalCost: combinedCost,
          quantity: packages.length,
          specialPricing: hasSmilePackages,
          priceType: hasSmilePackages ? 'BASE_VENDOR_COST' : 'VENDOR_PRICE',
        },
      });

      // NEW: Create transaction-package relationships
      for (const pkg of packages) {
        const packagePrice = this.packagesService.getPackagePrice(pkg, user.role);
        const isSpecial = this.packagesService.isSpecialPricing(pkg, user.role);

        await this.prisma.transactionPackage.create({
        data: {
          transactionId: transaction.id,
          packageId: pkg.id,
          quantity: 1,
          unitPrice: packagePrice,
          totalPrice: packagePrice,
          basePrice: parseFloat(pkg.price.toString()),
          markupApplied: isSpecial ? 0 : (parseFloat(pkg.price.toString()) - parseFloat(pkg.baseVendorCost.toString())),
          markupType: isSpecial ? 'BASE_VENDOR_COST' : 'VENDOR_PRICE',
        },
        });
      }

      // Create order
      const order = await this.prisma.order.create({
        data: {
          transactionId: transaction.id,
          gameUserId: orderData.playerId,
          serverId: orderData.identifier,
          playerName: `Player_${orderData.playerId}`,
          packageKeywords: packageCodes.join(','), // Store all codes
          status: 'PENDING',
          totalAmount: combinedCost,
        },
      });

      // Process the packages - FIXED: Pass packages array
      const result = await this.processPackage(packages, orderData.playerId, orderData.identifier, order.id);

      // Update transaction and order status
      const finalStatus = result.success ? 'COMPLETED' : 'FAILED';

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: finalStatus },
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: finalStatus },
      });

      // Deduct balance ONLY if order was successful
      if (result.success) {
        const updateData: any = {
          totalOrders: { increment: 1 },
        };

        // Deduct from appropriate balances
        if (totalPrice > 0) {
          updateData.balance = { decrement: totalPrice };
          updateData.totalSpent = { increment: totalPrice };
        }

        if (smileCoinCost > 0) {
          // Decrement the regional smile coin balance
          const region = packages[0]?.region;
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
          packageName: packages.map(p => p.name).join(', '),
          playerId: orderData.playerId,
          createdAt: order.createdAt,
        },
        orderId: order.id,
        message: result.success ? 'Order processed successfully' : `Order failed: ${result.error}`,
      };

    } catch (error) {
      console.error('Error creating order:', error);
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async findById(id: string) {
    try {
      const packageData = await this.prisma.package.findUnique({
        where: { id },
      });

      if (!packageData) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      // Return as array to match expected format in createOrder
      return [packageData];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching package:', error);
      throw new BadRequestException('Failed to fetch package');
    }
  }


  // Add to your existing transactions service

  async createTransaction(userId: string, packageId: string, quantity: number = 1) {
    // Get package with current pricing
    const packageData = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: {
        // Get current vendor rate
        vendorRate: true,
      }
    });

    if (!packageData || !packageData.lockedPrice) {
      throw new Error('Package not found or price not set');
    }

    // Lock in current prices
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'RESELLER_BULK_PURCHASE',
        // packageId,
        quantity,
        // Lock the price at purchase time
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

  // NEW: Get smile coin balance by region
  async getSmileCoinBalanceByRegion(userId: string, region: string): Promise<number> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          smileCoinBalances: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find the smile coin balance for the specified region
      const smileCoinBalance = user.smileCoinBalances?.find(balance => balance.region === region);

      return smileCoinBalance ? parseFloat(smileCoinBalance.balance.toString()) : 0;
    } catch (error) {
      console.error('Error fetching smile coin balance for region:', error);
      return 0;
    }
  }
}