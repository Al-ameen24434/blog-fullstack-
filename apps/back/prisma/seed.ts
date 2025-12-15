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
}
