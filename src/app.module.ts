import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmileOneModule } from './smile-one/smile-one.module';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { CurrencyModule } from './currency/currency.module';
import { TransactionsModule } from './transactions/transactions.module';
import { VendorRatesModule } from './vendor-rates/vendor-rates.module';
import { MarkupsModule } from './markups/markups.module';
import { RegionGameVendorModule } from './region-game-vendor/region-game-vendor.module';

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SmileOneModule,
    AuthModule,
    PackagesModule,
    CurrencyModule,
    VendorRatesModule,
    TransactionsModule,
    MarkupsModule,
    RegionGameVendorModule
  ],
})
export class AppModule { }
