import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@crono.com' },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@crono.com',
      password: await bcrypt.hash(
        process.env.SEED_ADMIN_PASSWORD || 'admin123',
        10,
      ),
      name: process.env.SEED_ADMIN_NAME || 'Administrator',
      role: 'ADMIN',
      active: true,
    },
  });
  console.log(`✓ User: ${adminUser.email} (ADMIN)`);

  const regularUser = await prisma.user.upsert({
    where: { email: process.env.SEED_USER_EMAIL || 'user@crono.com' },
    update: {},
    create: {
      email: process.env.SEED_USER_EMAIL || 'user@crono.com',
      password: await bcrypt.hash(
        process.env.SEED_USER_PASSWORD || 'user123',
        10,
      ),
      name: process.env.SEED_USER_NAME || 'Regular User',
      role: 'USER',
      active: true,
    },
  });
  console.log(`✓ User: ${regularUser.email} (USER)`);

  // Clients
  const cronochip = await prisma.client.upsert({
    where: { codeSportmaniacs: 1 },
    update: {},
    create: {
      name: 'Cronochip',
      codeSportmaniacs: 1,
      email: 'info@cronochip.com',
      active: true,
    },
  });
  console.log(`✓ Client: ${cronochip.name}`);

  const acmeSports = await prisma.client.upsert({
    where: { codeSportmaniacs: 100 },
    update: {},
    create: {
      name: 'Acme Sports',
      codeSportmaniacs: 100,
      email: 'events@acmesports.com',
      active: true,
    },
  });
  console.log(`✓ Client: ${acmeSports.name}`);

  // Devices
  const device1 = await prisma.device.upsert({
    where: { manufactoringCode: 'TS2-20241201-001' },
    update: {},
    create: {
      model: 'TS2',
      manufactoringCode: 'TS2-20241201-001',
      manufactoringStatus: 'COMPLETED',
      operationalStatus: 'AVAILABLE',
      availableForRental: true,
      portCount: 4,
      ownerId: cronochip.id,
    },
  });
  console.log(`✓ Device: ${device1.manufactoringCode} (${device1.model})`);

  const device2 = await prisma.device.upsert({
    where: { manufactoringCode: 'TS2-20241201-002' },
    update: {},
    create: {
      model: 'TS2_PLUS',
      manufactoringCode: 'TS2-20241201-002',
      manufactoringStatus: 'COMPLETED',
      operationalStatus: 'AVAILABLE',
      availableForRental: true,
      portCount: 8,
      ownerId: cronochip.id,
    },
  });
  console.log(`✓ Device: ${device2.manufactoringCode} (${device2.model})`);

  // Products (quantity-based)
  const antennas = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Antena UHF 900MHz',
      type: 'ANTENNA',
      description: 'Antena UHF para lectores TS2',
      totalQuantity: 50,
      availableQuantity: 50,
      rentedQuantity: 0,
      inRepairQuantity: 0,
      active: true,
    },
  });
  console.log(`✓ Product: ${antennas.name} (${antennas.totalQuantity} units)`);

  const cables = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Cable USB-C 3m',
      type: 'CABLE',
      description: 'Cable USB-C a USB-A, 3 metros',
      totalQuantity: 100,
      availableQuantity: 100,
      rentedQuantity: 0,
      inRepairQuantity: 0,
      active: true,
    },
  });
  console.log(`✓ Product: ${cables.name} (${cables.totalQuantity} units)`);

  // Product Units (serial-based)
  const stopwatch1 = await prisma.productUnit.upsert({
    where: { serialNumber: 'SW-2024-001' },
    update: {},
    create: {
      type: 'STOPWATCH',
      serialNumber: 'SW-2024-001',
      notes: 'Cronómetro principal',
      status: 'AVAILABLE',
      active: true,
    },
  });
  console.log(`✓ ProductUnit: ${stopwatch1.serialNumber} (${stopwatch1.type})`);

  const mifi1 = await prisma.productUnit.upsert({
    where: { serialNumber: 'MIFI-2024-001' },
    update: {},
    create: {
      type: 'MIFI',
      serialNumber: 'MIFI-2024-001',
      notes: 'MiFi con datos ilimitados',
      status: 'AVAILABLE',
      active: true,
    },
  });
  console.log(`✓ ProductUnit: ${mifi1.serialNumber} (${mifi1.type})`);

  // Chip Types
  const triton = await prisma.chipType.upsert({
    where: { name: 'TRITON' },
    update: { totalStock: 7200 },
    create: {
      name: 'TRITON',
      displayName: 'Triton',
      totalStock: 7200,
    },
  });
  console.log(`✓ ChipType: ${triton.name} (${triton.totalStock} units)`);

  const clipchip = await prisma.chipType.upsert({
    where: { name: 'CLIPCHIP' },
    update: { totalStock: 1000 },
    create: {
      name: 'CLIPCHIP',
      displayName: 'Clipchip',
      totalStock: 1000,
    },
  });
  console.log(`✓ ChipType: ${clipchip.name} (${clipchip.totalStock} units)`);

  const pod = await prisma.chipType.upsert({
    where: { name: 'POD' },
    update: { totalStock: 200 },
    create: {
      name: 'POD',
      displayName: 'Pod',
      totalStock: 200,
    },
  });
  console.log(`✓ ChipType: ${pod.name} (${pod.totalStock} units)`);

  const activo = await prisma.chipType.upsert({
    where: { name: 'ACTIVO' },
    update: { totalStock: 250 },
    create: {
      name: 'ACTIVO',
      displayName: 'Activo',
      totalStock: 250,
    },
  });
  console.log(`✓ ChipType: ${activo.name} (${activo.totalStock} units)`);

  // Rentals (only create if not exists)
  const existingRentals = await prisma.rental.count();
  if (existingRentals === 0) {
    // Rental 1: Active rental to Acme Sports
    const rental1 = await prisma.rental.create({
      data: {
        clientId: acmeSports.id,
        startDate: new Date('2024-12-15'),
        expectedEndDate: new Date('2024-12-22'),
        status: 'ACTIVE',
        notes: 'Evento Trail Running Sierra Norte',
        devices: {
          create: [{ deviceId: device1.id }],
        },
        products: {
          create: [{ productId: antennas.id, quantity: 4 }],
        },
        productUnits: {
          create: [{ productUnitId: stopwatch1.id }],
        },
        chipRanges: {
          create: [
            { chipTypeId: triton.id, rangeStart: 1, rangeEnd: 500 },
            { chipTypeId: triton.id, rangeStart: 1001, rangeEnd: 1200 },
          ],
        },
      },
    });

    // Update inventory for rental 1
    await prisma.device.update({
      where: { id: device1.id },
      data: { operationalStatus: 'RENTED' },
    });
    await prisma.product.update({
      where: { id: antennas.id },
      data: { availableQuantity: 46, rentedQuantity: 4 },
    });
    await prisma.productUnit.update({
      where: { id: stopwatch1.id },
      data: { status: 'RENTED' },
    });

    console.log(`✓ Rental #${rental1.id}: ${acmeSports.name} (ACTIVE)`);

    // Rental 2: Returned rental to Cronochip (internal test)
    const rental2 = await prisma.rental.create({
      data: {
        clientId: cronochip.id,
        startDate: new Date('2024-12-01'),
        expectedEndDate: new Date('2024-12-05'),
        actualEndDate: new Date('2024-12-04'),
        status: 'RETURNED',
        notes: 'Prueba interna sistema',
        products: {
          create: [{ productId: cables.id, quantity: 2 }],
        },
        chipRanges: {
          create: [{ chipTypeId: clipchip.id, rangeStart: 1, rangeEnd: 100 }],
        },
      },
    });

    console.log(`✓ Rental #${rental2.id}: ${cronochip.name} (RETURNED)`);
  } else {
    console.log(`⏭ Rentals: already exist (${existingRentals} found)`);
  }

  console.log('\n✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
