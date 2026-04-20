import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class CancelTransactionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
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
}
