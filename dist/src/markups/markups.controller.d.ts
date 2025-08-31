import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
export declare class MarkupsController {
    private readonly markupsService;
    constructor(markupsService: MarkupsService);
    create(createMarkupDto: CreateMarkupDto): Promise<{
        success: boolean;
        markup: any;
        message: string;
    }>;
    findAll(isActive?: string, search?: string, markupType?: 'percentage' | 'flat', page?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
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
    findOne(id: string): Promise<{
        success: boolean;
        markup: any;
    }>;
    update(id: string, updateMarkupDto: UpdateMarkupDto): Promise<{
        success: boolean;
        markup: any;
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    exportMarkups(filters: {
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
