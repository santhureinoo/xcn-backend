import { PrismaService } from '../prisma/prisma.service';
interface VendorCallResult {
    success: boolean;
    vendorOrderId?: string;
    vendorResponse: any;
    error?: string;
    shouldRetry: boolean;
}
export declare class VendorService {
    private prisma;
    private readonly logger;
    private readonly vendorConfigs;
    private readonly retryConfig;
    constructor(prisma: PrismaService);
    processVendorCall(orderId: string, vendorName: string, vendorPackageCode: string, playerId: string, serverId: string): Promise<VendorCallResult>;
    private attemptVendorCall;
    private makeVendorApiCall;
    private callSmileCoinApi;
    private callRazorGoldApi;
    private isRetryableSmileCoinError;
    private shouldRetryCall;
    private calculateRetryDelay;
    getPendingRetries(): Promise<any[]>;
    processPendingRetries(): Promise<void>;
}
export {};
