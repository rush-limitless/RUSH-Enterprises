import { IsString, IsNumber, IsEnum, IsOptional, Min } from "class-validator";

enum ProductType {
  DIGITAL = "DIGITAL",
  PHYSICAL = "PHYSICAL",
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  alertLimit?: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() stock?: number;
  @IsOptional() @IsNumber() alertLimit?: number;
}
