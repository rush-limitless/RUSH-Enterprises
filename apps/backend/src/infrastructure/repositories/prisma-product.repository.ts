import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IProductRepository } from "../../domain/repositories";
import { Product } from "../../domain/entities";

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } }) as unknown as Promise<Product[]>;
  }

  findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } }) as unknown as Promise<Product | null>;
  }

  create(data: Omit<Product, "id">): Promise<Product> {
    return this.prisma.product.create({ data: data as any }) as unknown as Promise<Product>;
  }

  update(id: string, data: Partial<Product>): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data: data as any }) as unknown as Promise<Product>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  findLowStock(): Promise<Product[]> {
    return this.prisma.$queryRawUnsafe(
      'SELECT * FROM "Product" WHERE stock IS NOT NULL AND stock <= "alertLimit"',
    );
  }
}
