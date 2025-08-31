import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        token: string;
        user: {
            createdAt: Date;
            lastLoginAt: Date | null;
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
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
        refresh_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            status: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
            createdAt: Date;
            isVerified: boolean;
        };
        refresh_token: string;
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    verifyOTP(body: {
        email: string;
        otp: string;
    }): Promise<{
        message: string;
        success: boolean;
        isVerified: boolean;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
        };
    }>;
    getProfile(req: any): {
        createdAt: any;
        lastLoginAt: any;
        isVerified: any;
        commission?: any;
        totalEarnings?: any;
        referralCode?: any;
        referredBy?: any;
        downlineCount?: any;
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        role: any;
        status: any;
        balance: any;
        totalSpent: any;
        totalOrders: any;
        phone: any;
        address: any;
        avatar: any;
    };
    refreshToken(body: {
        refresh_token: string;
    }): Promise<{
        token: string;
        refresh_token: string;
        message: string;
    }>;
    logout(req: any): Promise<{
        message: string;
        success: boolean;
    }>;
}
