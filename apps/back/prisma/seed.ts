// import { faker } from '@faker-js/faker';
// import { hash } from 'bcrypt';
// import 'dotenv/config';

// import { PrismaClient } from '@prisma/client';
// // console.log('PRISMA CLIENT PATH:', require.resolve('@prisma/client'));
// // console.log('DATABASE_URL =', process.env.DATABASE_URL);
// // console.log('--- DEBUG START ---');
// // console.log('NODE VERSION:', process.version);
// // console.log('CWD:', process.cwd());
// // console.log('DATABASE_URL:', process.env.DATABASE_URL);

// // try {
// //   // eslint-disable-next-line @typescript-eslint/no-var-requires
// //   const prismaPkg = require('@prisma/client');
// //   console.log('PRISMA CLIENT LOADED:', Object.keys(prismaPkg));
// // } catch (e) {
// //   console.error('FAILED TO LOAD @prisma/client', e);
// // }

// // console.log('--- DEBUG END ---\n');

// const prisma = new PrismaClient();

// function generateSlug(title: string) {
//   return title
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)+/g, '');
// }

// async function main() {
//   const users = Array.from({ length: 10 }).map(async () => {
//     return prisma.user.create({
//       data: {
//         email: faker.internet.email(),
//         name: faker.person.fullName(),
//         bio: faker.lorem.sentence(),
//         avatar: faker.image.avatar(),
//         password: await hash('password123', 10),
//       },
//     });
//   });
//   await Promise.all(users);

//   const posts = Array.from({ length: 30 }).map(async () => {
//     const userCount = await prisma.user.count();
//     return prisma.post.create({
//       data: {
//         title: faker.lorem.sentence(),
//         slug: generateSlug(faker.lorem.sentence()),
//         content: faker.lorem.paragraphs(3),
//         thumbnail: faker.image.urlLoremFlickr(),
//         published: true,
//         authorId: Math.floor(Math.random() * userCount) + 1,
//       },
//     });
//   });
//   const createdPosts = await Promise.all(posts);

//   await Promise.all(
//     createdPosts.map(
//       async (post) =>
//         await prisma.comment.createMany({
//           data: Array.from({ length: 5 }).map(() => ({
//             content: faker.lorem.sentences(2),
//             authorId: Math.floor(Math.random() * 10) + 1,
//             postId: post.id,
//           })),
//         }),
//     ),
//   );

//   console.log('Seeding completed.');
// }

// main()
//   .then(() => {
//     prisma.$disconnect();
//     process.exit(0);
//   })
//   .catch((e) => {
//     prisma.$disconnect();

//     process.exit(1);
//   });
