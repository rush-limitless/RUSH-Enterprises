import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class CreateTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: { title: string; description: string; dueDate: Date; remindAt?: Date; managerId?: string }) {
    return this.prisma.task.create({ data: { ...data, isCompleted: false } });
  }
}
