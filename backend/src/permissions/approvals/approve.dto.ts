import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ApprovalDecision {
  Approve = 'approve',
  Decline = 'decline',
}

export class ApprovalActionDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  /** Optional reason — required when declining */
  @IsString()
  @IsOptional()
  remarks?: string;
}
