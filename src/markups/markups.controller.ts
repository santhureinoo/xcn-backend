import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';

@Controller('markups')
export class MarkupsController {
  constructor(private readonly markupsService: MarkupsService) {}

  @Post()
  create(@Body() createMarkupDto: CreateMarkupDto) {
    return this.markupsService.create(createMarkupDto);
  }

  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('markupType') markupType?: 'percentage' | 'flat',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters = {
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      markupType,
      skip: page ? (parseInt(page) - 1) * parseInt(limit || '50') : 0,
      take: limit ? parseInt(limit) : 50,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    return this.markupsService.findAll(filters);
  }

  @Get('stats')
  getMarkupStats() {
    return this.markupsService.getMarkupStats();
  }

  // NEW: Get active markups for dropdown (similar to package vendors)
  @Get('active')
  getActiveMarkups() {
    return this.markupsService.getActiveMarkups();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markupsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkupDto: UpdateMarkupDto) {
    return this.markupsService.update(id, updateMarkupDto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.markupsService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markupsService.remove(id);
  }

  // NEW: Export markups (similar to packages)
  @Post('export')
  async exportMarkups(@Body() filters: {
    isActive?: boolean;
    search?: string;
    markupType?: 'percentage' | 'flat';
  }) {
    try {
      const result = await this.markupsService.exportMarkups(filters);
      return result;
    } catch (error) {
      console.error('Error exporting markups:', error);
      throw error;
    }
  }
}