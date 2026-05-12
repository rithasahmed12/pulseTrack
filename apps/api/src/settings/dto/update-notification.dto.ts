import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

const NOTIFICATION_IDS = ['new_post', 'follower_spike', 'trending_hashtag', 'weekly_report'] as const;
type NotificationId = (typeof NOTIFICATION_IDS)[number];

export class UpdateNotificationDto {
  @ApiProperty({ enum: NOTIFICATION_IDS })
  @IsIn([...NOTIFICATION_IDS])
  id!: NotificationId;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}
