import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTransactionDto } from "../dto/caisse.dto";

@Controller("transactions")
export class TransactionController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const tx = await this.prisma.transaction.create({ data: dto });
    // Update theoretical balance
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
