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

async function createClient(name: string, codeSportmaniacs?: number) {
  const existingClient = await prisma.client.findFirst({
    where: { name },
  });

  if (existingClient) {
    console.log(`Client already exists: ${name}`);
    return;
  }

  await prisma.client.create({
    data: {
      name,
      codeSportmaniacs,
      active: true,
    },
  });

  console.log(`Client created: ${name}`);
}

async function main() {
  // Internal client (Cronochip owns devices for rental)
  await createClient('Cronochip', 1);

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
