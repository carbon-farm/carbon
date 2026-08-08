import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmLandDto } from './create-farm-land.dto';

export class UpdateFarmLandDto extends PartialType(CreateFarmLandDto) {}
