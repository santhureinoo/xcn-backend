import { Controller, Post, Body, UseGuards, Request, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Login endpoint
   * Expected request body:
   * {
   *   "email": "user@example.com",
   *   "password": "password123"
   * }
   * 
   * Response format:
   * {
   *   "token": "jwt_token_here",
   *   "user": {
   *     "id": "uuid",
   *     "email": "user@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "role": "retailer"
   *   }
   * }
   */
  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      console.log(req.body);
      const result = await this.authService.login(req.body);
      
      // Ensure response matches frontend expectations
      return {
        token: result.access_token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role.toLowerCase(), // Convert RETAILER to retailer
          status: result.user.status?.toLowerCase(),
          balance: result.user.balance,
          totalSpent: result.user.totalSpent,
          totalOrders: result.user.totalOrders,
          phone: result.user.phone,
          address: result.user.address,
          avatar: result.user.avatar,
          // Include reseller fields if applicable
          ...(result.user.role === 'RESELLER' && {
            commission: result.user.commission,
            totalEarnings: result.user.totalEarnings,
            referralCode: result.user.referralCode,
            referredBy: result.user.referredBy,
            downlineCount: result.user.downlineCount,
          }),
          createdAt: result.user.createdAt,
          lastLoginAt: result.user.lastLoginAt,
        },
        refresh_token: result.refresh_token,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Login failed',
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Register endpoint
   * Expected request body:
   * {
   *   "email": "newuser@example.com",
   *   "password": "SecurePassword123!",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "phone": "+1234567890",
   *   "role": "retailer" // optional, defaults to retailer
   * }
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      
      // Ensure response matches frontend expectations
      return {
        token: result.access_token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role.toLowerCase(),
          status: result.user.status?.toLowerCase(),
          balance: result.user.balance || 0,
          totalSpent: result.user.totalSpent || 0,
          totalOrders: result.user.totalOrders || 0,
          phone: result.user.phone,
          address: result.user.address,
          avatar: result.user.avatar,
          createdAt: result.user.createdAt,
          isVerified: result.user.isVerified,
        },
        refresh_token: result.refresh_token,
        message: 'Registration successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Registration failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Forgot password endpoint
   * Expected request body:
   * {
   *   "email": "user@example.com"
   * }
   */
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      const result = await this.authService.forgotPassword(body.email);
      return {
        ...result,
        message: 'Password reset instructions sent to your email',
        success: true
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Failed to process forgot password request',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Reset password endpoint
   * Expected request body:
   * {
   *   "token": "reset_token_here",
   *   "password": "NewSecurePassword123!"
   * }
   */
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      const result = await this.authService.resetPassword(body.token, body.password);
      return {
        ...result,
        message: 'Password reset successful',
        success: true
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Password reset failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Verify OTP endpoint
   * Expected request body:
   * {
   *   "email": "user@example.com",
   *   "otp": "123456"
   * }
   */
  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    try {
      const result = await this.authService.verifyOTP(body.email, body.otp);
      return {
        ...result,
        message: 'OTP verification successful',
        success: true,
        isVerified: true,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'OTP verification failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get user profile endpoint
   * Requires JWT authentication
   * Returns current user information
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    try {
      // Return user info in the same format as login
      return {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role.toLowerCase(),
        status: req.user.status?.toLowerCase(),
        balance: req.user.balance,
        totalSpent: req.user.totalSpent,
        totalOrders: req.user.totalOrders,
        phone: req.user.phone,
        address: req.user.address,
        avatar: req.user.avatar,
        // Include reseller fields if applicable
        ...(req.user.role === 'RESELLER' && {
          commission: req.user.commission,
          totalEarnings: req.user.totalEarnings,
          referralCode: req.user.referralCode,
          referredBy: req.user.referredBy,
          downlineCount: req.user.downlineCount,
        }),
        createdAt: req.user.createdAt,
        lastLoginAt: req.user.lastLoginAt,
        isVerified: req.user.isVerified,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to get user profile',
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Refresh token endpoint
   * Expected request body:
   * {
   *   "refresh_token": "refresh_token_here"
   * }
   */
  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const result = await this.authService.refreshAccessToken(body.refresh_token);
      return {
        token: result.access_token,
        refresh_token: result.refresh_token,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Token refresh failed',
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Logout endpoint (optional - for server-side token invalidation)
   * Requires JWT authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    try {
      // Optionally invalidate refresh token on server side
      await this.authService.logout(req.user.id);
      return {
        message: 'Logout successful',
        success: true,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Logout failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}