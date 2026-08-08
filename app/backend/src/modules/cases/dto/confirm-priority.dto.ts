import { IsBoolean } from 'class-validator';

export class ConfirmPriorityDto {
  @IsBoolean()
  approve!: boolean;
}
