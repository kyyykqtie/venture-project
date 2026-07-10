import { Body, Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Public } from '@thallesp/nestjs-better-auth';

class CreateDepartmentDto {
  name: string;
  description?: string;
}

class AssignDepartmentDto {
  userId: string;
  departmentId: string;
}

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /** List all departments — used to populate the dropdown in the frontend */
  @Get()
  @Public()
  findAll() {
    return this.departmentService.findAll();
  }

  /** Create a new department (admin only in practice — guarded by ProtectedRoute on frontend) */
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
