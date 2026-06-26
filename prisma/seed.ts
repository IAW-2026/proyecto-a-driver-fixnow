import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter, log: ['error'] });

const professionalsData = [
  {
    id: 'prof-ana',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@example.com',
    phoneNumber: '+54 9 11 1111-1111',
    serviceType: 'PLOMERIA' as const,
    rating: 4.8,
    latitude: -38.7196,
    longitude: -62.2724,
    radiusKm: 10,
    status: 'ONLINE' as const,
    isVerified: true,
  },
  {
    id: 'prof-luis',
    firstName: 'Luis',
    lastName: 'Pérez',
    email: 'luis.perez@example.com',
    phoneNumber: '+54 9 11 2222-2222',
    serviceType: 'ELECTRICIDAD' as const,
    rating: 4.6,
    latitude: -38.7250,
    longitude: -62.2650,
    radiusKm: 15,
    status: 'BUSY' as const,
    isVerified: true,
  },
  {
    id: 'prof-maria',
    firstName: 'María',
    lastName: 'Sosa',
    email: 'maria.sosa@example.com',
    phoneNumber: '+54 9 11 3333-3333',
    serviceType: 'GAS' as const,
    rating: 4.9,
    latitude: -38.7142,
    longitude: -62.2783,
    radiusKm: 12,
    status: 'ONLINE' as const,
    isVerified: false,
  },
  {
    id: 'prof-julio',
    firstName: 'Julio',
    lastName: 'Romero',
    email: 'julio.romero@example.com',
    phoneNumber: '+54 9 11 4444-4444',
    serviceType: 'PLOMERIA' as const,
    rating: 4.4,
    latitude: -38.7050,
    longitude: -62.2900,
    radiusKm: 8,
    status: 'OFFLINE' as const,
    isVerified: true,
  },
  {
    id: 'prof-camila',
    firstName: 'Camila',
    lastName: 'Fernández',
    email: 'camila.fernandez@example.com',
    phoneNumber: '+54 9 11 5555-5555',
    serviceType: 'ELECTRICIDAD' as const,
    rating: 4.7,
    latitude: -38.7310,
    longitude: -62.2550,
    radiusKm: 9,
    status: 'ONLINE' as const,
    isVerified: true,
  },
  {
    id: 'prof-diego',
    firstName: 'Diego',
    lastName: 'Martínez',
    email: 'diego.martinez@example.com',
    phoneNumber: '+54 9 11 6666-6666',
    serviceType: 'GAS' as const,
    rating: 4.5,
    latitude: -38.7360,
    longitude: -62.2680,
    radiusKm: 14,
    status: 'BUSY' as const,
    isVerified: true,
  },
  {
    id: 'prof-sofia',
    firstName: 'Sofía',
    lastName: 'López',
    email: 'sofia.lopez@example.com',
    phoneNumber: '+54 9 11 7777-7777',
    serviceType: 'PLOMERIA' as const,
    rating: 4.9,
    latitude: -38.7065,
    longitude: -62.2815,
    radiusKm: 11,
    status: 'ONLINE' as const,
    isVerified: true,
  },
  {
    id: 'prof-nicolas',
    firstName: 'Nicolás',
    lastName: 'Rivas',
    email: 'nicolas.rivas@example.com',
    phoneNumber: '+54 9 11 8888-8888',
    serviceType: 'ELECTRICIDAD' as const,
    rating: 4.3,
    latitude: -38.7420,
    longitude: -62.2600,
    radiusKm: 7,
    status: 'OFFLINE' as const,
    isVerified: false,
  },
  {
    id: 'prof-valeria',
    firstName: 'Valeria',
    lastName: 'Benítez',
    email: 'valeria.benitez@example.com',
    phoneNumber: '+54 9 11 9999-9999',
    serviceType: 'GAS' as const,
    rating: 4.8,
    latitude: -38.7180,
    longitude: -62.2860,
    radiusKm: 13,
    status: 'ONLINE' as const,
    isVerified: true,
  },
  {
    id: 'prof-martin',
    firstName: 'Martín',
    lastName: 'Cuevas',
    email: 'martin.cuevas@example.com',
    phoneNumber: '+54 9 11 1010-1010',
    serviceType: 'PLOMERIA' as const,
    rating: 4.2,
    latitude: -38.7290,
    longitude: -62.2740,
    radiusKm: 6,
    status: 'BUSY' as const,
    isVerified: true,
  },
];

async function main() {
  for (const professional of professionalsData) {
    await prisma.professional.upsert({
      where: { id: professional.id },
      update: {
        firstName: professional.firstName,
        lastName: professional.lastName,
        email: professional.email,
        phoneNumber: professional.phoneNumber,
        serviceType: professional.serviceType,
        rating: professional.rating,
        latitude: professional.latitude,
        longitude: professional.longitude,
        radiusKm: professional.radiusKm,
        status: professional.status,
        isVerified: professional.isVerified,
      },
      create: professional,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
