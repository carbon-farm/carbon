import { Equals, IsOptional, IsUUID } from 'class-validator';

export class CreateSampleDto {
  @IsUUID()
  farmLandId!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  // A real checkbox the farmer must tick, not a video-watch tracking
  // system — this module is built generic (no lab partner integrated yet),
  // so the "collection video watched" step from the Charter's lifecycle is
  // an honesty gate, not an instrumented one.
  @Equals(true)
  collectionVideoWatched!: boolean;
}
