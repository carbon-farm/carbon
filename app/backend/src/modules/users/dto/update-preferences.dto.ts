import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsBoolean()
  whatsappOptIn!: boolean;
}
