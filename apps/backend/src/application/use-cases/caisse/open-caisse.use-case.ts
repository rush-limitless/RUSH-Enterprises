import { Injectable, Inject, ConflictException } from "@nestjs/common";
import type { ICaisseRepository } from "../../../domain/repositories";
import type { CaisseSession } from "../../../domain/entities";

@Injectable()
export class OpenCaisseUseCase {
  constructor(
    @Inject("ICaisseRepository")
    private readonly caisseRepo: ICaisseRepository,
  ) {}

  async execute(managerId: string, openingBalance: number): Promise<CaisseSession> {
    const existing = await this.caisseRepo.findOpenByManager(managerId);
    if (existing) {
      throw new ConflictException("Une session de caisse est déjà ouverte");
    }
    return this.caisseRepo.open(managerId, openingBalance);
  }
}
