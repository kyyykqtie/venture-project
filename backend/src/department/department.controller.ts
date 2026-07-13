import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { DepartmentService } from './department.service';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /** List all departments — used to populate dropdowns in the frontend */
  @Get()
  @Public()
  findAll() {
    return this.departmentService.findAll();
  }

  /** Create a new department (admin-only in practice — guarded by ProtectedRoute on frontend) */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto.name, dto.description);
  }

  /** Assign a user to a department */
  @Post('assign')
  @HttpCode(HttpStatus.OK)
  assign(@Body() dto: AssignDepartmentDto) {
    return this.departmentService.assignUserDepartment(dto.userId, dto.departmentId);
  }
}
