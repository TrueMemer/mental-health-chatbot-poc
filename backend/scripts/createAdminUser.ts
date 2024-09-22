import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'test';
    const name = 'Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created:', adminUser);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });