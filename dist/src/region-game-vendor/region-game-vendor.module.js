"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionGameVendorModule = void 0;
const common_1 = require("@nestjs/common");
const region_game_vendor_service_1 = require("./region-game-vendor.service");
const region_game_vendor_controller_1 = require("./region-game-vendor.controller");
const smile_one_module_1 = require("../smile-one/smile-one.module");
let RegionGameVendorModule = class RegionGameVendorModule {
};
exports.RegionGameVendorModule = RegionGameVendorModule;
exports.RegionGameVendorModule = RegionGameVendorModule = __decorate([
    (0, common_1.Module)({
        imports: [smile_one_module_1.SmileOneModule],
        controllers: [region_game_vendor_controller_1.RegionGameVendorController],
        providers: [region_game_vendor_service_1.RegionGameVendorService],
    })
], RegionGameVendorModule);
//# sourceMappingURL=region-game-vendor.module.js.map