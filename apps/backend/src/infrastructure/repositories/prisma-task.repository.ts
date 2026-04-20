import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ITaskRepository } from "../../domain/repositories";
import { Task } from "../../domain/entities";

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ orderBy: { dueDate: "asc" } });
  }

  findByManager(managerId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { managerId }, orderBy: { dueDate: "asc" } });
  }

  create(data: Omit<Task, "id">): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  complete(id: string): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data: { isCompleted: true } });
  }

  findDueForReminder(): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { isCompleted: false, remindAt: { not: null, lte: new Date() } },
    });
  }
}
