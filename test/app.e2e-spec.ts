import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

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

    let url: string;
    describe('Signup', () => {
      url = '/auth/signup';
      it('Should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if body is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      url = '/auth/signin';

      it('Should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if body is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({})
          .expectStatus(400);
      });

      it('Should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  /**
   * User
   */
  describe('User', () => {
    describe('Get current user', () => {
      it('Should throw if empty is headers', () => {
        return pactum.spec().withHeaders({}).get('/users/me').expectStatus(401);
      });

      it('Should Get current user', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('/users/me')
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('Should Edit user', () => {
        const dto: EditUserDto = {
          email: 'email@gmail.com',
          firstName: 'madara',
          lastName: 'uchiwa',
        };
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .patch('/users')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
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

    describe('Edit Bookmark by id', () => {
      it.todo('Should Edit Bookmark');
    });

    describe('Delete Bookmark by id', () => {
      it.todo('Should Delete Bookmark');
    });
  });
});
