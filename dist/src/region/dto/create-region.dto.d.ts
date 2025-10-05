export declare enum RegionStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare class CreateRegionDto {
    name: string;
    status?: RegionStatus;
}
