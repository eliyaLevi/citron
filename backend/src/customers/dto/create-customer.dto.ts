import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import { CustomerStatus } from '../customer.entity'

export class CreateCustomerDto {
  @IsString()
  @Length(1, 120)
  name: string

  @IsString()
  @Length(1, 30)
  phone: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  productInterest?: string

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus

  @IsOptional()
  @IsBoolean()
  isReturning?: boolean

  @IsOptional()
  @IsDateString()
  lastContactAt?: string | null

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
