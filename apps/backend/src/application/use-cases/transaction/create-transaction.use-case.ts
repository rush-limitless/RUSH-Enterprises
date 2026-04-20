import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class CreateTransactionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: { caisseId: string; amount: number; type: string; description: string }) {
    const session = await this.prisma.caisseSession.findUnique({ where: { id: data.caisseId } });
    if (!session) throw new NotFoundException("Session de caisse introuvable");
    if (session.closedAt) throw new BadRequestException("Session de caisse fermée");

    const tx = await this.prisma.transaction.create({ data });
    const delta = data.type === "SALE" ? data.amount : -data.amount;
    await this.prisma.caisseSession.update({
      where: { id: data.caisseId },
      data: { theoreticalBal: { increment: delta } },
    });
    return tx;
  }
}
