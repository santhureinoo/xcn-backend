// DTOs for RegionGameVendor operations
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

// Validation schemas
export const CreateRegionGameVendorSchema = {
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

export const UpdateRegionGameVendorSchema = {
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

// DTO Classes for validation (if using class-based validation)
export class CreateRegionGameVendorDto {
  region!: string;
  gameName!: string;
  vendorName!: string;
  isActive?: boolean;
}

export class UpdateRegionGameVendorDto {
  region?: string;
  gameName?: string;
  vendorName?: string;
  isActive?: boolean;
}

export class FilterRegionGameVendorDto {
  region?: string;
  gameName?: string;
  vendorName?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}