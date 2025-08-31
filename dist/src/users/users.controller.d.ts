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
            commission?: number | null | undefined;
            totalEarnings?: number | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: number;
            smileCoinBalances: {
                id: string;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: number;
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
            commission?: number | null | undefined;
            totalEarnings?: number | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: number;
            smileCoinBalances: {
                id: string;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: number;
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
            totalBalance: number;
            totalSpent: number;
        };
    }>;
    getBalance(req: any): Promise<{
        success: boolean;
        balance: number;
        smileCoinBalances: {
            id: string;
            balance: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            region: string;
        }[];
        currency: string;
    }>;
    getSmileCoinBalanceByRegion(req: any, region: string): Promise<{
        success: boolean;
        balance: number;
        region: string;
        currency: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        user: {
            createdAt: Date;
            lastLoginAt: Date | null;
            isVerified: boolean;
            commission?: number | null | undefined;
            totalEarnings?: number | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: number;
            smileCoinBalances: {
                id: string;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: number;
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
            commission?: number | null | undefined;
            totalEarnings?: number | null | undefined;
            referralCode?: string | null | undefined;
            referredBy?: string | null | undefined;
            downlineCount?: number | null | undefined;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: number;
            smileCoinBalances: {
                id: string;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                region: string;
            }[];
            totalSpent: number;
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
            balance: number;
        };
        message: string;
        transaction: {
            amount: number;
            previousBalance: number;
            newBalance: number;
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
                balance: number;
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
            Commission?: number | null | undefined;
            'Total Earnings'?: number | null | undefined;
            'Referral Code'?: string | null | undefined;
            'Downline Count'?: number | null | undefined;
            Name: string;
            Email: string;
            Role: import(".prisma/client").$Enums.UserRole;
            Status: import(".prisma/client").$Enums.UserStatus;
            Balance: number;
            'Total Spent': number;
            Orders: number;
            Created: string;
            Phone: string;
        }[];
        total: number;
    }>;
}
