import { Injectable, Logger } from '@nestjs/common';
import { VendorService } from './vendor.service';

@Injectable()
export class VendorRetryService {
  private readonly logger = new Logger(VendorRetryService.name);

  constructor(private vendorService: VendorService) {}

  /**
   * Manual trigger for retry processing (for testing/admin use)
   */
  async triggerRetryProcessing(): Promise<{ message: string; processed: number }> {
    try {
      const pendingRetries = await this.vendorService.getPendingRetries();
      await this.vendorService.processPendingRetries();
      
      return {
        message: 'Retry processing triggered successfully',
        processed: pendingRetries.length,
      };
    } catch (error) {
      this.logger.error(`Error in manual retry trigger: ${error.message}`);
      throw error;
    }
  }
}
