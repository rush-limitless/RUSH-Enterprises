import { Controller, Get, Patch, Param, Body } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateRoleDto } from "../dto/user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.user.findMany();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  @Patch(":id/role")
  updateRole(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.prisma.user.update({ where: { id }, data: { role: dto.role } });
  }
}
