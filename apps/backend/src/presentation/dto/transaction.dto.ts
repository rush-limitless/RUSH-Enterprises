import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateTransactionDto {
  @IsString()
  caisseId: string;

  @IsNumber()
  amount: number;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  productId?: string;
}
