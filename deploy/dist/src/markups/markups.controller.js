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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkupsController = void 0;
const common_1 = require("@nestjs/common");
const markups_service_1 = require("./markups.service");
const create_markup_dto_1 = require("./dto/create-markup.dto");
const update_markup_dto_1 = require("./dto/update-markup.dto");
let MarkupsController = class MarkupsController {
    markupsService;
    constructor(markupsService) {
        this.markupsService = markupsService;
    }
    create(createMarkupDto) {
        return this.markupsService.create(createMarkupDto);
    }
    findAll(isActive, search, markupType, page, limit, sortBy, sortOrder) {
        const filters = {
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            search,
            markupType,
            skip: page ? (parseInt(page) - 1) * parseInt(limit || '50') : 0,
            take: limit ? parseInt(limit) : 50,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        };
        return this.markupsService.findAll(filters);
    }
    getMarkupStats() {
        return this.markupsService.getMarkupStats();
    }
    getActiveMarkups() {
        return this.markupsService.getActiveMarkups();
    }
    findOne(id) {
        return this.markupsService.findById(id);
    }
    update(id, updateMarkupDto) {
        return this.markupsService.update(id, updateMarkupDto);
    }
    toggleStatus(id) {
        return this.markupsService.toggleStatus(id);
    }
    remove(id) {
        return this.markupsService.remove(id);
    }
    async exportMarkups(filters) {
        try {
            const result = await this.markupsService.exportMarkups(filters);
            return result;
        }
        catch (error) {
            console.error('Error exporting markups:', error);
            throw error;
        }
    }
};
exports.MarkupsController = MarkupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_markup_dto_1.CreateMarkupDto]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('isActive')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('markupType')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "getMarkupStats", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "getActiveMarkups", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_markup_dto_1.UpdateMarkupDto]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarkupsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarkupsController.prototype, "exportMarkups", null);
exports.MarkupsController = MarkupsController = __decorate([
    (0, common_1.Controller)('markups'),
    __metadata("design:paramtypes", [markups_service_1.MarkupsService])
], MarkupsController);
//# sourceMappingURL=markups.controller.js.map