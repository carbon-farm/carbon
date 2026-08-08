import { IsUUID } from 'class-validator';

export class AssignCaseDto {
  @IsUUID()
  expertId!: string;
}
