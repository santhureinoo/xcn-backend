import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { SmileOneService } from './smile-one.service';
import { ProductListRequestDto } from './dto/product-list-request.dto';

@Controller('smile-one')
export class SmileOneController {
  private readonly logger = new Logger(SmileOneController.name);

  constructor(private readonly smileOneService: SmileOneService) {}

  @Get('products')
  async getProductList(@Query('product') product?: string) {
    try {
      const result = await this.smileOneService.getProductListSimple(product);
      return result;
    } catch (error) {
      this.logger.error(`Error getting product list: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @Post('products')
  async getProductListPost(@Body() body: ProductListRequestDto) {
    try {
      // If the client provides all parameters including sign, use them directly
      if (body.sign) {
        const params: Record<string, any> = {
          uid: body.uid,
          email: body.email,
          time: body.time || Math.floor(Date.now() / 1000).toString(),
        };

        // Add optional parameters if provided
        if (body.product) params.product = body.product;
        if (body.productid) params.productid = body.productid;
        if (body.userid) params.userid = body.userid;
        if (body.zoneid) params.zoneid = body.zoneid;

        // Add the provided signature
        params.sign = body.sign;

        return this.smileOneService.makeRequest('smilecoin/api/productlist', params);
      } 
      // Otherwise, use the service to generate the signature
      else {
        return this.smileOneService.getProductList(body);
      }
    } catch (error) {
      this.logger.error(`Error getting product list: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @Post('products/full')
  async getProductListFull(@Body() body: ProductListRequestDto) {
    try {
      // This endpoint always generates the signature server-side
      const result = await this.smileOneService.getProductList(body);
      return result;
    } catch (error) {
      this.logger.error(`Error getting product list: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}