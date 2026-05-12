import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApifyClient } from 'apify-client';
import { EnvVars } from '../config/env.validation';

const IG_ACTOR = 'apify/instagram-scraper';
const TIKTOK_ACTOR = 'clockworks/tiktok-scraper';

export interface RawInstagramItem {
  username: string;
  fullName?: string;
  biography?: string;
  profilePicUrl?: string;
  profilePicUrlHD?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  verified?: boolean;
  private?: boolean;
  isBusinessAccount?: boolean;
  externalUrl?: string;
  latestPosts?: RawInstagramPost[];
}

export interface RawInstagramPost {
  id: string;
  shortCode?: string;
  type?: 'Image' | 'Video' | 'Sidecar';
  productType?: string;
  caption?: string;
  displayUrl?: string;
  images?: string[];
  videoUrl?: string;
  url?: string;
  timestamp?: string;
  ownerUsername?: string;
  ownerFullName?: string;
  ownerId?: string;
  likesCount?: number;
  commentsCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  videoDuration?: number;
  hashtags?: string[];
  mentions?: string[];
  childPosts?: unknown[];
  dimensionsHeight?: number;
  dimensionsWidth?: number;
  locationName?: string;
}

export interface RawTikTokItem {
  id: string;
  text?: string;
  webVideoUrl?: string;
  url?: string;
  createTime?: number;
  createTimeISO?: string;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
  collectCount?: number;
  playCount?: number;
  repostCount?: number;
  mediaUrls?: string[];
  hashtags?: { name?: string }[];
  mentions?: string[];
  isAd?: boolean;
  isPinned?: boolean;
  isSlideshow?: boolean;
  videoMeta?: {
    coverUrl?: string;
    originalCoverUrl?: string;
    duration?: number;
    height?: number;
    width?: number;
  };
  authorMeta?: {
    name?: string;
    nickName?: string;
    avatar?: string;
    signature?: string;
    fans?: number;
    following?: number;
    video?: number;
    verified?: boolean;
    privateAccount?: boolean;
    createTime?: number;
    bioLink?: string;
  };
  locationMeta?: {
    locationName?: string;
    countryCode?: string;
  };
}

@Injectable()
export class ApifyService {
  private readonly client: ApifyClient;

  constructor(config: ConfigService<EnvVars, true>) {
    this.client = new ApifyClient({ token: config.get('APIFY_API_TOKEN', { infer: true }) });
  }

  async runInstagramScraper(username: string, resultsLimit = 25): Promise<RawInstagramItem[]> {
    const run = await this.client.actor(IG_ACTOR).call({
      resultsType: 'details',
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsLimit,
      addParentData: false,
    });
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    return items as unknown as RawInstagramItem[];
  }

  async runTikTokScraper(username: string, resultsPerPage = 25): Promise<RawTikTokItem[]> {
    const run = await this.client.actor(TIKTOK_ACTOR).call({
      profiles: [username],
      resultsPerPage,
      profileScrapeSections: ['videos'],
      profileSorting: 'latest',
      excludePinnedPosts: false,
      shouldDownloadCovers: false,
      shouldDownloadAvatars: false,
      proxyCountryCode: 'None',
    });
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    return items as unknown as RawTikTokItem[];
  }
}
