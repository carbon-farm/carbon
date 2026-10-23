import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MembershipGuard } from '../../common/guards/membership.guard';

// Same audience as the advice articles themselves: signed-in members with an active membership
// (the guard lets staff through).
@UseGuards(JwtAuthGuard, MembershipGuard)
@Controller('marketplace/recommendations')
export class RecommendationsController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('article/:articleId')
  forArticle(@Param('articleId') articleId: string) {
    return this.marketplaceService.recommendForArticle(articleId);
  }
}
