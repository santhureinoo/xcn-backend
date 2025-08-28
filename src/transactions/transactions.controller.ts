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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Query() query: any) {
    try {
      const {
        type,
        status,
        userRole,
        search,
        dateFrom,
        dateTo,
        page = '1',
        limit = '50',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const result = await this.transactionsService.findAll({
        type,
        status,
        userRole,
        search,
        dateFrom,
        dateTo,
        skip,
        take,
        sortBy,
        sortOrder
      });

      return {
        success: true,
        transactions: result.transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit)),
          hasMore: result.hasMore
        }
      };
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('stats')
  async getTransactionStats() {
    try {
      const stats = await this.transactionsService.getTransactionStats();
      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Patch(':id/status')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string }
  ) {
    try {
      const transaction = await this.transactionsService.updateTransactionStatus(
        id,
        body.status,
        body.adminNotes
      );

      return {
        success: true,
        transaction,
        message: `Transaction status updated to ${body.status}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('orders')
  async createOrder(@Request() req, @Body() createOrderDto: any) {
    try {
      const userId = req.user?.userId || req.user?.sub;
    
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      const {
        packageId,
        playerId,
        identifier,
        packageCode,
        gameName,
        playerDetails
      } = createOrderDto;

      // Validate required fields
      if (!packageId || !playerId || !packageCode) {
        return {
          success: false,
          message: 'Missing required fields: packageId, playerId, packageCode'
        };
      }

      const order = await this.transactionsService.createOrder({
        packageId,
        playerId,
        identifier,
        packageCode,
        gameName,
        userId,
        playerDetails
      });

      return {
        success: true,
        order,
        orderId: order.order.id,
        message: 'Order created successfully'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  }
}