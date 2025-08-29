"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterRegionGameVendorDto = exports.UpdateRegionGameVendorDto = exports.CreateRegionGameVendorDto = exports.UpdateRegionGameVendorSchema = exports.CreateRegionGameVendorSchema = void 0;
exports.CreateRegionGameVendorSchema = {
    region: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    gameName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    vendorName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    isActive: {
        required: false,
        type: 'boolean'
    }
};
exports.UpdateRegionGameVendorSchema = {
    region: {
        required: false,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    gameName: {
        required: false,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    vendorName: {
        required: false,
        type: 'string',
        minLength: 2,
        maxLength: 100
    },
    isActive: {
        required: false,
        type: 'boolean'
    }
};
class CreateRegionGameVendorDto {
    region;
    gameName;
    vendorName;
    isActive;
}
exports.CreateRegionGameVendorDto = CreateRegionGameVendorDto;
class UpdateRegionGameVendorDto {
    region;
    gameName;
    vendorName;
    isActive;
}
exports.UpdateRegionGameVendorDto = UpdateRegionGameVendorDto;
class FilterRegionGameVendorDto {
    region;
    gameName;
    vendorName;
    isActive;
    page;
    limit;
}
exports.FilterRegionGameVendorDto = FilterRegionGameVendorDto;
//# sourceMappingURL=create-region-game-vendor.dto.js.map