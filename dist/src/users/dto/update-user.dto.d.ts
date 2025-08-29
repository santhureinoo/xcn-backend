import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    status?: 'active' | 'inactive' | 'suspended';
    balance?: number;
    totalSpent?: number;
    totalOrders?: number;
    avatar?: string;
    commission?: number;
    totalEarnings?: number;
    downlineCount?: number;
    isVerified?: boolean;
}
export {};
