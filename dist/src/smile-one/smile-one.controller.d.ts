import { SmileOneService } from './smile-one.service';
import { ProductListRequestDto } from './dto/product-list-request.dto';
export declare class SmileOneController {
    private readonly smileOneService;
    private readonly logger;
    constructor(smileOneService: SmileOneService);
    getProductList(product?: string): Promise<any>;
    getProductListPost(body: ProductListRequestDto): Promise<any>;
    getProductListFull(body: ProductListRequestDto): Promise<any>;
}
