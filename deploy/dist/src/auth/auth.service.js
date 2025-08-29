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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    usersService;
    jwtService;
    transporter;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginedUser) {
        const user = await this.usersService.loginByEmailAndPassword(loginedUser.email, loginedUser.password);
        console.log(user);
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' });
        await this.usersService.storeRefreshToken(user.id, refreshToken);
        await this.usersService.updateLastLogin(user.id);
        console.log({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                balance: user.balance,
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                ...(user.role === 'RESELLER' && {
                    commission: user.commission,
                    totalEarnings: user.totalEarnings,
                    referralCode: user.referralCode,
                    referredBy: user.referredBy,
                    downlineCount: user.downlineCount,
                }),
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                isVerified: user.isVerified,
            },
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                balance: user.balance,
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                ...(user.role === 'RESELLER' && {
                    commission: user.commission,
                    totalEarnings: user.totalEarnings,
                    referralCode: user.referralCode,
                    referredBy: user.referredBy,
                    downlineCount: user.downlineCount,
                }),
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                isVerified: user.isVerified,
            },
        };
    }
    async refreshAccessToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const userId = payload.sub;
            console.log(userId);
            const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.usersService.findById(userId);
            console.log(user);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newAccessToken = this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }, { expiresIn: '1h' });
            const newRefreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' });
            await this.usersService.storeRefreshToken(user.id, newRefreshToken);
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async register(createUserDto) {
        try {
            const existingUser = await this.usersService.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new common_1.UnauthorizedException('User with this email already exists');
            }
            const user = await this.usersService.create(createUserDto);
            const otp = this.generateOTP();
            await this.usersService.setOtpSecret(user.id, otp);
            await this.sendVerificationEmail(user.email, otp);
            if (process.env.NODE_ENV === 'development') {
                return this.login(user);
            }
            const payload = { email: user.email, sub: user.id, role: user.role };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
            const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' });
            await this.usersService.storeRefreshToken(user.id, refreshToken);
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    balance: user.balance || 0,
                    totalSpent: user.totalSpent || 0,
                    totalOrders: user.totalOrders || 0,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    isVerified: user.isVerified,
                },
                message: 'Registration successful',
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Registration failed');
        }
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return {
                message: 'If an account with that email exists, password reset instructions have been sent.',
            };
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiryDate = new Date(Date.now() + 3600000);
        await this.usersService.setResetToken(email, token, expiryDate);
        await this.sendPasswordResetEmail(email, token);
        return {
            message: 'Password reset instructions sent to your email',
        };
    }
    async resetPassword(token, newPassword) {
        try {
            await this.usersService.resetPassword(token, newPassword);
            return {
                message: 'Password reset successful',
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Password reset failed');
        }
    }
    async verifyOTP(email, otp) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.otpSecret !== otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        await this.usersService.verifyUser(user.id);
        return {
            message: 'Email verified successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: true,
            },
        };
    }
    async logout(userId) {
        try {
            await this.usersService.revokeRefreshToken(userId);
            return {
                message: 'Logout successful',
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Logout failed');
        }
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendVerificationEmail(email, otp) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM || 'noreply@gamingplatform.com',
                to: email,
                subject: 'Verify Your Email - Gaming Platform',
                text: `Your verification code is: ${otp}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Gaming Platform!</h2>
            <p>Thank you for registering with us. Please use the following verification code to complete your registration:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Gaming Platform Team</p>
          </div>
        `,
            });
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
    }
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM || 'noreply@gamingplatform.com',
                to: email,
                subject: 'Reset Your Password - Gaming Platform',
                text: `Click the following link to reset your password: ${resetUrl}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password for your Gaming Platform account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Gaming Platform Team</p>
          </div>
        `,
            });
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new common_1.UnauthorizedException('Failed to send password reset email');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map