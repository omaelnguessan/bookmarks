import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  /**
   * Auth
   */
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'omaelberiz@gmail.com',
      password: '123',
    };

    describe('Signup', () => {
      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  /**
   * User
   */
  describe('User', () => {
    describe('Get current user', () => {
      it.todo('Should Get current user');
    });

    describe('Edit user', () => {
      it.todo('Should Edit user');
    });
  });

  /**
   * bookmarks
   */
  describe('Bookmarks', () => {
    describe('Create Bookmark', () => {
      it.todo('Should Create Bookmark');
    });

    describe('Get Bookmark', () => {
      it.todo('Should Get Bookmark');
    });

    describe('Get Bookmark by id', () => {
      it.todo('Should Get Bookmark by id');
    });

    describe('Edit Bookmark', () => {
      it.todo('Should Edit Bookmark');
    });

    describe('Delete Bookmark', () => {
      it.todo('Should Delete Bookmark');
    });
  });
});
