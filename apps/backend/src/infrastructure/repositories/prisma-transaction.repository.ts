import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ITransactionRepository } from "../../domain/repositories";
import { Transaction } from "../../domain/entities";

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCaisse(caisseId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { caisseId },
      orderBy: { createdAt: "desc" },
    }) as unknown as Promise<Transaction[]>;
  }

  create(data: Omit<Transaction, "id" | "createdAt" | "isCancelled">): Promise<Transaction> {
    return this.prisma.transaction.create({ data }) as unknown as Promise<Transaction>;
  }

  cancel(id: string): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: { isCancelled: true },
    }) as unknown as Promise<Transaction>;
  }
}
