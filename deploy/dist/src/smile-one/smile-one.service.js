"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmileOneService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmileOneService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let SmileOneService = SmileOneService_1 = class SmileOneService {
    httpService;
    configService;
    logger = new common_1.Logger(SmileOneService_1.name);
    baseUrl;
    uid;
    email;
    masterKey;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('SMILE_ONE_BASE_URL') || 'https://www.smile.one';
        console.log(`Using base URL: ${this.baseUrl}`);
        this.uid = this.configService.get('SMILE_ONE_UID') || '1041302';
        this.email = this.configService.get('SMILE_ONE_EMAIL') || 'agent@smileone.com';
        this.masterKey = '74e271b74abc376cb1550b6dd043396c';
    }
    generateSignature(params) {
        const sortedKeys = Object.keys(params).sort();
        let str = '';
        sortedKeys.forEach(key => {
            const value = params[key];
            str += `${key}=${value.toString()}&`;
        });
        str += this.masterKey;
        const firstHash = (0, crypto_1.createHash)('md5').update(str).digest('hex');
        const secondHash = (0, crypto_1.createHash)('md5').update(firstHash).digest('hex');
        return secondHash;
    }
    async makeRequest(endpoint, params = {}) {
        try {
            const requestParams = { ...params };
            requestParams.sign = this.generateSignature(requestParams);
            const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
            const sortedKeys = Object.keys(requestParams).sort();
            let signatureString = '';
            sortedKeys.forEach(key => {
                if (key !== 'sign')
                    signatureString += key + '=' + requestParams[key] + '&';
            });
            signatureString += this.masterKey;
            const firstHash = (0, crypto_1.createHash)('md5').update(signatureString).digest('hex');
            const secondHash = (0, crypto_1.createHash)('md5').update(firstHash).digest('hex');
            console.log('Signature string:', signatureString);
            console.log('First hash:', firstHash);
            console.log('Second hash (signature):', secondHash);
            const formData = new URLSearchParams();
            Object.entries(requestParams).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });
            const formString = formData.toString();
            console.log('Raw form data:', formString);
            console.log('url', url);
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
            const fetchResponse = await fetch(url, {
                method: 'POST',
                headers,
                body: formString
            });
            const text = await fetchResponse.text();
            let data;
            try {
                data = JSON.parse(text);
            }
            catch {
                data = text;
            }
            console.log('Fetch response status:', fetchResponse.status);
            console.log('Fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));
            console.log('Fetch response body:', data);
            if (!fetchResponse.ok) {
                throw new Error(`Fetch error: ${fetchResponse.status} - ${text}`);
            }
            return data;
        }
        catch (error) {
            console.error(`Error making request to SmileOne API: ${error.message}`, error.stack);
            this.logger.error(`Error making request to SmileOne API: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getProductList(requestData = {}) {
        const params = {
            uid: this.uid.toString(),
            email: this.email,
            time: Math.floor(Date.now() / 1000),
        };
        if (requestData.product) {
            params.product = requestData.product.toString();
        }
        console.log('Request parameters:', params);
        return this.makeRequest('smilecoin/api/productlist', params);
    }
    async getProductListSimple(product) {
        return this.getProductList({ product });
    }
    async makeRequestWithParams(params) {
        return this.makeRequest('smilecoin/api/productlist', params);
    }
    testGenerateSignature(params) {
        return this.generateSignature(params);
    }
    testGenerateSignatureWithPostmanParams() {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const params = {
            uid: '557779',
            email: 'skysmile2281@gmail.com',
            product: 'mobilelegends',
            region: 'PH',
            time: timestamp
        };
        return this.debugGenerateSignature(params);
    }
    debugGenerateSignature(params) {
        const sortedKeys = Object.keys(params).sort();
        let str = '';
        sortedKeys.forEach(key => {
            const value = params[key];
            str += `${key}=${value.toString()}&`;
        });
        str += this.masterKey;
        const firstHash = (0, crypto_1.createHash)('md5').update(str).digest('hex');
        const secondHash = (0, crypto_1.createHash)('md5').update(firstHash).digest('hex');
        return {
            signatureString: str,
            firstHash: firstHash,
            secondHash: secondHash
        };
    }
    testDifferentApproaches(params) {
        const sortedKeys = Object.keys(params).sort();
        let str = '';
        sortedKeys.forEach(key => {
            str += key + '=' + params[key] + '&';
        });
        str += this.masterKey;
        const firstHash1 = (0, crypto_1.createHash)('md5').update(str).digest('hex');
        const secondHash1 = (0, crypto_1.createHash)('md5').update(firstHash1).digest('hex');
        const firstHashBuffer = (0, crypto_1.createHash)('md5').update(str).digest();
        const secondHash2 = (0, crypto_1.createHash)('md5').update(firstHashBuffer).digest('hex');
        const firstHashHex = (0, crypto_1.createHash)('md5').update(str).digest('hex');
        const firstHashHexBuffer = Buffer.from(firstHashHex, 'hex');
        const secondHash3 = (0, crypto_1.createHash)('md5').update(firstHashHexBuffer).digest('hex');
    }
    async testWithPostmanParams() {
        const params = {
            uid: '557779',
            email: 'skysmile2281@gmail.com',
            product: 'mobilelegends',
            time: '1755934943903',
            region: 'PH'
        };
        const signature = this.generateSignature(params);
        return this.makeRequestWithParams(params);
    }
};
exports.SmileOneService = SmileOneService;
exports.SmileOneService = SmileOneService = SmileOneService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], SmileOneService);
//# sourceMappingURL=smile-one.service.js.map