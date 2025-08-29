export interface CreateRegionGameVendorDto {
    region: string;
    gameName: string;
    vendorName: string;
    isActive?: boolean;
}
export interface UpdateRegionGameVendorDto {
    region?: string;
    gameName?: string;
    vendorName?: string;
    isActive?: boolean;
}
export interface FilterRegionGameVendorDto {
    region?: string;
    gameName?: string;
    vendorName?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export interface RegionGameVendorResponseDto {
    id: string;
    region: string;
    gameName: string;
    vendorName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface BulkCreateRegionGameVendorDto {
    relationships: CreateRegionGameVendorDto[];
}
export interface FilteredDataResponseDto {
    regions: string[];
    games: string[];
    vendorNames: string[];
}
export interface PaginationResponseDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface RegionGameVendorListResponseDto {
    data: RegionGameVendorResponseDto[];
    pagination: PaginationResponseDto;
}
export interface StatsResponseDto {
    totalRelationships: number;
    activeRelationships: number;
    inactiveRelationships: number;
    uniqueRegionsCount: number;
    uniqueGamesCount: number;
    uniqueVendorsCount: number;
}
export declare const CreateRegionGameVendorSchema: {
    region: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    gameName: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    vendorName: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    isActive: {
        required: boolean;
        type: string;
    };
};
export declare const UpdateRegionGameVendorSchema: {
    region: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    gameName: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    vendorName: {
        required: boolean;
        type: string;
        minLength: number;
        maxLength: number;
    };
    isActive: {
        required: boolean;
        type: string;
    };
};
export declare class CreateRegionGameVendorDto {
    region: string;
    gameName: string;
    vendorName: string;
    isActive?: boolean;
}
export declare class UpdateRegionGameVendorDto {
    region?: string;
    gameName?: string;
    vendorName?: string;
    isActive?: boolean;
}
export declare class FilterRegionGameVendorDto {
    region?: string;
    gameName?: string;
    vendorName?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
