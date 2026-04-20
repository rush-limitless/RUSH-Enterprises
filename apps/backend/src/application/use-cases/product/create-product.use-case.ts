import { Injectable, Inject } from "@nestjs/common";
import type { IProductRepository } from "../../../domain/repositories";
import type { Product, ProductType } from "../../../domain/entities";

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject("IProductRepository")
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(data: Omit<Product, "id">): Promise<Product> {
    if (data.type === ("DIGITAL" as ProductType)) {
      data.stock = null;
    }
    return this.productRepo.create(data);
  }
}
