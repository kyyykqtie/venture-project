// create-purchase-request.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';

class RequestItemDto {
  @IsString() @IsNotEmpty() description: string;
  @IsNumber() qty: number;
  @IsString() unit: string;
  @IsNumber() unitPrice: number;
}

export class CreatePurchaseRequestDto {
  @IsString() @IsNotEmpty() requestNumber: string;
  @IsString() @IsNotEmpty() title: string;
  @IsNumber() @IsOptional() budget?: number;
  @IsDateString() requestDate: string;
  @IsDateString() @IsOptional() dateNeeded?: string;

  @IsString() @IsOptional() phoneNumber?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() shippingTerms?: string;
  @IsString() @IsOptional() shippingMethod?: string;
  @IsDateString() @IsOptional() delivery?: string;
  @IsString() @IsOptional() remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  items: RequestItemDto[];
}
// no departmentId field — it's derived, not submitted
