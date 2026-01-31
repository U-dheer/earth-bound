import { Type } from 'class-transformer';
import { IsDate, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCsrDto {
  // @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsArray()
  location: [number, number] | null;
}
