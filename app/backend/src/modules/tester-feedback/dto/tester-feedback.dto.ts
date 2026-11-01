import { TesterFeedbackKind, TesterFeedbackStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Everything here is plain text typed by a tester; lengths are capped so the board cannot be
// stuffed. The service trims, and refuses text that is blank after trimming.

export class CreateTesterFeedbackDto {
  @IsEnum(TesterFeedbackKind)
  kind!: TesterFeedbackKind;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(4000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  expected?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  authorName!: string;

  // A trap for bots: the page never shows or fills this box. Anything in it means a script
  // filled the form in, and the item is quietly dropped.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  faxExtra?: string;
}

export class CreateTesterCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  authorName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  faxExtra?: string;
}

export class UpdateTesterStatusDto {
  @IsEnum(TesterFeedbackStatus)
  status!: TesterFeedbackStatus;

  // who is changing it (written in the item's history)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  by!: string;
}
