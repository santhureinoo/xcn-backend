import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorRatesService } from './vendor-rates.service';

@Controller('vendor-rates')
@UseGuards(JwtAuthGuard)
export class VendorRatesController {
  constructor(private vendorRatesService: VendorRatesService) {}

  @Get()
  async getVendorRates() {
    const rates = await this.vendorRatesService.getVendorRates();
    return {
      success: true,
      rates
    };
  }

  @Post('update')
  async updateVendorRate(@Body() updateData: {
    vendorName: string;
    vendorCurrency: string;
    region: string;
    newRate: number;
    updatedBy: string;
    reason?: string;
  }) {
    const updatedRate = await this.vendorRatesService.updateVendorRate(
      updateData.vendorName,
      updateData.vendorCurrency,
      updateData.region,
      updateData.newRate,
      updateData.updatedBy,
      updateData.reason
    );

    return {
      success: true,
      message: 'Vendor rate updated successfully',
      rate: updatedRate
    };
  }

  @Get('history/:vendorName/:vendorCurrency/:region')
  async getVendorRateHistory(
    @Param('vendorName') vendorName: string,
    @Param('vendorCurrency') vendorCurrency: string,
    @Param('region') region: string
  ) {
    const history = await this.vendorRatesService.getVendorRateHistory(
      vendorName,
      vendorCurrency,
      region
    );

    return {
      success: true,
      history
    };
  }
}