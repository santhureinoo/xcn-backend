import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductListRequestDto } from './dto/product-list-request.dto';
export declare class SmileOneService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly uid;
    private readonly email;
    private readonly masterKey;
    constructor(httpService: HttpService, configService: ConfigService);
    private generateSignature;
    makeRequest(endpoint: string, params?: Record<string, any>): Promise<any>;
    getProductList(requestData?: Partial<ProductListRequestDto>): Promise<any>;
    getProductListSimple(product?: string): Promise<any>;
    makeRequestWithParams(params: Record<string, any>): Promise<any>;
    testGenerateSignature(params: Record<string, any>): string;
    testGenerateSignatureWithPostmanParams(): {
        signatureString: string;
        firstHash: string;
        secondHash: string;
    };
    debugGenerateSignature(params: Record<string, any>): {
        signatureString: string;
        firstHash: string;
        secondHash: string;
    };
    testDifferentApproaches(params: Record<string, any>): void;
    testWithPostmanParams(): Promise<any>;
}
