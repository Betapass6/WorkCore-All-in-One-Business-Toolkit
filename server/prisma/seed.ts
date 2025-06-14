import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.create({
    data: {
      email: 'staff@example.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'STAFF',
    },
  });

  console.log({ staff });

  // Create a dummy supplier
  const dummySupplier = await prisma.supplier.create({
    data: {
      name: 'Sample Supplier 1',
      contact: 'supplier1@example.com',
      address: '123 Sample Street, Sample City, 12345',
    },
  });

  // Create sample products using the dummy supplier
  const product1 = await prisma.product.create({
    data: {
      name: 'Sample Product 1',
      description: 'This is the first sample product.',
      price: 19.99,
      stock: 100,
      category: 'Electronics',
      supplierId: dummySupplier.id,
      userId: admin.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Sample Product 2',
      description: 'This is the second sample product.',
      price: 29.50,
      stock: 50,
      category: 'Books',
      supplierId: dummySupplier.id,
      userId: admin.id,
    },
  });

   const product3 = await prisma.product.create({
    data: {
      name: 'Sample Product 3',
      description: 'This is the third sample product.',
      price: 5.00,
      stock: 200,
      category: 'Books',
      supplierId: dummySupplier.id,
      userId: admin.id,
    },
  });

  console.log({ product1, product2, product3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 