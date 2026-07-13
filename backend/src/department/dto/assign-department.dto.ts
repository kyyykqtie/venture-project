import { IsString } from 'class-validator';

export class AssignDepartmentDto {
  @IsString()
  userId!: string;

  @IsString()
  departmentId!: string;
}
