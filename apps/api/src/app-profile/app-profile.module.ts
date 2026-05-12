import { Module } from '@nestjs/common';
import { AppProfileController } from './app-profile.controller';
import { AppProfileService } from './app-profile.service';

@Module({
  controllers: [AppProfileController],
  providers: [AppProfileService],
})
export class AppProfileModule {}
