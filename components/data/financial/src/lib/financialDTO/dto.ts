import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from 'components/data/auth/src/lib/authDTO/dto';
import { Type } from 'components/model/financial-model/src/lib/financial-model.entity';

export class FinancialItem {
  'id': number;
  'type': Type;
  'category': string;
  'amount': number;
  'date': Date;
  'description'?: string;
   user?: User;
}

export class FinancialListResponse {
  'status': number;
  'message': string;
  'data': FinancialItem[];
  'total': number;
}

export class FinancialSingleResponse {
  'status': number;
  'message': string;
  'data': FinancialItem;
}

export class objData {
  page?: number;
  limit?: number;
  fromDate?: Date;
  toDate?: Date;
  type?: string;
  category?: string;
}

export class FinancialDto {
  @IsNotEmpty()
  @IsEnum(Type)
  'type': Type;

  @IsNotEmpty()
  @IsString()
  'Category': string;

  @IsNotEmpty()
  @IsNumber()
  'amount': number;

  @IsOptional()
  @IsString()
  'description': string;
}

export class UpdateFinancialDto {
  @IsOptional()
  @IsEnum(Type)
  'type'?: Type;

  @IsOptional()
  @IsString()
  'Category'?: string;

  @IsOptional()
  @IsNumber()
  'amount'?: number;

  @IsOptional()
  @IsString()
  'Description'?: string;
}
