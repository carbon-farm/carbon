import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';

// A Draft can be edited freely; requestPriority is set once at creation and
// re-evaluated at Submitted, not casually toggled mid-edit.
export class UpdateCaseDto extends PartialType(OmitType(CreateCaseDto, ['requestPriority'] as const)) {}
