import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTaskDto } from "../dto/task.dto";

@Controller("tasks")
export class TaskController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.task.findMany({ orderBy: { dueDate: "asc" } });
  }

  @Get("manager/:managerId")
  findByManager(@Param("managerId") managerId: string) {
    return this.prisma.task.findMany({ where: { managerId }, orderBy: { dueDate: "asc" } });
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        remindAt: dto.remindAt ? new Date(dto.remindAt) : null,
        managerId: dto.managerId || null,
        isCompleted: false,
      },
    });
  }

  @Patch(":id/complete")
  complete(@Param("id") id: string) {
    return this.prisma.task.update({ where: { id }, data: { isCompleted: true } });
  }
}
