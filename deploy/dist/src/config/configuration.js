"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10) || 3000,
    smileOne: {
        baseUrl: process.env.SMILE_ONE_BASE_URL || 'https://frontsmie.smile.one',
        uid: process.env.SMILE_ONE_UID || '1041302',
        key: process.env.SMILE_ONE_KEY || '74e271b74abc376cb1550b6dd043396c',
        userId: process.env.SMILE_ONE_USER_ID || '17366',
        zoneId: process.env.SMILE_ONE_ZONE_ID || '22001',
    },
});
//# sourceMappingURL=configuration.js.map