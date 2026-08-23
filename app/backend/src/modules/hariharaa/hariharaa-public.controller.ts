import { Controller, Get } from '@nestjs/common';
import { HariharaaService } from './hariharaa.service';

// Deliberately no @UseGuards anywhere in this controller — the one truly
// public, unauthenticated endpoint the HARIHARAA landing page needs
// (subscription price + UPI IDs, for rendering the pay-to-subscribe QR).
// Split into its own controller rather than selectively bypassing a
// class-level guard on hariharaa.controller.ts, mirroring why
// AuthController carries no class-level guard either.
@Controller('hariharaa')
export class HariharaaPublicController {
  constructor(private readonly hariharaaService: HariharaaService) {}

  @Get('settings/public')
  getPublicSettings() {
    return this.hariharaaService.getPublicSettings();
  }
}
