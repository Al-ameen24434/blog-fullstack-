import { PrismaClient } from '@prisma/client/extension';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with Faker.js...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Configuration
  const USER_COUNT = 15;
  const POST_COUNT = 30;
  const TAGS_COUNT = 12;
  const COMMENTS_PER_POST_MIN = 2;
  const COMMENTS_PER_POST_MAX = 8;
  const LIKES_PER_POST_MIN = 5;
  const LIKES_PER_POST_MAX = 25;

  // Create users
  console.log(`👤 Creating ${USER_COUNT} users...`);
  const users: any[] = [];
  const passwordHash = await hash('password123', 10);

  for (let i = 0; i < USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        bio: faker.person.bio(),
        avatar: faker.image.avatar(),
        password: passwordHash,
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // Create tags
  console.log(`🏷️  Creating ${TAGS_COUNT} tags...`);
  const tags: any[] = [];
  const tagNames = [
    'Technology',
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Blockchain',
    'UI/UX Design',
    'Startups',
    'Business',
    'Marketing',
    'Digital Marketing',
    'Content Creation',
    'Writing',
    'Photography',
    'Travel',
    'Food',
    'Health',
    'Fitness',
    'Lifestyle',
    'Personal Development',
    'Finance',
    'Education',
    'Science',
    'Entertainment',
    'Gaming',
  ];s

  // Shuffle and pick uniques
  const shuffledTags = faker.helpers.shuffle(tagNames).slice(0, TAGS_COUNT);

  for (const tagName of shuffledTags) {
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
      },
    });
    tags.push(tag);
  }
  console.log(`✅ Created ${tags.length} tags`);

  // Create posts
  console.log(`📝 Creating ${POST_COUNT} posts...`);
  const posts: any[] = [];

  for (let i = 0; i < POST_COUNT; i++) {
    const title = faker.lorem.sentence();
    const slug = faker.helpers.slugify(title).toLowerCase();
    const author = faker.helpers.arrayElement(users);

    // Generate realistic content with markdown
    const content = generatePostContent();

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        content,
        thumbnail: faker.image.urlLoremFlickr({ category: 'technology' }),
        published: faker.datatype.boolean({ probability: 0.85 }), // 85% published, 15% drafts
        authorId: author.id,
      },
    });
    posts.push(post);
  }
  console.log(`✅ Created ${posts.length} posts`);

  // Connect random tags to each post
  console.log('🔗 Connecting tags to posts...');
  for (const post of posts) {
    const postTags = faker.helpers.arrayElements(
      tags,
      faker.number.int({ min: 1, max: 4 }),
    );

    await prisma.post.update({
      where: { id: post.id },
      data: {
        tags: {
          connect: postTags.map((tag) => ({ id: tag.id })),
        },
      },
    });
  }
  console.log('✅ Connected tags to posts');

  // Create comments
  console.log('💬 Creating comments...');
  let totalComments = 0;

  for (const post of posts) {
    if (!post.published) continue; // Skip drafts

    const commentCount = faker.number.int({
      min: COMMENTS_PER_POST_MIN,
      max: COMMENTS_PER_POST_MAX,
    });

    for (let i = 0; i < commentCount; i++) {
      const author = faker.helpers.arrayElement(users);
      await prisma.comment.create({
        data: {
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          postId: post.id,
          authorId: author.id,
        },
      });
      totalComments++;
    }
  }
  console.log(`✅ Created ${totalComments} comments`);

  // Create likes
  console.log('❤️ Creating likes...');
  let totalLikes = 0;

  for (const post of posts) {
    if (!post.published) continue; // Skip drafts

    const likeCount = faker.number.int({
      min: LIKES_PER_POST_MIN,
      max: LIKES_PER_POST_MAX,
    });

    // Get unique users for likes
    const likingUsers = faker.helpers.arrayElements(
      users,
      Math.min(likeCount, users.length),
    );

    for (const user of likingUsers) {
      try {
        await prisma.like.create({
          data: {
            userId: user.id,
            postId: post.id,
          },
        });
        totalLikes++;
      } catch (error) {
        // Ignore duplicate like errors (unique constraint on userId+postId)
        if (!(error as any).message?.includes('Unique constraint failed')) {
          throw error;
        }
      }
    }
  }
  console.log(`✅ Created ${totalLikes} likes`);

  // Print summary
  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(
    `- Posts: ${posts.length} (${posts.filter((p) => p.published).length} published, ${posts.filter((p) => !p.published).length} drafts)`,
  );
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Comments: ${totalComments}`);
  console.log(`- Likes: ${totalLikes}`);

  // Show some sample data
  console.log('\n👥 Sample Users:');
  users.slice(0, 3).forEach((user) => {
    console.log(`  - ${user.name} (${user.email})`);
  });

  console.log('\n📝 Sample Posts:');
  posts.slice(0, 3).forEach((post) => {
    console.log(
      `  - ${post.title} (${post.published ? 'Published' : 'Draft'})`,
    );
  });

  console.log('\n🏷️ Sample Tags:');
  tags.slice(0, 5).forEach((tag) => {
    console.log(`  - ${tag.name}`);
  });
}

// Helper function to generate realistic post content with markdown
function generatePostContent(): string {
  const contentType = faker.helpers.arrayElement([
    'tutorial',
    'opinion',
    'news',
    'guide',
    'list',
  ]);

  switch (contentType) {
    case 'tutorial':
      return `# ${faker.lorem.sentence()}

${faker.lorem.paragraphs(2)}

## Prerequisites
${faker.lorem.paragraph()}

## Step 1: ${faker.lorem.words(3)}
\`\`\`${faker.helpers.arrayElement(['javascript', 'typescript', 'python', 'bash'])}
${faker.lorem.lines(3)}
\`\`\`

${faker.lorem.paragraphs(2)}

## Step 2: ${faker.lorem.words(3)}
${faker.lorem.paragraphs(2)}

## Conclusion
${faker.lorem.paragraph()}

> ${faker.lorem.sentence()}

${faker.lorem.paragraph()}`;

    case 'opinion':
      return `# ${faker.lorem.sentence()}

${faker.lorem.paragraphs(3)}

## The Current State
${faker.lorem.paragraph()}

## My Perspective
${faker.lorem.paragraphs(2)}

### Pros:
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

### Cons:
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

## Looking Forward
${faker.lorem.paragraph()}`;

    case 'list':
      return `# ${faker.lorem.sentence()}

${faker.lorem.paragraph()}

## 1. ${faker.lorem.words(4)}
${faker.lorem.paragraph()}

## 2. ${faker.lorem.words(4)}
${faker.lorem.paragraph()}

## 3. ${faker.lorem.words(4)}
${faker.lorem.paragraph()}

## 4. ${faker.lorem.words(4)}
${faker.lorem.paragraph()}

## 5. ${faker.lorem.words(4)}
${faker.lorem.paragraph()}

## Final Thoughts
${faker.lorem.paragraph()}`;

    default:
      return `# ${faker.lorem.sentence()}

${faker.lorem.paragraphs(4)}

## ${faker.lorem.sentence()}
${faker.lorem.paragraphs(2)}

### ${faker.lorem.words(3)}
${faker.lorem.paragraph()}

### ${faker.lorem.words(3)}
${faker.lorem.paragraph()}

## Conclusion
${faker.lorem.paragraph()}`;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
