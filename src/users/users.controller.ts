import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard) // Only admins can create users
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        message: 'User created successfully. Setup email sent to user.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toLowerCase(),
          status: user.status.toLowerCase(),
          balance: user.balance,
          smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
          totalSpent: user.totalSpent,
          totalOrders: user.totalOrders,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          // Include reseller fields if applicable
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
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create user',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @UseGuards(AdminGuard) // Only admins can view all users
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const pageNum = parseInt(page || '1');
      const limitNum = parseInt(limit || '50');
      const skip = (pageNum - 1) * limitNum;

      const result = await this.usersService.findAll({
        role: role || '',
        status: status || '',
        search: search || '',
        skip,
        take: limitNum,
        sortBy: sortBy || '',
        sortOrder: sortOrder || 'asc',
      });

      // Format users for frontend
      const formattedUsers = result.users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
        balance: user.balance,
        smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
        totalSpent: user.totalSpent,
        totalOrders: user.totalOrders,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        // Include reseller fields if applicable
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
      }));

      return {
        success: true,
        users: formattedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum),
          hasMore: result.hasMore,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch users',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  async getUserStats() {
    try {
      const stats = await this.usersService.getUserStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch user statistics',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('balance')
  async getBalance(@Request() req) {
    try {
      // Debug logging
      console.log('Request user:', req.user);
      console.log('request');
      // console.log('Request headers:', req.headers);
    
      if (!req.user || !req.user.userId) {
        throw new HttpException(
          {
            success: false,
            message: 'User not authenticated or user ID missing',
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.usersService.findById(req.user.userId);
      if (!user) {
        console.log('User not found in database for ID:', req.user.userId);
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        balance: user.balance || 0,
        smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
        currency: 'XCN',
      };
    } catch (error) {
      console.error('Balance endpoint error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch balance',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('smile-balance/:region')
  async getSmileCoinBalanceByRegion(@Request() req, @Param('region') region: string) {
    try {
      if (!req.user || !req.user.userId) {
        throw new HttpException(
          {
            success: false,
            message: 'User not authenticated or user ID missing',
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.usersService.findById(req.user.userId);
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Find the smile coin balance for the specified region
      const smileCoinBalance = user.smileCoinBalances?.find(balance => balance.region === region);

      return {
        success: true,
        balance: smileCoinBalance ? smileCoinBalance.balance : 0,
        region: region,
        currency: 'Smile Coins',
      };
    } catch (error) {
      console.error('Smile coin balance by region endpoint error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch smile coin balance',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toLowerCase(),
          status: user.status.toLowerCase(),
          balance: user.balance,
          smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
          totalSpent: user.totalSpent,
          totalOrders: user.totalOrders,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          // Include reseller fields if applicable
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
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch user',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return {
        success: true,
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toLowerCase(),
          status: user.status.toLowerCase(),
          balance: user.balance,
          smileCoinBalances: user.smileCoinBalances ? user.smileCoinBalances : [],
          totalSpent: user.totalSpent,
          totalOrders: user.totalOrders,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          // Include reseller fields if applicable
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
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update user',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete user',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/toggle-status')
  @UseGuards(AdminGuard)
  async toggleStatus(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const newStatus : any = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const updatedUser = await this.usersService.update(id, { status: newStatus.toLowerCase() });

      return {
        success: true,
        message: `User ${newStatus.toLowerCase()} successfully`,
        user: {
          id: updatedUser.id,
          status: updatedUser.status.toLowerCase(),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to toggle user status',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/recharge')
  @UseGuards(AdminGuard)
  async rechargeBalance(
    @Param('id') id: string,
    @Body() body: { amount: number; notes?: string },
    @Request() req
  ) {
    try {
      const { amount, notes } = body;

      // Validate amount
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid recharge amount. Amount must be a positive number.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user exists
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const previousBalance = user.balance;

      // Update user balance
      await this.usersService.updateBalance(id, amount);

      // Get updated user data
      const updatedUser = await this.usersService.findById(id);

      if (!updatedUser) {
        throw new HttpException(
          {
            success: false,
            message: 'Failed to update user balance',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Log the recharge transaction
      // await this.usersService.logRechargeTransaction(
      //   id, 
      //   amount, 
      //   req.user.id, 
      //   notes || `Admin recharge by ${req.user.email}`
      // );

      return {
        success: true,
        user: {
          id: updatedUser.id,
          balance: updatedUser.balance,
        },
        message: `Successfully recharged ${amount.toLocaleString()} XCN to ${user.firstName} ${user.lastName}`,
        transaction: {
          amount,
          previousBalance,
          newBalance: updatedUser.balance,
          rechargedBy: req.user.email,
          timestamp: new Date().toISOString(),
          notes: notes || null,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to recharge user balance',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/recharge-smile')
  @UseGuards(AdminGuard)
  async rechargeSmileBalance(
    @Param('id') id: string,
    @Body() body: { amount: number; region: string; notes?: string },
    @Request() req
  ) {
    try {
      const { amount, region, notes } = body;

      // Validate amount and region
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid recharge amount. Amount must be a positive number.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!region || typeof region !== 'string') {
        throw new HttpException(
          {
            success: false,
            message: 'Region is required and must be a string.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user exists
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Update user Smile coin balance for specific region
      const updatedBalance = await this.usersService.updateSmileBalance(id, region, amount);

      // Get updated user with all smile coin balances
      const updatedUser = await this.usersService.findById(id);

      return {
        success: true,
        user: {
          id: user.id,
          region: region,
          smileCoinBalances: updatedUser?.smileCoinBalances || [],
        },
        message: `Successfully recharged ${amount.toLocaleString()} Smile Coins to ${user.firstName} ${user.lastName} for ${region}`,
        transaction: {
          amount,
          region,
          newBalance: updatedBalance,
          rechargedBy: req.user.email,
          timestamp: new Date().toISOString(),
          notes: notes || null,
          currency: 'Smile Coins',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to recharge user Smile coin balance',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/resend-setup')
  @UseGuards(AdminGuard)
  async resendSetupEmail(@Param('id') id: string) {
    try {
      const result = await this.usersService.resendSetupEmail(id);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to resend setup email',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('export')
  @UseGuards(AdminGuard)
  async exportUsers(
    @Body() filters: {
      role?: string;
      status?: string;
      search?: string;
    }
  ) {
    try {
      const result = await this.usersService.findAll({
        ...filters,
        take: 10000, // Export all matching users
      });

      const exportData = result.users.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Role: user.role,
        Status: user.status,
        Balance: user.balance,
        'Total Spent': user.totalSpent,
        Orders: user.totalOrders,
        Created: new Date(user.createdAt).toLocaleDateString(),
        Phone: user.phone || '',
        ...(user.role === 'RESELLER' && {
          Commission: user.commission,
          'Total Earnings': user.totalEarnings,
          'Referral Code': user.referralCode,
          'Downline Count': user.downlineCount,
        }),
      }));

      return {
        success: true,
        data: exportData,
        total: result.total,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to export users',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}