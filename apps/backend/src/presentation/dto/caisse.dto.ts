import { IsNumber, IsString, IsOptional, Min } from "class-validator";

export class OpenCaisseDto {
  @IsNumber()
  @Min(0)
  openingBalance: number;
}

export class CloseCaisseDto {
  @IsNumber()
  @Min(0)
  realBalance: number;
}

export class CreateTransactionDto {
  @IsString()
  caisseId: string;

  @IsNumber()
  amount: number;

  @IsString()
  type: string; // "SALE" | "EXPENSE"

  @IsString()
  description: string;
}
