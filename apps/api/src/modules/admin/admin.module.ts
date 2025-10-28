import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DatabaseService } from '../../core/database.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, DatabaseService],
})
export class AdminModule {}