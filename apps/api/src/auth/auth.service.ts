import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthResponseDto, AuthSessionDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const created = await this.supabase.admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: dto.displayName ? { display_name: dto.displayName } : undefined,
    });
    if (created.error) {
      throw new BadRequestException(created.error.message);
    }

    const signIn = await this.supabase.admin.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (signIn.error || !signIn.data.session || !signIn.data.user) {
      throw new InternalServerErrorException(signIn.error?.message ?? 'Failed to sign in after registration');
    }

    return this.buildAuthResponse(signIn.data.user.id, signIn.data.user.email ?? dto.email, {
      accessToken: signIn.data.session.access_token,
      refreshToken: signIn.data.session.refresh_token,
      expiresAt: signIn.data.session.expires_at ?? 0,
    });
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { data, error } = await this.supabase.admin.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    }
    return this.buildAuthResponse(data.user.id, data.user.email ?? dto.email, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    });
  }

  async me(userId: string, userJwt: string): Promise<AuthUserDto> {
    const client = this.supabase.forUser(userJwt);
    const { data, error } = await client
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', userId)
      .single<ProfileRow>();
    if (error || !data) {
      throw new NotFoundException('Profile not found');
    }
    const authUser = await this.supabase.admin.auth.admin.getUserById(userId);
    return {
      id: data.id,
      email: authUser.data.user?.email ?? '',
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      createdAt: data.created_at,
    };
  }

  private async buildAuthResponse(
    userId: string,
    email: string,
    session: AuthSessionDto,
  ): Promise<AuthResponseDto> {
    const profile = await this.supabase.admin
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', userId)
      .single<ProfileRow>();
    return {
      user: {
        id: userId,
        email,
        displayName: profile.data?.display_name ?? null,
        avatarUrl: profile.data?.avatar_url ?? null,
        bio: profile.data?.bio ?? null,
        createdAt: profile.data?.created_at ?? new Date().toISOString(),
      },
      session,
    };
  }
}
