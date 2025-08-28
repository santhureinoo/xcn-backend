import { Module } from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { MarkupsController } from './markups.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarkupsController],
  providers: [MarkupsService],
  exports: [MarkupsService], // Export service so other modules can use it
})
export class MarkupsModule {}