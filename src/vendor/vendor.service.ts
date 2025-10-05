import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosResponse } from 'axios';

interface VendorApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

interface SmileCoinRequest {
  playerId: string;
  packageCode: string;
  serverId: string;
  quantity?: number;
}

interface SmileCoinResponse {
  success: boolean;
  orderId?: string;
  message: string;
  errorCode?: string;
  transactionId?: string;
}

interface VendorCallResult {
  success: boolean;
  vendorOrderId?: string;
  vendorResponse: any;
  error?: string;
  shouldRetry: boolean;
}

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);
  
  private readonly vendorConfigs: Record<string, VendorApiConfig> = {
    'SMILE_COIN': {
      baseUrl: process.env.SMILE_COIN_API_URL || 'https://api.smilecoin.dummy/v1',
      apiKey: process.env.SMILE_COIN_API_KEY || 'dummy_smile_api_key',
      timeout: parseInt(process.env.SMILE_COIN_TIMEOUT || '30000'),
    },
    'RAZOR_GOLD': {
      baseUrl: process.env.RAZOR_GOLD_API_URL || 'https://api.razorgold.dummy/v1',
      apiKey: process.env.RAZOR_GOLD_API_KEY || 'dummy_razor_api_key', 
      timeout: parseInt(process.env.RAZOR_GOLD_TIMEOUT || '30000'),
    },
  };

  private readonly retryConfig = {
    maxRetries: parseInt(process.env.VENDOR_MAX_RETRIES || '3'),
    initialDelay: parseInt(process.env.VENDOR_INITIAL_RETRY_DELAY || '5000'),
    backoffMultiplier: parseFloat(process.env.VENDOR_BACKOFF_MULTIPLIER || '2'),
    maxDelay: parseInt(process.env.VENDOR_MAX_RETRY_DELAY || '60000'),
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Main entry point for processing vendor calls with retry logic
   */
  async processVendorCall(
    orderId: string,
    vendorName: string,
    vendorPackageCode: string,
    playerId: string,
    serverId: string
  ): Promise<VendorCallResult> {
    // Create initial vendor call record
    const vendorCall = await this.prisma.vendorCall.create({
      data: {
        orderId,
        vendorName,
        vendorPackageCode,
        status: 'PENDING',
        maxRetries: this.retryConfig.maxRetries,
        retryIntervalMs: this.retryConfig.initialDelay,
        requestPayload: {
          playerId,
          serverId,
          packageCode: vendorPackageCode,
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log('Starting vendor call process for procesVendorcall:', vendorCall.id);

    return this.attemptVendorCall(vendorCall.id, playerId, serverId);
  }

  /**
   * Attempt vendor call with retry logic
   */
  private async attemptVendorCall(
    vendorCallId: string,
    playerId: string,
    serverId: string
  ): Promise<VendorCallResult> {
    const vendorCall = await this.prisma.vendorCall.findUnique({
      where: { id: vendorCallId },
    });

    if (!vendorCall) {
      throw new Error(`VendorCall ${vendorCallId} not found`);
    }

    const startTime = Date.now();

    try {
      // Update attempt tracking
      await this.prisma.vendorCall.update({
        where: { id: vendorCallId },
        data: {
          retryCount: { increment: 1 },
          lastAttemptAt: new Date(),
          status: 'PENDING',
        },
      });

      // Make the actual API call
      const result = await this.makeVendorApiCall(
        vendorCall.vendorName,
        vendorCall.vendorPackageCode,
        playerId,
        serverId
      );

      const responseTime = Date.now() - startTime;

      if (result.success) {
        // Success - update vendor call
        await this.prisma.vendorCall.update({
          where: { id: vendorCallId },
          data: {
            status: 'COMPLETED',
            vendorOrderId: result.vendorOrderId,
            vendorResponse: result.vendorResponse,
            responseTime,
            nextRetryAt: null,
          },
        });

        this.logger.log(
          `✅ Vendor call successful: ${vendorCall.vendorName} - ${vendorCall.vendorPackageCode} - Order: ${result.vendorOrderId}`
        );

        return result;
      } else {
        // Failure - check if we should retry
        const shouldRetry = this.shouldRetryCall(vendorCall, result);

        if (shouldRetry && vendorCall.retryCount < vendorCall.maxRetries) {
          // Schedule retry
          const nextRetryDelay = this.calculateRetryDelay(vendorCall.retryCount);
          const nextRetryAt = new Date(Date.now() + nextRetryDelay);

          await this.prisma.vendorCall.update({
            where: { id: vendorCallId },
            data: {
              status: 'PENDING',
              errorMessage: result.error,
              vendorResponse: result.vendorResponse,
              responseTime,
              nextRetryAt,
              retryIntervalMs: nextRetryDelay,
            },
          });

          this.logger.warn(
            `⏳ Scheduling retry ${vendorCall.retryCount + 1}/${vendorCall.maxRetries} for ${vendorCall.vendorName} in ${nextRetryDelay}ms`
          );

          // Schedule the retry (in production, use a queue like Bull)
          setTimeout(() => {
            console.log('Retrying vendor call now... in setTimeout');
            this.attemptVendorCall(vendorCallId, playerId, serverId);
          }, nextRetryDelay);

          return {
            success: false,
            error: `Retrying... (${vendorCall.retryCount}/${vendorCall.maxRetries})`,
            vendorResponse: result.vendorResponse,
            shouldRetry: true,
          };
        } else {
          // Max retries reached or non-retryable error
          await this.prisma.vendorCall.update({
            where: { id: vendorCallId },
            data: {
              status: 'FAILED',
              errorMessage: result.error,
              vendorResponse: result.vendorResponse,
              responseTime,
              nextRetryAt: null,
            },
          });

          this.logger.error(
            `❌ Vendor call failed permanently: ${vendorCall.vendorName} - ${result.error}`
          );

          return result;
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      await this.prisma.vendorCall.update({
        where: { id: vendorCallId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          responseTime,
          vendorResponse: {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        },
      });

      this.logger.error(`💥 Vendor call exception: ${error.message}`);

      return {
        success: false,
        error: error.message,
        vendorResponse: { error: error.message },
        shouldRetry: false,
      };
    }
  }

  /**
   * Make the actual API call to vendor
   */
  private async makeVendorApiCall(
    vendorName: string,
    packageCode: string,
    playerId: string,
    serverId: string
  ): Promise<VendorCallResult> {

    const vendorExchangRate = await this.prisma.vendorExchangeRate.findFirst({
      where: { id: vendorName}
    });

    const config = this.vendorConfigs[vendorExchangRate?.vendorCurrency || ''];
    
    if (!config) {
      return {
        success: false,
        error: `Unknown vendor: ${vendorName}`,
        vendorResponse: { error: 'Vendor not configured' },
        shouldRetry: false,
      };
    }

    switch (vendorExchangRate?.vendorCurrency) {
      case 'SMILE_COIN':
        return this.callSmileCoinApi(config, packageCode, playerId, serverId);
      case 'RAZOR_GOLD':
        return this.callRazorGoldApi(config, packageCode, playerId, serverId);
      default:
        return {
          success: false,
          error: `Unsupported vendor: ${vendorName}`,
          vendorResponse: { error: 'Vendor not implemented' },
          shouldRetry: false,
        };
    }
  }

  /**
   * Smile Coin API implementation
   */
  private async callSmileCoinApi(
    config: VendorApiConfig,
    packageCode: string,
    playerId: string,
    serverId: string
  ): Promise<VendorCallResult> {
      return {
          success: true,
          vendorOrderId: 'tte', //data.orderId || data.transactionId,
          vendorResponse: {},
          shouldRetry: false,
        };
    try {
      const request: SmileCoinRequest = {
        playerId,
        packageCode,
        serverId,
        quantity: 1,
      };

      const response: AxiosResponse<SmileCoinResponse> = await axios.post(
        `${config.baseUrl}/packages/purchase`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: config.timeout,
        }
      );

      const data = response.data;

      if (data.success) {
        return {
          success: true,
          vendorOrderId: data.orderId || data.transactionId,
          vendorResponse: data,
          shouldRetry: false,
        };
      } else {
        // Check if error is retryable
        const shouldRetry = this.isRetryableSmileCoinError(data.errorCode);
        
        return {
          success: false,
          error: data.message || 'Smile Coin API error',
          vendorResponse: data,
          shouldRetry,
        };
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        // Timeout - retryable
        return {
          success: false,
          error: 'Request timeout',
          vendorResponse: { error: 'timeout', code: error.code },
          shouldRetry: true,
        };
      }

      if (error.response?.status >= 500) {
        // Server error - retryable
        return {
          success: false,
          error: `Server error: ${error.response?.status}`,
          vendorResponse: error.response?.data || { error: 'server_error' },
          shouldRetry: true,
        };
      }

      // Client error (4xx) - usually not retryable
      return {
        success: false,
        error: error.message,
        vendorResponse: error.response?.data || { error: error.message },
        shouldRetry: false,
      };
    }
  }

  /**
   * Razor Gold API implementation (similar structure)
   */
  private async callRazorGoldApi(
    config: VendorApiConfig,
    packageCode: string,
    playerId: string,
    serverId: string
  ): Promise<VendorCallResult> {
    try {
      const request = {
        player_id: playerId,
        package_code: packageCode,
        server_id: serverId,
      };

      const response = await axios.post(
        `${config.baseUrl}/topup`,
        request,
        {
          headers: {
            'X-API-Key': config.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: config.timeout,
        }
      );

      const data = response.data;

      if (data.status === 'success') {
        return {
          success: true,
          vendorOrderId: data.transaction_id,
          vendorResponse: data,
          shouldRetry: false,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Razor Gold API error',
          vendorResponse: data,
          shouldRetry: data.error_code !== 'INVALID_PLAYER_ID', // Example of non-retryable error
        };
      }
    } catch (error) {
      // Similar error handling to Smile Coin
      return {
        success: false,
        error: error.message,
        vendorResponse: error.response?.data || { error: error.message },
        shouldRetry: error.response?.status >= 500 || error.code === 'ECONNABORTED',
      };
    }
  }

  /**
   * Determine if Smile Coin error is retryable
   */
  private isRetryableSmileCoinError(errorCode?: string): boolean {
    const nonRetryableErrors = [
      'INVALID_PLAYER_ID',
      'INVALID_PACKAGE_CODE',
      'INSUFFICIENT_BALANCE',
      'PLAYER_NOT_FOUND',
      'PACKAGE_NOT_AVAILABLE',
    ];

    return !errorCode || !nonRetryableErrors.includes(errorCode);
  }

  /**
   * Determine if we should retry a failed call
   */
  private shouldRetryCall(vendorCall: any, result: VendorCallResult): boolean {
    if (!result.shouldRetry) return false;
    if (vendorCall.retryCount >= vendorCall.maxRetries) return false;
    
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = this.retryConfig.initialDelay * 
      Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Get all pending retries (for background job processing)
   */
  async getPendingRetries(): Promise<any[]> {
    return this.prisma.vendorCall.findMany({
      where: {
        status: 'PENDING',
        nextRetryAt: {
          lte: new Date(),
        },
        retryCount: {
          lt: this.prisma.vendorCall.fields.maxRetries,
        },
      },
      include: {
        order: true,
      },
    });
  }

  /**
   * Retry all pending vendor calls (for cron job)
   */
  async processPendingRetries(): Promise<void> {
    const pendingRetries = await this.getPendingRetries();
    
    this.logger.log(`Processing ${pendingRetries.length} pending retries`);

    for (const vendorCall of pendingRetries) {
      const { playerId, serverId } = vendorCall.requestPayload as any;
      
      console.log('Processing retry for vendor call in process:', vendorCall.id);
      // Process retry without blocking
      this.attemptVendorCall(vendorCall.id, playerId, serverId)
        .catch(error => {
          this.logger.error(`Error processing retry ${vendorCall.id}: ${error.message}`);
        });
    }
  }
}
