import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('currency')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('stats')
  @UseGuards(AdminGuard)
  async getCurrencyStats() {
    try {
      const stats = await this.currencyService.getCurrencyStats();
      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('exchange-rates')
  @UseGuards(AdminGuard)
  async getExchangeRates() {
    try {
      const rates = await this.currencyService.getExchangeRates();
      return {
        success: true,
        rates
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Patch('exchange-rates/:from/:to')
  @UseGuards(AdminGuard)
  async updateExchangeRate(
    @Param('from') fromCurrency: string,
    @Param('to') toCurrency: string,
    @Body() body: { rate: number }
  ) {
    try {
      const updatedRate = await this.currencyService.updateExchangeRate(
        fromCurrency,
        toCurrency,
        body.rate
      );
      return {
        success: true,
        rate: updatedRate,
        message: 'Exchange rate updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
