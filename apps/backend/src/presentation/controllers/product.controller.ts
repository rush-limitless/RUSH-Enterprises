import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Get("low-stock")
  findLowStock() {
    return this.prisma.product.findMany({
      where: { stock: { not: null, lte: 2 } },
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.prisma.product.findUniqueOrThrow({ where: { id } });
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
