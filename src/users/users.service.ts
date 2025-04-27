import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName } = createUserDto;
    
    // Check if user already exists
    const existingUser = await this.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
  }

  async setResetToken(email: string, token: string): Promise<void> {
    const user = await this.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 3600000), // Token valid for 1 hour
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
    
    if (!user) {
      throw new NotFoundException('Invalid or expired token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async setOtpSecret(userId: string, secret: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: secret,
      },
    });
  }

  async verifyUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
      },
    });
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Hash the token before storing for security
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    
    // Update the user record with the hashed refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedToken,
        // You might want to store token expiry as well
        refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    // Find the user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.refreshToken) {
      return false;
    }
    
    // Check if token is expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      return false;
    }
    
    // Compare the provided token with the stored hashed token
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    return isValid;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    // Clear the refresh token (for logout)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpires: null,
      },
    });
  }
}