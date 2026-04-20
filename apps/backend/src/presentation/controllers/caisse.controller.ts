import { Controller, Get, Post, Param, Body, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OpenCaisseDto, CloseCaisseDto } from "../dto/caisse.dto";

@Controller("caisse")
export class CaisseController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("open/:managerId")
  async open(@Param("managerId") managerId: string, @Body() dto: OpenCaisseDto) {
    const existing = await this.prisma.caisseSession.findFirst({
      where: { managerId, closedAt: null },
    });
    if (existing) throw new ConflictException("Session déjà ouverte");
    return this.prisma.caisseSession.create({
      data: { managerId, openingBalance: dto.openingBalance },
    });
  }

  @Post("close/:id")
  async close(@Param("id") id: string, @Body() dto: CloseCaisseDto) {
    return this.prisma.caisseSession.update({
      where: { id },
      data: { closedAt: new Date(), realBalance: dto.realBalance },
    });
  }

  @Get("active/:managerId")
  findActive(@Param("managerId") managerId: string) {
    return this.prisma.caisseSession.findFirst({
      where: { managerId, closedAt: null },
      include: { transactions: true },
    });
  }

  @Get("history/:managerId")
  findHistory(@Param("managerId") managerId: string) {
    return this.prisma.caisseSession.findMany({
      where: { managerId },
      orderBy: { openedAt: "desc" },
    });
  }
}
