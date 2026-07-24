import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { DepartmentService } from './department.service';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { PermissionGuard } from '../role/guards/permission.guard';
import { RequirePermission } from '../role/decorators/require-permission.decorator';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /** List all departments — used to populate dropdowns in the frontend */
  @Get()
  @Public()
  findAll() {
    return this.departmentService.findAll();
  }

  /** Create a new department */
  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('manage_departments')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto.name, dto.description);
  }

  /** Assign a user to a department */
  @Post('assign')
  @UseGuards(PermissionGuard)
  @RequirePermission('manage_departments')
  @HttpCode(HttpStatus.OK)
  assign(@Body() dto: AssignDepartmentDto) {
    return this.departmentService.assignUserDepartment(dto.userId, dto.departmentId);
  }
}

