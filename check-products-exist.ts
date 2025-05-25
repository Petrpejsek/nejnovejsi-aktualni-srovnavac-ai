import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ids = [
  '71875066-3d33-4f4d-8225-4ea1ee353dab',
  'bf31321b-430c-4b2d-8b76-5db2a4a4c42e',
  '80d695d6-e815-4ab0-862a-80c6c82b0b2b',
  'e2568d0b-8c48-45ce-97d8-d086b25f266b',
  '0faf3410-db39-4a8b-890b-d4a5f326fd52'
];

(async () => {
  const found = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true }
  });
  console.log('Nalezené produkty:', found);
  await prisma.$disconnect();
})(); 