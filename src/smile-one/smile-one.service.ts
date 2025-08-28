import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import * as qs from 'qs';
import { ProductListRequestDto } from './dto/product-list-request.dto';

@Injectable()
export class SmileOneService {
  private readonly logger = new Logger(SmileOneService.name);
  private readonly baseUrl: string;
  private readonly uid: string;
  private readonly email: string;
  private readonly masterKey: string; // Master key for signature generation

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Load configuration from environment variables or config service
    this.baseUrl = this.configService.get<string>('SMILE_ONE_BASE_URL') || 'https://www.smile.one';
    console.log(`Using base URL: ${this.baseUrl}`);
    this.uid = this.configService.get<string>('SMILE_ONE_UID') || '1041302';
    this.email = this.configService.get<string>('SMILE_ONE_EMAIL') || 'agent@smileone.com';
    // Master key for signature generation (from Postman script) - MUST be this exact value
    this.masterKey = '74e271b74abc376cb1550b6dd043396c';
  }

  /**
   * Generate signature for SmileOne API
   * All fields are sorted by key value and then encrypted by md5 twice
   * sign=md5(md5("key1=value1&key2=value2&$masterKey"))
   */
  private generateSignature(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();

    let str = '';
    sortedKeys.forEach(key => {
      const value = params[key];
      str += `${key}=${value.toString()}&`;
    });

    str += this.masterKey;

    const firstHash = createHash('md5').update(str).digest('hex');
    const secondHash = createHash('md5').update(firstHash).digest('hex');

    return secondHash;
  }


  /**
   * Make a request to the SmileOne API
   */
  async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    try {
      // Only use uid, email, product, time for both body and signature
      // const allowedKeys = ['uid', 'email', 'product', 'time'];
      // const requestParams: Record<string, string | number> = {};
      // allowedKeys.forEach(key => {
      //   if (params[key] !== undefined && params[key] !== null) {
      //     requestParams[key] = params[key];
      //   }
      // });

      const requestParams = { ...params }; // Include all keys provided

      // Generate and add signature
      requestParams.sign = this.generateSignature(requestParams);

      // Build the URL (no params in URL)
      const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;

      // Debug: log signature string and body
      const sortedKeys = Object.keys(requestParams).sort();
      let signatureString = '';
      sortedKeys.forEach(key => {
        if (key !== 'sign') signatureString += key + '=' + requestParams[key] + '&';
      });
      signatureString += this.masterKey;
      const firstHash = createHash('md5').update(signatureString).digest('hex');
      const secondHash = createHash('md5').update(firstHash).digest('hex');
      console.log('Signature string:', signatureString);
      console.log('First hash:', firstHash);
      console.log('Second hash (signature):', secondHash);

      // Use URLSearchParams for form body serialization
      const formData = new URLSearchParams();
      Object.entries(requestParams).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      const formString = formData.toString();
      console.log('Raw form data:', formString);
      console.log('url', url);

      // Add generic User-Agent header and log headers
      const headers = {
        'User-Agent': 'PostmanRuntime/7.45.0',
        'Accept': '*/*',
        'Postman-Token': '7011ddc2-a19a-476e-9138-5a94fcca2078',
        'Host': 'www.smile.one',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=l3h30hpmreb6uqira2pouuii02; website_path=9e65e334ddae88a3dada7377dc98538b83b8ca097e874a83e2a97d2f7580a4b4a%3A2%3A%7Bi%3A0%3Bs%3A12%3A%22website_path%22%3Bi%3A1%3Bs%3A4%3A%22%2Fbr%2F%22%3B%7D'
      };
      console.log('Request headers:', headers);

      // Make the request using native fetch
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: formString
      });
      const text = await fetchResponse.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      console.log('Fetch response status:', fetchResponse.status);
      console.log('Fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      console.log('Fetch response body:', data);
      if (!fetchResponse.ok) {
        throw new Error(`Fetch error: ${fetchResponse.status} - ${text}`);
      }
      return data;
    } catch (error) {
      console.error(`Error making request to SmileOne API: ${error.message}`, error.stack);
      this.logger.error(`Error making request to SmileOne API: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get product list from SmileOne API with all required parameters
   */
  async getProductList(requestData: Partial<ProductListRequestDto> = {}): Promise<any> {
    // Create parameters with uid, email, and current timestamp
    const params: Record<string, any> = {
      uid: this.uid.toString(),
      email: this.email,
      time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds as string
    };

    // Add optional parameters if provided
    if (requestData.product) {
      params.product = requestData.product.toString();
    }

    // if (requestData.productid) {
    //   params.productid = requestData.productid.toString();
    // }

    // if (requestData.userid) {
    //   params.userid = requestData.userid.toString();
    // }

    // if (requestData.zoneid) {
    //   params.zoneid = requestData.zoneid.toString();
    // }

    // if (requestData.region) {
    //   params.region = requestData.region.toString();
    // }

    console.log('Request parameters:', params);

    return this.makeRequest('smilecoin/api/productlist', params);
  }

  /**
   * Get product list with simple product parameter (backward compatibility)
   */
  async getProductListSimple(product?: string): Promise<any> {
    return this.getProductList({ product });
  }

  /**
   * Make a request with specific parameters (useful for testing with exact Postman values)
   */
  async makeRequestWithParams(params: Record<string, any>): Promise<any> {
    return this.makeRequest('smilecoin/api/productlist', params);
  }

  /**
   * Test method to generate signature with specific parameters for debugging
   * This allows you to verify that our signature generation matches Postman
   */
  testGenerateSignature(params: Record<string, any>): string {
    return this.generateSignature(params);
  }

  /**
   * Test method to generate signature with Postman-like parameters
   * This helps verify our implementation matches Postman's exactly
   */
  testGenerateSignatureWithPostmanParams(): {
    signatureString: string,
    firstHash: string,
    secondHash: string
  } {
    const timestamp = Math.floor(Date.now() / 1000).toString(); // Seconds like Postman
    const params = {
      uid: '557779',
      email: 'skysmile2281@gmail.com',
      product: 'mobilelegends',
      region: 'PH',
      time: timestamp
    };

    return this.debugGenerateSignature(params);
  }

  /**
   * Detailed test method to debug signature generation step by step
   * This will show exactly what string is being generated and each step of the hashing process
   */
  debugGenerateSignature(params: Record<string, any>): {
    signatureString: string,
    firstHash: string,
    secondHash: string
  } {
    // Sort parameters by key (equivalent to ksort in PHP)
    const sortedKeys = Object.keys(params).sort();

    // Build the string (equivalent to foreach loop in PHP)
    let str = '';
    sortedKeys.forEach(key => {
      const value = params[key];
      str += `${key}=${value.toString()}&`;
    });

    // Append master key (equivalent to $m_key in PHP)
    str += this.masterKey;


    // Double MD5 hash (equivalent to md5(md5($str)) in PHP)
    const firstHash = createHash('md5').update(str).digest('hex');
    const secondHash = createHash('md5').update(firstHash).digest('hex');

    return {
      signatureString: str,
      firstHash: firstHash,
      secondHash: secondHash
    };
  }

  /**
   * Test method to try different approaches to signature generation
   * This helps identify if there's a difference in how CryptoJS vs Node.js crypto works
   */
  testDifferentApproaches(params: Record<string, any>): void {
    // Sort parameters by key (equivalent to ksort in PHP)
    const sortedKeys = Object.keys(params).sort();

    // Build the string (equivalent to foreach loop in PHP)
    let str = '';
    sortedKeys.forEach(key => {
      str += key + '=' + params[key] + '&';
    });

    // Append master key (equivalent to $m_key in PHP)
    str += this.masterKey;


    // Approach 1: Our current approach
    const firstHash1 = createHash('md5').update(str).digest('hex');
    const secondHash1 = createHash('md5').update(firstHash1).digest('hex');

    // Approach 2: Try updating with binary data
    const firstHashBuffer = createHash('md5').update(str).digest();
    const secondHash2 = createHash('md5').update(firstHashBuffer).digest('hex');

    // Approach 3: Try updating with hex string as buffer
    const firstHashHex = createHash('md5').update(str).digest('hex');
    const firstHashHexBuffer = Buffer.from(firstHashHex, 'hex');
    const secondHash3 = createHash('md5').update(firstHashHexBuffer).digest('hex');
  }

  /**
   * Test method to make a request with the exact same parameters as Postman
   * This helps identify if there's an issue with the request itself
   */
  async testWithPostmanParams(): Promise<any> {
    // Use the exact same parameters as the working Postman request
    const params = {
      uid: '557779',
      email: 'skysmile2281@gmail.com',
      product: 'mobilelegends',
      time: '1755934943903', // Exact timestamp from working Postman request
      region: 'PH'
    };

    // First test signature generation
    const signature = this.generateSignature(params);

    // Then make the actual request
    return this.makeRequestWithParams(params);
  }
}