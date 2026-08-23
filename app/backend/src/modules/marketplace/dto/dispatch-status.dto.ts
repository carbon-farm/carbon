import { IsEnum } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

export class SetDispatchStatusDto {
  @IsEnum(DispatchStatus)
  status!: DispatchStatus;
}
