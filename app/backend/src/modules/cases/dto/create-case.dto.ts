import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCaseDto {
  @IsUUID()
  farmLandId!: string;

  @IsUUID()
  categoryId!: string;

  // Optional — General Advisory cases aren't always about one specific
  // crop. Feeds Knowledge Article auto-generation (Charter Module 3) once
  // the case closes.
  @IsOptional()
  @IsUUID()
  cropId?: string;

  // A crop the master list does not have (a parcel can list any crop). Ignored when cropId is set.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  cropName?: string;

  // The earlier case this one follows ("the advice did not work"). Must be the farmer's own.
  @IsOptional()
  @IsUUID()
  relatedCaseId?: string;

  @IsString()
  @MinLength(5)
  problemDescription!: string;

  @IsOptional()
  @IsString()
  evidenceNotes?: string;

  // The farmer's ask, alone, grants nothing — see Case.priorityRequested in
  // the schema. A Moderator/Administrator confirmation is a separate action.
  @IsOptional()
  @IsBoolean()
  requestPriority?: boolean;
}
