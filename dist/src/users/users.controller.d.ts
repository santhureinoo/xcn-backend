import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        user: {
            createdAt: Date;
            lastLoginAt: Date | null;
            isVerified: boolean;
            commission?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            totalEarnings?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            smileCoinBalances: {
                id: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
    }>;
    findAll(role?: string, status?: string, search?: string, page?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        users: {
            createdAt: Date;
            lastLoginAt: Date | null;
            isVerified: boolean;
            commission?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            totalEarnings?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            smileCoinBalances: {
                id: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    getUserStats(): Promise<{
        success: boolean;
        stats: {
            totalUsers: number;
            totalRetailers: number;
            totalResellers: number;
            activeUsers: number;
            totalBalance: number | import("@prisma/client/runtime/library").Decimal;
            totalSpent: number | import("@prisma/client/runtime/library").Decimal;
        };
    }>;
    getBalance(req: any): Promise<{
        success: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        smileCoinBalances: {
            id: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            region: string;
        }[];
        currency: string;
    }>;
    getSmileCoinBalanceByRegion(req: any, region: string): Promise<{
        success: boolean;
        balance: number | import("@prisma/client/runtime/library").Decimal;
        region: string;
        currency: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        user: {
            createdAt: Date;
            lastLoginAt: Date | null;
            isVerified: boolean;
            commission?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            totalEarnings?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            smileCoinBalances: {
                id: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        message: string;
        user: {
            createdAt: Date;
            lastLoginAt: Date | null;
            isVerified: boolean;
            commission?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            totalEarnings?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            smileCoinBalances: {
                id: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            status: string;
        };
    }>;
    rechargeBalance(id: string, body: {
        amount: number;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        message: string;
        transaction: {
            amount: number;
            previousBalance: import("@prisma/client/runtime/library").Decimal;
            newBalance: import("@prisma/client/runtime/library").Decimal;
            rechargedBy: any;
            timestamp: string;
            notes: string | null;
        };
    }>;
    rechargeSmileBalance(id: string, body: {
        amount: number;
        region: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            region: string;
            smileCoinBalances: {
                id: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
        };
        message: string;
        transaction: {
            amount: number;
            region: string;
            newBalance: number;
            rechargedBy: any;
            timestamp: string;
            notes: string | null;
            currency: string;
        };
    }>;
    resendSetupEmail(id: string): Promise<{
        message: string;
        success: boolean;
    }>;
    exportUsers(filters: {
        role?: string;
        status?: string;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            Commission?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            'Total Earnings'?: import("@prisma/client/runtime/library").Decimal | null | undefined;
            'Referral Code'?: string | null | undefined;
            'Downline Count'?: number | null | undefined;
            Name: string;
            Email: string;
            Role: import(".prisma/client").$Enums.UserRole;
            Status: import(".prisma/client").$Enums.UserStatus;
            Balance: import("@prisma/client/runtime/library").Decimal;
            'Total Spent': import("@prisma/client/runtime/library").Decimal;
            Orders: number;
            Created: string;
            Phone: string;
        }[];
        total: number;
    }>;
}
