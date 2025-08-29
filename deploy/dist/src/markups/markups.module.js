"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkupsModule = void 0;
const common_1 = require("@nestjs/common");
const markups_service_1 = require("./markups.service");
const markups_controller_1 = require("./markups.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let MarkupsModule = class MarkupsModule {
};
exports.MarkupsModule = MarkupsModule;
exports.MarkupsModule = MarkupsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [markups_controller_1.MarkupsController],
        providers: [markups_service_1.MarkupsService],
        exports: [markups_service_1.MarkupsService],
    })
], MarkupsModule);
//# sourceMappingURL=markups.module.js.map