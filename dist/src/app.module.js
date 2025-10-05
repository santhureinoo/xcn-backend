"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const smile_one_module_1 = require("./smile-one/smile-one.module");
const configuration_1 = require("./config/configuration");
const auth_module_1 = require("./auth/auth.module");
const packages_module_1 = require("./packages/packages.module");
const currency_module_1 = require("./currency/currency.module");
const transactions_module_1 = require("./transactions/transactions.module");
const vendor_rates_module_1 = require("./vendor-rates/vendor-rates.module");
const markups_module_1 = require("./markups/markups.module");
const region_game_vendor_module_1 = require("./region-game-vendor/region-game-vendor.module");
const region_module_1 = require("./region/region.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            smile_one_module_1.SmileOneModule,
            auth_module_1.AuthModule,
            packages_module_1.PackagesModule,
            currency_module_1.CurrencyModule,
            vendor_rates_module_1.VendorRatesModule,
            transactions_module_1.TransactionsModule,
            markups_module_1.MarkupsModule,
            region_game_vendor_module_1.RegionGameVendorModule,
            region_module_1.RegionModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map