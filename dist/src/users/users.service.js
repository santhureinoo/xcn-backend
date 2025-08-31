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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let UsersService = class UsersService {
    prisma;
    transporter;
    constructor(prisma) {
        this.prisma = prisma;
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
    async create(createUserDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email }
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const tempPassword = this.generateTemporaryPassword();
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
            const userData = {
                email: createUserDto.email,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                password: hashedPassword,
                phone: createUserDto.phone || null,
                address: createUserDto.address || null,
                role: createUserDto.role?.toUpperCase() || 'RETAILER',
                status: 'ACTIVE',
                balance: createUserDto.balance || 0,
                totalSpent: 0,
                totalOrders: 0,
                isVerified: false,
            };
            if (createUserDto.role === 'reseller') {
                userData.commission = createUserDto.commission || 3.0;
                userData.totalEarnings = 0;
                userData.downlineCount = 0;
                if (createUserDto.referralCode) {
                    const existingCode = await this.prisma.user.findFirst({
                        where: { referralCode: createUserDto.referralCode }
                    });
                    if (existingCode) {
                        throw new common_1.BadRequestException('Referral code already exists');
                    }
                    userData.referralCode = createUserDto.referralCode;
                }
                else {
                    userData.referralCode = await this.generateUniqueReferralCode();
                }
                if (createUserDto.referredBy) {
                    const referrer = await this.prisma.user.findFirst({
                        where: {
                            OR: [
                                { referralCode: createUserDto.referredBy },
                                { email: createUserDto.referredBy }
                            ]
                        }
                    });
                    if (referrer) {
                        userData.referredBy = referrer.referralCode || createUserDto.referredBy;
                    }
                }
            }
            const user = await this.prisma.user.create({
                data: userData,
                include: {
                    smileCoinBalances: true
                }
            });
            if (userData.referredBy) {
                await this.prisma.user.updateMany({
                    where: { referralCode: userData.referredBy },
                    data: { downlineCount: { increment: 1 } }
                });
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpiry,
                },
            });
            await this.sendWelcomeEmail(user.email, user.firstName, tempPassword, resetToken);
            if (createUserDto.smileCoinBalances && createUserDto.smileCoinBalances.length > 0) {
                for (const balance of createUserDto.smileCoinBalances) {
                    await this.prisma.smileCoinBalance.create({
                        data: {
                            userId: user.id,
                            region: balance.region,
                            balance: balance.balance,
                        },
                    });
                }
            }
            const userWithBalances = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    smileCoinBalances: true,
                },
            });
            if (userWithBalances) {
                const { password, refreshToken, resetToken, otpSecret, ...result } = userWithBalances;
                return result;
            }
            const { password, refreshToken, resetToken: token, otpSecret, ...result } = user;
            return result;
        }
        catch (error) {
            console.error('Error creating user:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to create user');
        }
    }
    generateTemporaryPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
    async sendWelcomeEmail(email, firstName, tempPassword, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${resetToken}`;
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM || 'noreply@gamingplatform.com',
                to: email,
                subject: 'Welcome to Gaming Platform - Set Your Password',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; margin: 0;">Welcome to Gaming Platform!</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
              <p>Your account has been created successfully. Here are your login credentials:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This is a temporary password. For security reasons, please set your own password immediately.</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Set Your Password</a>
            </div>

            <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
              <ol style="color: #666; line-height: 1.6;">
                <li>Click the "Set Your Password" button above</li>
                <li>Create a strong, secure password</li>
                <li>Log in to your account with your new password</li>
                <li>Complete your profile setup</li>
              </ol>
            </div>

            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Security Note:</strong> This password setup link will expire in 24 hours. If you don't set your password within this time, please contact support.
              </p>
              <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                If you didn't expect this email, please contact our support team immediately.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Gaming Platform Team<br>
                <a href="mailto:support@gamingplatform.com" style="color: #007bff;">support@gamingplatform.com</a>
              </p>
            </div>
          </div>
        `,
                text: `
Welcome to Gaming Platform!

Hello ${firstName}!

Your account has been created successfully. Here are your login credentials:

Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT: This is a temporary password. For security reasons, please set your own password immediately.

Set your password here: ${resetUrl}

Getting Started:
1. Click the password setup link above
2. Create a strong, secure password  
3. Log in to your account with your new password
4. Complete your profile setup

Security Note: This password setup link will expire in 24 hours. If you don't set your password within this time, please contact support.

If you didn't expect this email, please contact our support team immediately.

Gaming Platform Team
support@gamingplatform.com
        `,
            });
        }
        catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }
    async resendSetupEmail(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('User has already set up their password');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        const tempPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
        await this.sendWelcomeEmail(user.email, user.firstName, tempPassword, resetToken);
        return { message: 'Setup email sent successfully' };
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                smileCoinBalances: true,
            },
        });
    }
    async findOne(emailOrId) {
        let user = await this.findByEmail(emailOrId);
        if (!user) {
            user = await this.findById(emailOrId);
        }
        return user;
    }
    async loginByEmailAndPassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        return user;
    }
    async updateLastLogin(userId) {
    }
    async storeRefreshToken(userId, refreshToken) {
        if (!refreshToken || typeof refreshToken !== 'string') {
            throw new common_1.BadRequestException('Invalid refresh token');
        }
        const saltRounds = 10;
        const hashedToken = await bcrypt.hash(refreshToken, saltRounds);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: hashedToken,
                refreshTokenExpires: expiryDate,
            },
        });
    }
    async validateRefreshToken(userId, refreshToken) {
        if (!refreshToken || typeof refreshToken !== 'string') {
            return false;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.refreshToken || !user.refreshTokenExpires) {
            return false;
        }
        if (user.refreshTokenExpires < new Date()) {
            return false;
        }
        return await bcrypt.compare(refreshToken, user.refreshToken);
    }
    async revokeRefreshToken(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                refreshTokenExpires: null,
            },
        });
    }
    async setOtpSecret(userId, otp) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                otpSecret: otp,
            },
        });
    }
    async setResetToken(email, token, expiryDate) {
        await this.prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: expiryDate,
            },
        });
    }
    async resetPassword(token, newPassword) {
        if (!newPassword || typeof newPassword !== 'string') {
            throw new common_1.BadRequestException('Invalid password');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
    }
    async verifyUser(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                otpSecret: null,
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.role && filters.role !== 'all') {
            where.role = filters.role.toUpperCase();
        }
        if (filters?.status && filters.status !== 'all') {
            where.status = filters.status.toUpperCase();
        }
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        let orderBy = { createdAt: 'desc' };
        if (filters?.sortBy) {
            const sortOrder = filters.sortOrder || 'desc';
            switch (filters.sortBy) {
                case 'name':
                    orderBy = { firstName: sortOrder };
                    break;
                case 'email':
                    orderBy = { email: sortOrder };
                    break;
                case 'balance':
                    orderBy = { balance: sortOrder };
                    break;
                case 'totalSpent':
                    orderBy = { totalSpent: sortOrder };
                    break;
                case 'createdAt':
                    orderBy = { createdAt: sortOrder };
                    break;
                default:
                    orderBy = { createdAt: 'desc' };
            }
        }
        const users = await this.prisma.user.findMany({
            where,
            skip: filters?.skip || 0,
            take: filters?.take || 50,
            include: {
                smileCoinBalances: true,
            },
            orderBy,
        });
        const total = await this.prisma.user.count({ where });
        return {
            users,
            total,
            hasMore: (filters?.skip || 0) + users.length < total,
        };
    }
    async getUserStats() {
        const [totalUsers, totalRetailers, totalResellers, activeUsers, totalBalance, totalSpent,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'RETAILER' } }),
            this.prisma.user.count({ where: { role: 'RESELLER' } }),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.aggregate({
                _sum: { balance: true },
            }),
            this.prisma.user.aggregate({
                _sum: { totalSpent: true },
            }),
        ]);
        return {
            totalUsers,
            totalRetailers,
            totalResellers,
            activeUsers,
            totalBalance: totalBalance._sum.balance || 0,
            totalSpent: totalSpent._sum.totalSpent || 0,
        };
    }
    async update(id, updateUserDto) {
        try {
            const updateData = { ...updateUserDto };
            if (updateUserDto.password) {
                if (typeof updateUserDto.password !== 'string') {
                    throw new common_1.BadRequestException('Password must be a string');
                }
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(updateUserDto.password, saltRounds);
            }
            if (updateUserDto.role) {
                updateData.role = updateUserDto.role.toUpperCase();
            }
            if (updateUserDto.status) {
                updateData.status = updateUserDto.status.toUpperCase();
            }
            if (updateUserDto.role === 'reseller') {
                const existingUser = await this.findById(id);
                if (!existingUser?.referralCode && !updateData.referralCode) {
                    updateData.referralCode = await this.generateUniqueReferralCode();
                }
            }
            const { smileCoinBalances, ...userData } = updateData;
            if (smileCoinBalances && Array.isArray(smileCoinBalances)) {
                for (const balance of smileCoinBalances) {
                    await this.prisma.smileCoinBalance.upsert({
                        where: {
                            userId_region: {
                                userId: id,
                                region: balance.region,
                            },
                        },
                        update: {
                            balance: balance.balance,
                        },
                        create: {
                            userId: id,
                            region: balance.region,
                            balance: balance.balance,
                        },
                    });
                }
            }
            const user = await this.prisma.user.update({
                where: { id },
                data: userData,
                include: {
                    smileCoinBalances: true,
                },
            });
            return user;
        }
        catch (error) {
            console.error('Error updating user:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to update user');
        }
    }
    async remove(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.referredBy) {
            await this.prisma.user.updateMany({
                where: { referralCode: user.referredBy },
                data: { downlineCount: { decrement: 1 } }
            });
        }
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async updateBalance(userId, amount) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            });
        }
        catch (error) {
            console.error('Error updating user balance:', error);
            throw new common_1.BadRequestException('Failed to update user balance');
        }
    }
    async updateSmileBalance(userId, region, amount) {
        try {
            const result = await this.prisma.smileCoinBalance.upsert({
                where: {
                    userId_region: {
                        userId: userId,
                        region: region
                    }
                },
                update: {
                    balance: {
                        increment: amount
                    }
                },
                create: {
                    userId: userId,
                    region: region,
                    balance: amount
                }
            });
            return parseFloat(result.balance.toString());
        }
        catch (error) {
            console.error('Error updating user Smile coin balance:', error);
            throw new common_1.BadRequestException('Failed to update user Smile coin balance');
        }
    }
    async getBalance(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    smileCoinBalances: true
                }
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return {
                balance: parseFloat(user.balance?.toString() || '0'),
                smileCoinBalances: user.smileCoinBalances || []
            };
        }
        catch (error) {
            console.error('Error fetching user balance:', error);
            throw new common_1.BadRequestException('Failed to fetch user balance');
        }
    }
    async generateUniqueReferralCode() {
        let code = '';
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;
        while (!isUnique && attempts < maxAttempts) {
            code = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existingUser = await this.prisma.user.findFirst({
                where: { referralCode: code }
            });
            if (!existingUser) {
                isUnique = true;
            }
            attempts++;
        }
        if (!isUnique) {
            throw new common_1.BadRequestException('Failed to generate unique referral code');
        }
        return code;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map