import { PrismaClient } from '@prisma/client/extension';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  const users = Array.from({ length: 10 }).map(async () => {
    return prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        avatar: faker.image.avatar(),
        password: await hash('password123', 10),
      },
    });
  });
  await Promise.all(users);

  const posts = Array.from({ length: 30 }).map(async () => {
    const userCount = await prisma.user.count();
    return prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        slug: generateSlug(faker.lorem.sentence()),
        content: faker.lorem.paragraphs(3),
        thumbnauil: faker.image.urlLoremFlickr(),
        published: true,
        authorId: Math.floor(Math.random() * userCount) + 1,
      },
    });
  });
  await Promise.all(posts);

  posts.map(
    async (post) =>
      await prisma.post.create({
        data: {
          ...post,
          Comments: {
            create: Array.from({ length: 5 }).map(() => ({
              content: faker.lorem.sentences(2),
              authorId: Math.floor(Math.random() * 10) + 1,
            })),
          },
        },
      }),
  );

  console.log('Seeding completed.');
}

main()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });
