import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';

@Injectable()
export class MarkupsService {
  constructor(private prisma: PrismaService) {}

  // Helper method to validate markup data
  private validateMarkupData(data: CreateMarkupDto | UpdateMarkupDto) {
    const hasPercentage = data.percentageAdd !== null && data.percentageAdd !== undefined;
    const hasFlatAmount = data.flatAmountAdd !== null && data.flatAmountAdd !== undefined;

    if (hasPercentage && hasFlatAmount) {
      throw new BadRequestException('Cannot set both percentage and flat amount markup');
    }

    if (!hasPercentage && !hasFlatAmount) {
      throw new BadRequestException('Must set either percentage or flat amount markup');
    }

    if (hasPercentage && data.percentageAdd! < 0) {
      throw new BadRequestException('Percentage markup cannot be negative');
    }

    if (hasFlatAmount && data.flatAmountAdd! < 0) {
      throw new BadRequestException('Flat amount markup cannot be negative');
    }
  }

  // Helper method to transform markup data for frontend response
  private transformMarkupForResponse(markupData: any) {
    return {
      ...markupData,
      // Ensure numeric fields are properly typed
      percentageAdd: markupData.percentageAdd ? Number(markupData.percentageAdd) : null,
      flatAmountAdd: markupData.flatAmountAdd ? Number(markupData.flatAmountAdd) : null,
      // Add computed fields
      markupType: markupData.percentageAdd ? 'percentage' : 'flat',
      isExpired: markupData.endDate ? new Date(markupData.endDate) < new Date() : false,
    };
  }

  async create(createMarkupDto: CreateMarkupDto) {
    try {
      // Validate markup data
      this.validateMarkupData(createMarkupDto);

      const markupData = await this.prisma.markup.create({
        data: {
          name: createMarkupDto.name,
          description: createMarkupDto.description || null,
          percentageAdd: createMarkupDto.percentageAdd || null,
          flatAmountAdd: createMarkupDto.flatAmountAdd || null,
          isActive: createMarkupDto.isActive ?? true,
          startDate: createMarkupDto.startDate ? new Date(createMarkupDto.startDate) : null,
          endDate: createMarkupDto.endDate ? new Date(createMarkupDto.endDate) : null,
          createdBy: createMarkupDto.createdBy || null,
        },
      });

      const transformedMarkup = this.transformMarkupForResponse(markupData);

      return {
        success: true,
        markup: transformedMarkup,
        message: 'Markup created successfully'
      };
    } catch (error) {
      console.error('Error creating markup:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create markup: ' + error.message);
    }
  }

  async findAll(filters: {
    isActive?: boolean;
    search?: string;
    markupType?: 'percentage' | 'flat';
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        isActive,
        search,
        markupType,
        skip = 0,
        take = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where clause
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ];
      }

      if (markupType === 'percentage') {
        where.percentageAdd = { not: null };
      } else if (markupType === 'flat') {
        where.flatAmountAdd = { not: null };
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'percentageAdd') {
        orderBy.percentageAdd = sortOrder;
      } else if (sortBy === 'flatAmountAdd') {
        orderBy.flatAmountAdd = sortOrder;
      } else if (sortBy === 'updatedAt') {
        orderBy.updatedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [markups, total] = await Promise.all([
        this.prisma.markup.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            _count: {
              select: { packages: true }
            }
          }
        }),
        this.prisma.markup.count({ where }),
      ]);

      // Transform markups for response
      const transformedMarkups = markups.map(markup => ({
        ...this.transformMarkupForResponse(markup),
        packageCount: markup._count.packages,
      }));

      // Calculate pagination info
      const totalPages = Math.ceil(total / take);
      const currentPage = Math.floor(skip / take) + 1;
      const hasMore = skip + take < total;

      return {
        success: true,
        markups: transformedMarkups,
        pagination: {
          page: currentPage,
          limit: take,
          total,
          totalPages,
          hasMore,
        }
      };
    } catch (error) {
      console.error('Error fetching markups:', error);
      throw new BadRequestException('Failed to fetch markups: ' + error.message);
    }
  }

  async findById(id: string) {
    try {
      const markup = await this.prisma.markup.findUnique({
        where: { id },
        include: {
          packages: {
            select: {
              id: true,
              name: true,
              price: true,
              basePrice: true,
            }
          },
          _count: {
            select: { packages: true }
          }
        }
      });

      if (!markup) {
        throw new NotFoundException(`Markup with ID ${id} not found`);
      }

      const transformedMarkup = {
        ...this.transformMarkupForResponse(markup),
        packages: markup.packages,
        packageCount: markup._count.packages,
      };

      return {
        success: true,
        markup: transformedMarkup
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching markup:', error);
      throw new BadRequestException('Failed to fetch markup: ' + error.message);
    }
  }

  async update(id: string, updateMarkupDto: UpdateMarkupDto) {
    try {
      // Check if markup exists
      await this.findById(id);

      // Validate markup data
      this.validateMarkupData(updateMarkupDto);

      // Prepare update data
      const updateData: any = {};

      if (updateMarkupDto.name !== undefined) updateData.name = updateMarkupDto.name;
      if (updateMarkupDto.description !== undefined) updateData.description = updateMarkupDto.description;
      if (updateMarkupDto.percentageAdd !== undefined) updateData.percentageAdd = updateMarkupDto.percentageAdd;
      if (updateMarkupDto.flatAmountAdd !== undefined) updateData.flatAmountAdd = updateMarkupDto.flatAmountAdd;
      if (updateMarkupDto.isActive !== undefined) updateData.isActive = updateMarkupDto.isActive;
      if (updateMarkupDto.startDate !== undefined) updateData.startDate = updateMarkupDto.startDate ? new Date(updateMarkupDto.startDate) : null;
      if (updateMarkupDto.endDate !== undefined) updateData.endDate = updateMarkupDto.endDate ? new Date(updateMarkupDto.endDate) : null;
      if (updateMarkupDto.updatedBy !== undefined) updateData.updatedBy = updateMarkupDto.updatedBy;

      const updatedMarkup = await this.prisma.markup.update({
        where: { id },
        data: updateData,
      });

      const transformedMarkup = this.transformMarkupForResponse(updatedMarkup);

      return {
        success: true,
        markup: transformedMarkup,
        message: 'Markup updated successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating markup:', error);
      throw new BadRequestException('Failed to update markup: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      // Check if markup exists
      await this.findById(id);

      // Check if markup is being used by packages
      const packagesUsingMarkup = await this.prisma.package.count({
        where: { markupId: id }
      });

      if (packagesUsingMarkup > 0) {
        throw new BadRequestException(`Cannot delete markup. It is being used by ${packagesUsingMarkup} package(s)`);
      }

      await this.prisma.markup.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Markup deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting markup:', error);
      throw new BadRequestException('Failed to delete markup: ' + error.message);
    }
  }

  async toggleStatus(id: string) {
    try {
      const markup = await this.prisma.markup.findUnique({
        where: { id },
        select: { isActive: true }
      });

      if (!markup) {
        throw new NotFoundException(`Markup with ID ${id} not found`);
      }

      const updatedMarkup = await this.prisma.markup.update({
        where: { id },
        data: { isActive: !markup.isActive },
      });

      return {
        success: true,
        markup: {
          id: updatedMarkup.id,
          isActive: updatedMarkup.isActive
        },
        message: `Markup ${updatedMarkup.isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling markup status:', error);
      throw new BadRequestException('Failed to toggle markup status: ' + error.message);
    }
  }

  async getMarkupStats() {
    try {
      const [
        totalMarkups,
        activeMarkups,
        inactiveMarkups,
        percentageMarkups,
        flatMarkups,
        markupsWithPackages,
      ] = await Promise.all([
        this.prisma.markup.count(),
        this.prisma.markup.count({ where: { isActive: true } }),
        this.prisma.markup.count({ where: { isActive: false } }),
        this.prisma.markup.count({ where: { percentageAdd: { not: null } } }),
        this.prisma.markup.count({ where: { flatAmountAdd: { not: null } } }),
        this.prisma.markup.count({ where: { packages: { some: {} } } }),
      ]);

      return {
        success: true,
        stats: {
          totalMarkups,
          activeMarkups,
          inactiveMarkups,
          percentageMarkups,
          flatMarkups,
          markupsWithPackages,
          unusedMarkups: totalMarkups - markupsWithPackages,
        }
      };
    } catch (error) {
      console.error('Error fetching markup stats:', error);
      throw new BadRequestException('Failed to fetch markup statistics: ' + error.message);
    }
  }

  // Helper method to calculate final price with markup
  calculatePriceWithMarkup(basePrice: number, markupId: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const markup = await this.prisma.markup.findUnique({
          where: { id: markupId, isActive: true }
        });

        if (!markup) {
          resolve(basePrice); // Return base price if no markup found
          return;
        }

        let finalPrice = basePrice;

        if (markup.percentageAdd) {
          finalPrice = basePrice + (basePrice * markup.percentageAdd / 100);
        } else if (markup.flatAmountAdd) {
          finalPrice = basePrice + markup.flatAmountAdd;
        }

        resolve(Math.round(finalPrice * 100) / 100); // Round to 2 decimal places
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to get active markups for dropdown
  async getActiveMarkups() {
    try {
      const markups = await this.prisma.markup.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          percentageAdd: true,
          flatAmountAdd: true,
        },
        orderBy: { name: 'asc' }
      });

      return {
        success: true,
        markups: markups.map(markup => ({
          ...markup,
          markupType: markup.percentageAdd ? 'percentage' : 'flat',
          displayValue: markup.percentageAdd 
            ? `${markup.percentageAdd}%` 
            : `+${markup.flatAmountAdd} xCoins`
        }))
      };
    } catch (error) {
      console.error('Error fetching active markups:', error);
      throw new BadRequestException('Failed to fetch active markups: ' + error.message);
    }
  }

  async exportMarkups(filters: {
    isActive?: boolean;
    search?: string;
    markupType?: 'percentage' | 'flat';
  } = {}) {
    try {
      const where: any = {};

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
      }

      if (filters.markupType === 'percentage') {
        where.percentageAdd = { not: null };
      } else if (filters.markupType === 'flat') {
        where.flatAmountAdd = { not: null };
      }

      const markups = await this.prisma.markup.findMany({
        where,
        include: {
          _count: { select: { packages: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const exportData = markups.map(markup => ({
        'Name': markup.name,
        'Description': markup.description || '',
        'Type': markup.percentageAdd ? 'Percentage' : 'Flat Amount',
        'Value': markup.percentageAdd ? `${markup.percentageAdd}%` : `${markup.flatAmountAdd} xCoins`,
        'Status': markup.isActive ? 'Active' : 'Inactive',
        'Packages Using': markup._count.packages,
        'Start Date': markup.startDate ? markup.startDate.toISOString().split('T')[0] : '',
        'End Date': markup.endDate ? markup.endDate.toISOString().split('T')[0] : '',
        'Created': markup.createdAt.toISOString().split('T')[0],
        'Updated': markup.updatedAt.toISOString().split('T')[0],
      }));

      return {
        success: true,
        data: exportData,
        total: exportData.length
      };
    } catch (error) {
      console.error('Error exporting markups:', error);
      throw new BadRequestException('Failed to export markups: ' + error.message);
    }
  }
}