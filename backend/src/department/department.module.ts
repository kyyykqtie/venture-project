import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DatabaseModule } from '../database/database.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}

