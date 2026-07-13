// prisma/seed.ts
import { PrismaClient, Role, DeliveryStatus } from './generated/client';
import {db} from '../src/lib/prisma';
const prisma = db;

async function main() {
  console.log('🧹 Cleaning up old data...');
  // The order here is critical! We must delete children (Deliveries) 
  // before parents (Routes/Users) to avoid Foreign Key constraint errors.
  await prisma.delivery.deleteMany();
  await prisma.route.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Seeding users & vehicles...');
  
  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@logistics.com',
      name: 'Abebe Kebede',
      role: Role.DISPATCHER,
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      email: 'driver1@logistics.com',
      name: 'Tony Dawit',
      role: Role.DRIVER,
      vehicle: {
        create: { licensePlate: 'AA-3-B99999', model: 'Toyota Probox' },
      },
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'driver2@logistics.com',
      name: 'Sara Elias',
      role: Role.DRIVER,
      vehicle: {
        create: { licensePlate: 'AA-3-A11111', model: 'Ford Transit Van' },
      },
    },
  });

  console.log('📦 Seeding historical data (Yesterday)...');

  // A route from yesterday that Sara successfully completed
  await prisma.route.create({
    data: {
      driverId: driver2.id,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Subtract 24 hours
      isCompleted: true,
      deliveries: {
        create: [
          {
            customerName: 'Piassa Electronics',
            address: 'Piassa, Churchill Road',
            latitude: 9.0300,
            longitude: 38.7500,
            status: DeliveryStatus.DELIVERED,
          }
        ],
      },
    },
  });

  console.log('🗺️ Seeding active data (Today)...');

  // A heavy, mixed route for Tony today across Addis Ababa
  await prisma.route.create({
    data: {
      driverId: driver1.id,
      isCompleted: false,
      deliveries: {
        create: [
          {
            customerName: 'Bole Café',
            address: 'Bole, Atlas Road',
            latitude: 9.0115,
            longitude: 38.7820,
            status: DeliveryStatus.DELIVERED, // He already dropped this off
          },
          {
            customerName: 'Kazanchis Tech Hub',
            address: 'Kazanchis, Joseph Tito St',
            latitude: 9.0210,
            longitude: 38.7654,
            status: DeliveryStatus.PENDING, // He is heading here now
          },
          {
            customerName: 'Bambis Supermarket',
            address: 'Meskel Flower Road',
            latitude: 9.0050,
            longitude: 38.7680,
            status: DeliveryStatus.FAILED, // Customer wasn't there
          },
          {
            customerName: 'Edna Mall Cinema',
            address: 'Bole Medhanealem',
            latitude: 8.9950,
            longitude: 38.7890,
            status: DeliveryStatus.PENDING,
          },
        ],
      },
    },
  });

  console.log('✅ Enterprise database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });