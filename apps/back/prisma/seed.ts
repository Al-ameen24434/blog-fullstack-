import { PrismaClient } from '@prisma/client/extension';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

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
        content: faker.lorem.paragraphs(),
        published: faker.datatype.boolean(),
        authorId: Math.floor(Math.random() * userCount) + 1,
      },
    });
  });
  await Promise.all(posts);
}
