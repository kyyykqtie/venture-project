import { IsString } from 'class-validator';
import type { PermissionName } from '../permission.constants';

export class AssignPermissionDto {
  @IsString()
  permission!: PermissionName;
}
