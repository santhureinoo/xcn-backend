import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  async getCurrencyStats() {
    try {
      const [
        totalXCoinsInCirculation,
        totalXCoinsPurchased24h,
        totalXCoinsSpent24h,
        totalRevenue24h,
        averageExchangeRate,
        activeUsers24h
      ] = await Promise.all([
        // Total XCoins in circulation (sum of all user balances)
        this.prisma.user.aggregate({
          _sum: { balance: true }
        }),
        // Total XCoins purchased in last 24h
        this.prisma.xCoinTransaction.aggregate({
          where: {
            type: 'PURCHASE',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          _sum: { amount: true }
        }),
        // Total XCoins spent in last 24h
        this.prisma.xCoinTransaction.aggregate({
          where: {
            type: 'SPEND',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          _sum: { amount: true }
        }),
        // Total revenue in last 24h (from transactions)
        this.prisma.transaction.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          _sum: { totalCost: true }
        }),
        // Average exchange rate (example: USD to XCoin)
        this.prisma.exchangeRate.findFirst({
          where: {
            fromCurrency: 'USD',
            toCurrency: 'XCN'
          }
        }),
        // Active users in last 24h
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        totalXCoinsInCirculation: parseFloat((totalXCoinsInCirculation._sum.balance || 0).toString()),
        totalXCoinsPurchased24h: parseFloat((totalXCoinsPurchased24h._sum.amount || 0).toString()),
        totalXCoinsSpent24h: Math.abs(parseFloat((totalXCoinsSpent24h._sum.amount || 0).toString())),
        totalRevenue24h: parseFloat((totalRevenue24h._sum.totalCost || 0).toString()),
        averageExchangeRate: parseFloat((averageExchangeRate?.rate || 100).toString()),
        activeUsers24h
      };
    } catch (error) {
      console.error('Error fetching currency stats:', error);
      throw new BadRequestException('Failed to fetch currency stats');
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
        rate: parseFloat(rate.rate.toString()),
        trend: rate.trend.toLowerCase(),
        change24h: parseFloat(rate.change24h.toString()),
        lastUpdated: rate.updatedAt.toISOString(),
        fromCurrencyName: rate.fromCurrencyRef.name,
        toCurrencyName: rate.toCurrencyRef.name
      }));
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new BadRequestException('Failed to fetch exchange rates');
    }
  }

  async updateExchangeRate(fromCurrency: string, toCurrency: string, newRate: number) {
    try {
      // Find existing exchange rate
      const existingRate = await this.prisma.exchangeRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency,
            toCurrency
          }
        }
      });

      if (!existingRate) {
        throw new NotFoundException(`Exchange rate from ${fromCurrency} to ${toCurrency} not found`);
      }

      // Calculate trend and change
      const oldRate = existingRate.rate;
      const change24h = ((newRate - parseFloat(oldRate.toString())) / parseFloat(oldRate.toString())) * 100;
      let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      
      if (change24h > 0.1) trend = 'UP';
      else if (change24h < -0.1) trend = 'DOWN';

      // Update the exchange rate
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating exchange rate:', error);
      throw new BadRequestException('Failed to update exchange rate');
    }
  }

  async getCurrencies() {
    try {
      const currencies = await this.prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' }
      });

      return currencies;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw new BadRequestException('Failed to fetch currencies');
    }
  }

  async createExchangeRate(fromCurrency: string, toCurrency: string, rate: number) {
    try {
      // Check if currencies exist
      const [fromCurrencyExists, toCurrencyExists] = await Promise.all([
        this.prisma.currency.findUnique({ where: { code: fromCurrency } }),
        this.prisma.currency.findUnique({ where: { code: toCurrency } })
      ]);

      if (!fromCurrencyExists || !toCurrencyExists) {
        throw new BadRequestException('One or both currencies do not exist');
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
    } catch (error) {
      console.error('Error creating exchange rate:', error);
      throw new BadRequestException('Failed to create exchange rate');
    }
  }
}
