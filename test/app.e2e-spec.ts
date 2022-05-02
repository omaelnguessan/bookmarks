import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

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
    describe('Get empty Bookmarks', () => {
      it('Should Get empty Bookmark', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('/bookmarks')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Bookmark', () => {
      it('Should Create Bookmark', () => {
        const bookmark: CreateBookmarkDto = {
          title: 'nestjs cours',
          description: 'foundation nestjs zero to hero',
          link: 'https://test.com/test',
        };

        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .post('/bookmarks')
          .withBody(bookmark)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmark', () => {
      it('Should Get Bookmark', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('/bookmarks')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by id', () => {
      it('Should Get Bookmark by id', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains('title');
      });
    });

    describe('Edit Bookmark by id', () => {
      it('Should Edit Bookmark', () => {
        const dto: EditBookmarkDto = {
          title: 'test edid',
          link: 'kjdjdkdkskjd',
        };
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title);
      });
    });

    describe('Delete Bookmark by id', () => {
      it('Should Delete Bookmark', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(204);
      });

      it('Should Get empty Bookmark', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('/bookmarks')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
