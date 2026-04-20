import { Injectable, Inject, NotFoundException, ConflictException } from "@nestjs/common";
import type { ICaisseRepository } from "../../../domain/repositories";
import type { CaisseSession } from "../../../domain/entities";

@Injectable()
export class CloseCaisseUseCase {
  constructor(
    @Inject("ICaisseRepository")
    private readonly caisseRepo: ICaisseRepository,
  ) {}

  async execute(id: string, realBalance: number): Promise<CaisseSession> {
    const session = await this.caisseRepo.findById(id);
    if (!session) throw new NotFoundException("Session de caisse introuvable");
    if (session.closedAt) throw new ConflictException("Session déjà fermée");
    return this.caisseRepo.close(id, realBalance);
  }
}
