import { VendorService } from './vendor.service';
export declare class VendorRetryService {
    private vendorService;
    private readonly logger;
    constructor(vendorService: VendorService);
    triggerRetryProcessing(): Promise<{
        message: string;
        processed: number;
    }>;
}
