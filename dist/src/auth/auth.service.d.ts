import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private transporter;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginedUser: any): Promise<{
        access_token: string;
        refresh_token: string;
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
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            balance: import("@prisma/client/runtime/library").Decimal;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        refresh_token: string;
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
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            balance: import("@prisma/client/runtime/library").Decimal;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
        };
    } | {
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            balance: import("@prisma/client/runtime/library").Decimal;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            phone: string | null;
            address: string | null;
            avatar: string | null;
            createdAt: Date;
            isVerified: boolean;
        };
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateOTP;
    private sendVerificationEmail;
    private sendPasswordResetEmail;
}
