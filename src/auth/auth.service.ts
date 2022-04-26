import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signin() {
    return { msg: "I'm sign in" };
  }

  signup() {
    return { msg: "I'm sign up" };
  }
}
