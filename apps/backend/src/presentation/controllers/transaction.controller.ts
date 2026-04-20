import { Controller, Get, Post, Patch, Param, Body, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

class CreateTransactionDto {
  caisseId: string;
  amount: number;
  type: string;
  description: string;
  productId?: string;
}

@Controller("transactions")
export class TransactionController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    if (dto.productId && dto.type === "SALE") {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (product && product.type === "PHYSICAL") {
        if (product.stock !== null && product.stock <= 0) {
          throw new BadRequestException("Stock épuisé");
        }
        if (product.stock !== null) {
          await this.prisma.product.update({
            where: { id: dto.productId },
            data: { stock: { decrement: 1 } },
          });
        }
      }
    }

    const tx = await this.prisma.transaction.create({
      data: {
        caisseId: dto.caisseId,
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
      },
    });
    const delta = dto.type === "SALE" ? dto.amount : -dto.amount;
    await this.prisma.caisseSession.update({
      where: { id: dto.caisseId },
      data: { theoreticalBal: { increment: delta } },
    });
    return tx;
  }

  @Patch(":id/cancel")
  async cancel(@Param("id") id: string) {
    const tx = await this.prisma.transaction.update({
      where: { id },
      data: { isCancelled: true },
    });
    const delta = tx.type === "SALE" ? -tx.amount : tx.amount;
    await this.prisma.caisseSession.update({
      where: { id: tx.caisseId },
      data: { theoreticalBal: { increment: delta } },
    });
    return tx;
  }

  @Get("caisse/:caisseId")
  findByCaisse(@Param("caisseId") caisseId: string) {
    return this.prisma.transaction.findMany({
      where: { caisseId },
      orderBy: { createdAt: "desc" },
    });
  }
}
