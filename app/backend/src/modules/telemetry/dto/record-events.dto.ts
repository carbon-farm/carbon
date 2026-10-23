import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class EventDto {
  @IsString()
  @MaxLength(30)
  kind!: string;

  @IsString()
  @MaxLength(400)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  detail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;
}

export class RecordEventsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events!: EventDto[];
}
