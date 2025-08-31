import { PrismaService } from '../prisma/prisma.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
export declare class MarkupsService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateMarkupData;
    private transformMarkupForResponse;
    create(createMarkupDto: CreateMarkupDto): Promise<{
        success: boolean;
        markup: any;
        message: string;
    }>;
    findAll(filters?: {
        isActive?: boolean;
        search?: string;
        markupType?: 'percentage' | 'flat';
        skip?: number;
        take?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        success: boolean;
        markups: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    findById(id: string): Promise<{
        success: boolean;
        markup: any;
    }>;
    update(id: string, updateMarkupDto: UpdateMarkupDto): Promise<{
        success: boolean;
        markup: any;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        markup: {
            id: string;
            isActive: boolean;
        };
        message: string;
    }>;
    getMarkupStats(): Promise<{
        success: boolean;
        stats: {
            totalMarkups: number;
            activeMarkups: number;
            inactiveMarkups: number;
            percentageMarkups: number;
            flatMarkups: number;
            markupsWithPackages: number;
            unusedMarkups: number;
        };
    }>;
    calculatePriceWithMarkup(basePrice: number, markupId: string): Promise<number>;
    getActiveMarkups(): Promise<{
        success: boolean;
        markups: {
            markupType: string;
            displayValue: string;
            id: string;
            name: string;
            percentageAdd: import("@prisma/client/runtime/library").Decimal | null;
            flatAmountAdd: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    }>;
    exportMarkups(filters?: {
        isActive?: boolean;
        search?: string;
        markupType?: 'percentage' | 'flat';
    }): Promise<{
        success: boolean;
        data: {
            Name: string;
            Description: string;
            Type: string;
            Value: string;
            Status: string;
            'Packages Using': number;
            'Start Date': string;
            'End Date': string;
            Created: string;
            Updated: string;
        }[];
        total: number;
    }>;
}
