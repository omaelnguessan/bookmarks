import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

      //return saved user
      return user;
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
    return user;
  }
}
