import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * user sign up service
   *
   * @param dto AuthDto
   * @returns
   */
  async signup(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);
      //save the new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });

      delete user.hash;

      // send back the user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  /**
   * user sign in service
   *
   * @param dto AuthDto
   * @returns Object User|Throw
   */
  async signin(dto: AuthDto) {
    // find the user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const passwordMatches = await argon.verify(user.hash, dto.password);
    // if password is not correct throw exception
    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect');

    // send back the user
    return this.signToken(user.id, user.email);
  }

  /**
   *user sign token
   *
   * @param userId string
   * @param email string
   * @returns {access_token} Promise<{access_token: string}>
   */
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    //config payload object
    const payload = {
      sub: userId,
      email: email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
