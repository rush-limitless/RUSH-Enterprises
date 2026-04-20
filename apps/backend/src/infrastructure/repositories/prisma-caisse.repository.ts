import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ICaisseRepository } from "../../domain/repositories";
import { CaisseSession } from "../../domain/entities";

@Injectable()
export class PrismaCaisseRepository implements ICaisseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CaisseSession | null> {
    return this.prisma.caisseSession.findUnique({ where: { id } });
  }

  async findOpenByManager(managerId: string): Promise<CaisseSession | null> {
    return this.prisma.caisseSession.findFirst({
      where: { managerId, closedAt: null },
    });
  }

  async open(managerId: string, openingBalance: number): Promise<CaisseSession> {
    return this.prisma.caisseSession.create({
      data: { managerId, openingBalance },
    });
  }

  async close(id: string, realBalance: number): Promise<CaisseSession> {
    return this.prisma.caisseSession.update({
      where: { id },
      data: { closedAt: new Date(), realBalance },
    });
  }
}
