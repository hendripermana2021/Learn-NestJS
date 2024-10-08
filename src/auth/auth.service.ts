import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './dto/login.dto';
// import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ArtistsService } from 'src/artists/artists.service';
import { Enable2FAType, payloadType } from './types';
import * as speakeasy from 'speakeasy';
import { UpdateResult } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private artistService: ArtistsService,
    private configService: ConfigService,
  ) {}

  async login(
    loginDTO: LoginDTO,
  ): Promise<
    { accessToken: string } | { validate2FA: string; message: string }
  > {
    const user = await this.userService.findOne(loginDTO); // 1.

    const passwordMatched = await bcrypt.compare(
      loginDTO.password,
      user.password,
    ); // 2.

    console.log('loginDTO', loginDTO);
    console.log('User', user);

    if (passwordMatched) {
      //3
      delete user.password; // 4.

      const payLoad: payloadType = { email: user.email, userId: user.id };

      const artist = await this.artistService.findArtist(user.id);
      if (artist) {
        payLoad.artistId = artist.id;
      }

      if (user.enable2FA && user.twoFASecret) {
        return {
          validate2FA: 'http://localhost3000/auth/validate-2fa',
          message:
            'Please sends the one time password/token from your google account',
        };
      }
      return {
        accessToken: this.jwtService.sign(payLoad),
      };
    } else {
      throw new UnauthorizedException('Password does not match'); // 5.
    }
  }

  async enable2FA(userId: number): Promise<Enable2FAType> {
    const user = await this.userService.findById(userId);
    if (user.enable2FA) {
      return { secret: user.twoFASecret };
    }
    const secret = speakeasy.generateSecret();
    console.log(secret);
    user.twoFASecret = secret.base32;
    await this.userService.updateSecretKey(user.id, user.twoFASecret);
    return { secret: user.twoFASecret };
  }

  async validate2FAToken(
    userId: number,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await this.userService.findById(userId);

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
      });

      if (verified) {
        return { verified: true };
      } else {
        return { verified: false };
      }
    } catch (err) {
      throw new UnauthorizedException(' Error Verifying Token');
      console.error(err);
    }
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.userService.disable2FA(userId);
  }

  async validateUserByApiKey(apiKey: string): Promise<User> {
    return this.userService.findByApiKey(apiKey);
  }

  getEnvVariable() {
    return this.configService.get<number>('port');
  }
}
