import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'USER',
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      active: true,
    },
  });

  console.log(`User created: ${email} / ${password} (${role})`);
}

async function main() {
  // Admin user
  await createUser(
    process.env.SEED_ADMIN_EMAIL || 'admin@crono.com',
    process.env.SEED_ADMIN_PASSWORD || 'admin123',
    process.env.SEED_ADMIN_NAME || 'Administrator',
    'ADMIN',
  );

  // Regular user
  await createUser(
    process.env.SEED_USER_EMAIL || 'user@crono.com',
    process.env.SEED_USER_PASSWORD || 'user123',
    process.env.SEED_USER_NAME || 'Regular User',
    'USER',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
