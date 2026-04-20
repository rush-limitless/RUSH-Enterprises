import { IsEnum } from "class-validator";
import { Role } from "../../domain/entities";

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}
