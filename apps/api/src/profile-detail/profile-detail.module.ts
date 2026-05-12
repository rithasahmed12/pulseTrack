import { Module } from '@nestjs/common';
import { ProfileDetailController } from './profile-detail.controller';
import { ProfileDetailService } from './profile-detail.service';

@Module({
  controllers: [ProfileDetailController],
  providers: [ProfileDetailService],
})
export class ProfileDetailModule {}
