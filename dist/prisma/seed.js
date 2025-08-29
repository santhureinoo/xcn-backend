"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    await prisma.xCoinTransaction.deleteMany();
    await prisma.vendorCall.deleteMany();
    await prisma.order.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.exchangeRate.deleteMany();
    await prisma.currency.deleteMany();
    await prisma.regionGameVendor.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  Cleared existing data');
    const regionGameVendors = await prisma.regionGameVendor.createMany({
        data: [
            { region: 'Malaysia', gameName: 'Mobile Legends', vendorName: 'Razor Gold', isActive: true },
            { region: 'Malaysia', gameName: 'Free Fire', vendorName: 'Razor Gold', isActive: true },
            { region: 'Malaysia', gameName: 'PUBG Mobile', vendorName: 'Razor Gold', isActive: true },
            { region: 'Malaysia', gameName: 'Genshin Impact', vendorName: 'Razor Gold', isActive: true },
            { region: 'Malaysia', gameName: 'Call of Duty Mobile', vendorName: 'Razor Gold', isActive: true },
            { region: 'Myanmar', gameName: 'Mobile Legends', vendorName: 'Smile', isActive: true },
            { region: 'Myanmar', gameName: 'Free Fire', vendorName: 'Smile', isActive: true },
            { region: 'Myanmar', gameName: 'PUBG Mobile', vendorName: 'Smile', isActive: true },
            { region: 'Myanmar', gameName: 'Genshin Impact', vendorName: 'Smile', isActive: true },
            { region: 'Myanmar', gameName: 'Call of Duty Mobile', vendorName: 'Smile', isActive: true },
            { region: 'Singapore', gameName: 'Mobile Legends', vendorName: 'Garena', isActive: true },
            { region: 'Singapore', gameName: 'Free Fire', vendorName: 'Garena', isActive: true },
            { region: 'Singapore', gameName: 'PUBG Mobile', vendorName: 'Garena', isActive: true },
            { region: 'Singapore', gameName: 'Genshin Impact', vendorName: 'Garena', isActive: true },
            { region: 'Singapore', gameName: 'Call of Duty Mobile', vendorName: 'Garena', isActive: true },
            { region: 'Thailand', gameName: 'Mobile Legends', vendorName: 'Tencent', isActive: true },
            { region: 'Thailand', gameName: 'Free Fire', vendorName: 'Tencent', isActive: true },
            { region: 'Thailand', gameName: 'PUBG Mobile', vendorName: 'Tencent', isActive: true },
            { region: 'Thailand', gameName: 'Genshin Impact', vendorName: 'Tencent', isActive: true },
            { region: 'Thailand', gameName: 'Call of Duty Mobile', vendorName: 'Tencent', isActive: true },
            { region: 'Brazil', gameName: 'Mobile Legends', vendorName: 'Razor Gold', isActive: true },
            { region: 'Brazil', gameName: 'Free Fire', vendorName: 'Razor Gold', isActive: true },
            { region: 'Brazil', gameName: 'PUBG Mobile', vendorName: 'Razor Gold', isActive: true },
            { region: 'Brazil', gameName: 'Genshin Impact', vendorName: 'Razor Gold', isActive: true },
            { region: 'Brazil', gameName: 'Call of Duty Mobile', vendorName: 'Razor Gold', isActive: true },
            { region: 'Indonesia', gameName: 'Mobile Legends', vendorName: 'Razor Gold', isActive: true },
            { region: 'Indonesia', gameName: 'Free Fire', vendorName: 'Razor Gold', isActive: true },
            { region: 'Indonesia', gameName: 'PUBG Mobile', vendorName: 'Razor Gold', isActive: true },
            { region: 'Indonesia', gameName: 'Genshin Impact', vendorName: 'Razor Gold', isActive: true },
            { region: 'Vietnam', gameName: 'Mobile Legends', vendorName: 'Garena', isActive: true },
            { region: 'Vietnam', gameName: 'Free Fire', vendorName: 'Garena', isActive: true },
            { region: 'Vietnam', gameName: 'PUBG Mobile', vendorName: 'Garena', isActive: true },
            { region: 'Vietnam', gameName: 'Genshin Impact', vendorName: 'Garena', isActive: true },
            { region: 'Philippines', gameName: 'Mobile Legends', vendorName: 'Garena', isActive: true },
            { region: 'Philippines', gameName: 'Free Fire', vendorName: 'Garena', isActive: true },
            { region: 'Philippines', gameName: 'PUBG Mobile', vendorName: 'Garena', isActive: true },
            { region: 'Philippines', gameName: 'Genshin Impact', vendorName: 'Garena', isActive: true },
            { region: 'Malaysia', gameName: 'Arena of Valor', vendorName: 'Razor Gold', isActive: false },
            { region: 'Myanmar', gameName: 'Arena of Valor', vendorName: 'Smile', isActive: false },
            { region: 'Singapore', gameName: 'Arena of Valor', vendorName: 'Garena', isActive: false },
        ],
    });
    console.log('🎮 Created region-game-vendor relationships');
    const currencies = await prisma.currency.createMany({
        data: [
            {
                code: 'XCN',
                name: 'X Coin',
                symbol: 'XCN',
                isActive: true,
            },
            {
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
            },
            {
                code: 'MYR',
                name: 'Malaysian Ringgit',
                symbol: 'RM',
                isActive: true,
            },
            {
                code: 'SGD',
                name: 'Singapore Dollar',
                symbol: 'S$',
                isActive: true,
            },
            {
                code: 'THB',
                name: 'Thai Baht',
                symbol: '฿',
                isActive: true,
            },
            {
                code: 'MMK',
                name: 'Myanmar Kyat',
                symbol: 'K',
                isActive: true,
            },
            {
                code: 'BRL',
                name: 'Brazilian Real',
                symbol: 'R$',
                isActive: true,
            },
            {
                code: 'IDR',
                name: 'Indonesian Rupiah',
                symbol: 'Rp',
                isActive: true,
            },
            {
                code: 'VND',
                name: 'Vietnamese Dong',
                symbol: '₫',
                isActive: true,
            },
            {
                code: 'PHP',
                name: 'Philippine Peso',
                symbol: '₱',
                isActive: true,
            },
        ],
    });
    console.log('💰 Created currencies');
    const exchangeRates = await prisma.exchangeRate.createMany({
        data: [
            {
                fromCurrency: 'USD',
                toCurrency: 'XCN',
                rate: 100.0,
                trend: 'STABLE',
                change24h: 0.5,
            },
            {
                fromCurrency: 'MYR',
                toCurrency: 'XCN',
                rate: 95.5,
                trend: 'UP',
                change24h: 1.2,
            },
            {
                fromCurrency: 'SGD',
                toCurrency: 'XCN',
                rate: 75.0,
                trend: 'STABLE',
                change24h: -0.3,
            },
            {
                fromCurrency: 'THB',
                toCurrency: 'XCN',
                rate: 2.8,
                trend: 'DOWN',
                change24h: -1.5,
            },
            {
                fromCurrency: 'MMK',
                toCurrency: 'XCN',
                rate: 0.048,
                trend: 'STABLE',
                change24h: 0.1,
            },
            {
                fromCurrency: 'BRL',
                toCurrency: 'XCN',
                rate: 20.0,
                trend: 'UP',
                change24h: 2.1,
            },
            {
                fromCurrency: 'IDR',
                toCurrency: 'XCN',
                rate: 0.0067,
                trend: 'STABLE',
                change24h: 0.2,
            },
            {
                fromCurrency: 'VND',
                toCurrency: 'XCN',
                rate: 0.0041,
                trend: 'UP',
                change24h: 0.8,
            },
            {
                fromCurrency: 'PHP',
                toCurrency: 'XCN',
                rate: 1.8,
                trend: 'STABLE',
                change24h: -0.1,
            },
        ],
    });
    console.log('📈 Created exchange rates');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await prisma.user.createMany({
        data: [
            {
                email: 'admin@platform.com',
                firstName: 'Admin',
                lastName: 'User',
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true,
                balance: 10000,
                lastLoginAt: new Date(),
            },
            {
                email: 'retailer1@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: hashedPassword,
                role: 'RETAILER',
                isVerified: true,
                balance: 500,
                lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
                email: 'retailer2@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                password: hashedPassword,
                role: 'RETAILER',
                isVerified: false,
                balance: 250,
                lastLoginAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            },
            {
                email: 'retailer3@example.com',
                firstName: 'Alice',
                lastName: 'Johnson',
                password: hashedPassword,
                role: 'RETAILER',
                isVerified: true,
                balance: 750,
                lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
            {
                email: 'reseller1@example.com',
                firstName: 'Mike',
                lastName: 'Wilson',
                password: hashedPassword,
                role: 'RESELLER',
                isVerified: true,
                balance: 2000,
                lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
            {
                email: 'reseller2@example.com',
                firstName: 'Sarah',
                lastName: 'Brown',
                password: hashedPassword,
                role: 'RESELLER',
                isVerified: true,
                balance: 1500,
                lastLoginAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
            },
        ],
    });
    console.log('👥 Created users');
    const createdUsers = await prisma.user.findMany();
    const retailers = createdUsers.filter(user => user.role === 'RETAILER');
    const resellers = createdUsers.filter(user => user.role === 'RESELLER');
    console.log('💳 Creating transactions...');
    for (let i = 0; i < retailers.length; i++) {
        const retailer = retailers[i];
        await prisma.transaction.create({
            data: {
                userId: retailer.id,
                type: 'RETAILER_XCOIN_PURCHASE',
                status: 'COMPLETED',
                xCoinAmount: 1000,
                fromAmount: 100,
                fromCurrency: 'USD',
                totalCost: 100,
                exchangeRate: 100,
                processingFee: 2.5,
                paymentMethod: 'Bank Transfer',
                paymentReference: `TXN${Date.now()}${i}`,
                notes: 'XCoin purchase via bank transfer',
                adminNotes: 'Verified and approved',
                createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            },
        });
        await prisma.transaction.create({
            data: {
                userId: retailer.id,
                type: 'RETAILER_PACKAGE_PURCHASE',
                status: 'COMPLETED',
                xCoinAmount: 200,
                gameUserId: `${retailer.firstName.toLowerCase()}123`,
                serverId: 'SEA-001',
                playerName: retailer.firstName,
                region: 'Malaysia',
                notes: 'Mobile Legends diamond purchase',
                createdAt: new Date(Date.now() - (i + 2) * 12 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - (i + 2) * 12 * 60 * 60 * 1000 + 30 * 60 * 1000),
            },
        });
    }
    for (let i = 0; i < Math.min(2, retailers.length); i++) {
        const retailer = retailers[i];
        await prisma.transaction.create({
            data: {
                userId: retailer.id,
                type: 'RETAILER_XCOIN_PURCHASE',
                status: 'PENDING',
                xCoinAmount: 500,
                fromAmount: 50,
                fromCurrency: 'USD',
                totalCost: 50,
                exchangeRate: 100,
                processingFee: 1.25,
                paymentMethod: 'Bank Transfer',
                paymentReference: `TXN${Date.now()}${i}PENDING`,
                paymentProof: 'https://example.com/payment-proof.jpg',
                notes: 'Waiting for admin approval',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
        });
    }
    for (let i = 0; i < resellers.length; i++) {
        const reseller = resellers[i];
        await prisma.transaction.create({
            data: {
                userId: reseller.id,
                type: 'RESELLER_BULK_PURCHASE',
                status: 'COMPLETED',
                requestedAmount: 5000,
                approvedAmount: 5000,
                fromAmount: 500,
                fromCurrency: 'USD',
                totalCost: 500,
                exchangeRate: 100,
                processingFee: 12.5,
                paymentMethod: 'Wire Transfer',
                paymentReference: `BULK${Date.now()}${i}`,
                notes: 'Bulk purchase for reseller operations',
                adminNotes: 'Verified reseller credentials and approved',
                createdAt: new Date(Date.now() - (i + 1) * 48 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - (i + 1) * 48 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            },
        });
    }
    if (resellers.length > 0) {
        await prisma.transaction.create({
            data: {
                userId: resellers[0].id,
                type: 'RESELLER_BULK_PURCHASE',
                status: 'PENDING',
                requestedAmount: 10000,
                fromAmount: 1000,
                fromCurrency: 'USD',
                totalCost: 1000,
                exchangeRate: 100,
                processingFee: 25,
                paymentMethod: 'Wire Transfer',
                paymentReference: `BULK${Date.now()}PENDING`,
                paymentProof: 'https://example.com/bulk-payment-proof.jpg',
                notes: 'Large bulk purchase request',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
        });
    }
    if (retailers.length > 0) {
        await prisma.transaction.create({
            data: {
                userId: retailers[0].id,
                type: 'RETAILER_XCOIN_PURCHASE',
                status: 'FAILED',
                xCoinAmount: 300,
                fromAmount: 30,
                fromCurrency: 'USD',
                totalCost: 30,
                exchangeRate: 100,
                processingFee: 0.75,
                paymentMethod: 'Credit Card',
                paymentReference: `FAILED${Date.now()}1`,
                notes: 'Payment failed due to insufficient funds',
                adminNotes: 'Credit card declined by bank',
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 5 * 60 * 1000),
            },
        });
    }
    if (resellers.length > 0) {
        await prisma.transaction.create({
            data: {
                userId: resellers[0].id,
                type: 'RESELLER_BULK_PURCHASE',
                status: 'CANCELLED',
                requestedAmount: 15000,
                fromAmount: 1500,
                fromCurrency: 'USD',
                totalCost: 1500,
                exchangeRate: 100,
                processingFee: 37.5,
                paymentMethod: 'Wire Transfer',
                paymentReference: `REJECTED${Date.now()}1`,
                notes: 'Large bulk purchase request',
                adminNotes: 'Rejected due to incomplete KYC documentation',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
            },
        });
    }
    if (retailers.length >= 2) {
        await prisma.transaction.create({
            data: {
                userId: retailers[1].id,
                type: 'RETAILER_XCOIN_PURCHASE',
                status: 'COMPLETED',
                xCoinAmount: 800,
                fromAmount: 80,
                fromCurrency: 'USD',
                totalCost: 80,
                exchangeRate: 100,
                processingFee: 2,
                paymentMethod: 'Bank Transfer',
                paymentReference: `TODAY${Date.now()}1`,
                notes: 'Quick XCoin purchase',
                adminNotes: 'Auto-approved',
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
        });
        await prisma.transaction.create({
            data: {
                userId: retailers[2].id,
                type: 'RETAILER_PACKAGE_PURCHASE',
                status: 'COMPLETED',
                xCoinAmount: 300,
                gameUserId: 'alice789',
                serverId: 'SEA-002',
                playerName: 'AliceGamer',
                region: 'Singapore',
                notes: 'Free Fire diamond purchase',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000),
            },
        });
    }
    console.log('💳 Created transactions');
    const sampleUsers = await prisma.user.findMany({ take: 3 });
    if (sampleUsers.length > 0) {
        await prisma.xCoinTransaction.createMany({
            data: [
                {
                    userId: sampleUsers[0].id,
                    type: 'PURCHASE',
                    amount: 1000,
                    description: 'Purchased XCoins with USD',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[1].id,
                    type: 'PURCHASE',
                    amount: 500,
                    description: 'Purchased XCoins with MYR',
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[0].id,
                    type: 'SPEND',
                    amount: -200,
                    description: 'Purchased Mobile Legends diamonds',
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[2].id,
                    type: 'SPEND',
                    amount: -150,
                    description: 'Purchased Free Fire diamonds',
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[1].id,
                    type: 'PURCHASE',
                    amount: 750,
                    description: 'Purchased XCoins with SGD',
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[2].id,
                    type: 'PURCHASE',
                    amount: 5000,
                    description: 'Bulk XCoin purchase approved',
                    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[2].id,
                    type: 'SPEND',
                    amount: -1000,
                    description: 'Reseller distribution to retailers',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
                {
                    userId: sampleUsers[0].id,
                    type: 'REFUND',
                    amount: 100,
                    description: 'Refund for failed game top-up',
                    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                },
            ],
        });
        console.log('🪙 Created XCoin transactions');
    }
    const packageTransactions = await prisma.transaction.findMany({
        where: { type: 'RETAILER_PACKAGE_PURCHASE' },
        take: 3,
    });
    for (let i = 0; i < packageTransactions.length; i++) {
        const transaction = packageTransactions[i];
        const order = await prisma.order.create({
            data: {
                packageKeywords: 'Mobile Legends',
                totalAmount: transaction.approvedAmount || 0,
                transactionId: transaction.id,
                gameUserId: transaction.gameUserId || `user${i + 1}`,
                serverId: transaction.serverId || 'SEA-001',
                playerName: transaction.playerName || `Player${i + 1}`,
                status: 'COMPLETED',
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            },
        });
        await prisma.vendorCall.create({
            data: {
                orderId: order.id,
                vendorName: 'Razor Gold',
                vendorPackageCode: 'ML_1000',
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            },
        });
    }
    console.log('📦 Created orders and vendor calls');
    const finalStats = await Promise.all([
        prisma.user.count(),
        prisma.transaction.count(),
        prisma.order.count(),
        prisma.xCoinTransaction.count(),
        prisma.currency.count(),
        prisma.exchangeRate.count(),
        prisma.vendorCall.count(),
        prisma.regionGameVendor.count(),
    ]);
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Users: ${finalStats[0]}`);
    console.log(`   Transactions: ${finalStats[1]}`);
    console.log(`   Orders: ${finalStats[2]}`);
    console.log(`   XCoin Transactions: ${finalStats[3]}`);
    console.log(`   Currencies: ${finalStats[4]}`);
    console.log(`   Exchange Rates: ${finalStats[5]}`);
    console.log(`   Vendor Calls: ${finalStats[6]}`);
    console.log(`   Region-Game-Vendor Relationships: ${finalStats[7]}`);
    console.log('\n✅ Database is ready for testing!');
    console.log('\n🔑 Test Accounts:');
    console.log('   Admin: admin@platform.com / password123');
    console.log('   Retailer: retailer1@example.com / password123');
    console.log('   Reseller: reseller1@example.com / password123');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map