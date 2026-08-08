import { IsString, MinLength } from 'class-validator';

export class RequestFollowUpDto {
  @IsString()
  @MinLength(3)
  question!: string;
}

export class RespondFollowUpDto {
  @IsString()
  @MinLength(1)
  answer!: string;
}
