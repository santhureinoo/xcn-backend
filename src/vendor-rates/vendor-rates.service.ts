import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorRatesService {
  constructor(private prisma: PrismaService) {}

  // Update vendor exchange rate
  async updateVendorRate(
    vendorName: string, 
    vendorCurrency: string, 
    newXCoinRate: number,
    updatedBy: string,
    reason?: string
  ) {
    // Get current rate for history
    const currentRate = await this.prisma.vendorExchangeRate.findUnique({
      where: { vendorName: vendorName }
    });

    // Calculate trend
    const trend = currentRate ? 
      (newXCoinRate > parseFloat(currentRate.xCoinRate.toString()) ? 'UP' :
       newXCoinRate < parseFloat(currentRate.xCoinRate.toString()) ? 'DOWN' : 'STABLE') : 'STABLE';

    const change24h = currentRate ? 
      ((newXCoinRate - parseFloat(currentRate.xCoinRate.toString())) / parseFloat(currentRate.xCoinRate.toString())) * 100 : 0;

    let updatedRate;

    const oldRate = await this.prisma.vendorExchangeRate.findUnique({
      where: { vendorName: vendorName }
    });

    if(oldRate) {
      updatedRate = await this.prisma.vendorExchangeRate.update({
        where: { vendorName: vendorName },
        data: {
          xCoinRate: newXCoinRate,
          updatedBy,
          updateReason: reason
        }
      });
    } else {
      updatedRate = await this.prisma.vendorExchangeRate.create({
        data: {
          vendorName,
          vendorCurrency,
          xCoinRate: newXCoinRate,
          updatedBy,
          updateReason: reason
        }
      });
    }

    // Update all packages using this vendor currency
    await this.updatePackagePrices(vendorName, vendorCurrency, oldRate ? oldRate.xCoinRate : updatedRate.xCoinRate);

    return updatedRate;
  }

  // Update package prices when vendor rates change
  private async updatePackagePrices(vendorName: string, vendorCurrency: string, oldRate: number) {
    const packages = await this.prisma.package.findMany({
      where: {
        vendor: vendorName,
        vendorCurrency: vendorCurrency,
        isPriceLocked: false // Only update packages that are NOT locked
      }
    });

    const vendorRate = await this.prisma.vendorExchangeRate.findUnique({
      where: { vendorName }
    });

    if (!vendorRate || vendorRate.xCoinRate === null) return;

    console.log(`Found ${packages.length} unlocked packages to update for vendor: ${vendorName}`);

    // Update each unlocked package
    for (const pkg of packages) {
      console.log('Processing unlocked package:', pkg.name);
      console.log('Old rate:', oldRate, 'New rate:', vendorRate.xCoinRate);
      console.log('Base vendor cost:', pkg.baseVendorCost);
      console.log('Current package price:', pkg.price);
      console.log('Current vendor price:', pkg.vendorPrice);

      // === CALCULATE NEW PRICE ===
      // Calculate what the price should have been with old rate (without extra coins)
      const expectedOldPrice = this.calculatePackagePrice(
        parseFloat(pkg.baseVendorCost.toString()),
        oldRate,
        parseFloat(pkg.markupPercent.toString()),
        parseFloat(pkg.roundToNearest.toString()),
        0 // No extra coins for base calculation
      );

      // Calculate the extra coins that user added to price
      const extraCoinPrice = parseFloat(pkg.price.toString()) - expectedOldPrice;
      console.log('Expected old price (without extra):', expectedOldPrice);
      console.log('Extra coins added to price:', extraCoinPrice);

      // Calculate new price with new rate
      const newPrice = this.calculatePackagePrice(
        parseFloat(pkg.baseVendorCost.toString()),
        parseFloat(vendorRate.xCoinRate.toString()),
        parseFloat(pkg.markupPercent.toString()),
        parseFloat(pkg.roundToNearest.toString()),
        Math.max(0, extraCoinPrice) // Only add positive extra coins
      );

      // === CALCULATE NEW VENDOR PRICE ===
      // Calculate what the vendor price should have been with old rate (without extra coins)
      const expectedOldVendorPrice = this.calculateVendorPrice(
        parseFloat(pkg.baseVendorCost.toString()),
        oldRate,
        0 // No extra coins for base calculation
      );

      // Calculate the extra coins that user added to vendor price
      const extraCoinVendorPrice = parseFloat(pkg.vendorPrice.toString()) - expectedOldVendorPrice;
      console.log('Expected old vendor price (without extra):', expectedOldVendorPrice);
      console.log('Extra coins added to vendor price:', extraCoinVendorPrice);

      // Calculate new vendor price with new rate
      const newVendorPrice = this.calculateVendorPrice(
        parseFloat(pkg.baseVendorCost.toString()),
        parseFloat(vendorRate.xCoinRate.toString()),
        Math.max(0, extraCoinVendorPrice) // Only add positive extra coins
      );

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

    // Log locked packages for info
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
  // Calculate package price with rounding
  private calculatePackagePrice(
    baseVendorCost: number,
    vendorRate: number,
    markupPercent: number,
    roundToNearest: number,
    extraCoin: number,
  ): number {
    console.log('Calculating price with:');
    console.log('- Base vendor cost:', baseVendorCost);
    console.log('- Vendor rate:', vendorRate);
    console.log('- Markup percent:', markupPercent);
    console.log('- Round to nearest:', roundToNearest);
    console.log('- Extra coin:', extraCoin);

    // Step 1: Calculate base price in xCoin (vendor cost * exchange rate)
    const basePrice = baseVendorCost * vendorRate;
    console.log('- Base price (cost * rate):', basePrice);
    
    // Step 2: Apply markup percentage
    const priceWithMarkup = basePrice * (1 + markupPercent / 100);
    console.log('- Price with markup:', priceWithMarkup);
    
    // Step 3: Round to nice numbers
    const roundedPrice = Math.ceil(priceWithMarkup / roundToNearest) * roundToNearest;
    console.log('- Rounded price:', roundedPrice);
    
    // Step 4: Add extra coins that user manually added
    const finalPrice = roundedPrice + extraCoin;
    console.log('- Final price (with extra):', finalPrice);
    
    return Math.max(0, finalPrice); // Ensure price is never negative
  }

  // Add new method for calculating vendor price (simpler, no markup)
  private calculateVendorPrice(
    baseVendorCost: number,
    vendorRate: number,
    extraCoin: number,
  ): number {
    console.log('Calculating vendor price with:');
    console.log('- Base vendor cost:', baseVendorCost);
    console.log('- Vendor rate:', vendorRate);
    console.log('- Extra coin:', extraCoin);

    // Step 1: Calculate base vendor price in xCoin (vendor cost * exchange rate)
    const baseVendorPrice = baseVendorCost * vendorRate;
    console.log('- Base vendor price (cost * rate):', baseVendorPrice);
    
    // Step 2: Add extra coins that user manually added
    const finalVendorPrice = baseVendorPrice + extraCoin;
    console.log('- Final vendor price (with extra):', finalVendorPrice);
    
    return Math.max(0, finalVendorPrice); // Ensure price is never negative
  }  // Get current vendor rates
  async getVendorRates() {
    return this.prisma.vendorExchangeRate.findMany({
      where: { isActive: true },
      orderBy: [
        { vendorName: 'asc' },
        { vendorCurrency: 'asc' }
      ]
    });
  }

  // Get rate history for a vendor
  async getVendorRateHistory(vendorName: string, vendorCurrency: string) {
    return this.prisma.vendorExchangeRate.findUnique({
      where: { vendorName },
      select: {
        rateHistory: true,
        previousRate: true,
        xCoinRate: true,
        updatedAt: true
      }
    });
  }
}