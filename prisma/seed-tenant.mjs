import { PrismaClient } from '@prisma/client';
import inquirer from 'inquirer';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkLoginExists(login) {
    const existingUser = await prisma.user.findUnique({
        where: { login }
    });
    return existingUser !== null;
}

async function main() {
    const tenantData = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Nome do Tenant:',
        }
    ]);

    let isUnique = false;
    let login;

    while (!isUnique) {
        const response = await inquirer.prompt([{
            type: 'input',
            name: 'login',
            message: 'Login:',
        }]);

        if (!response.login) {
            console.log('O login não pode ser vazio. Por favor, informe um login.');
            continue;
        }

        login = response.login;
        const exists = await checkLoginExists(login);

        if (exists) {
            console.log('Este login já existe. Por favor escolha outro.');
        } else {
            isUnique = true;
            continue;
        }
    }

    const userData = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Senha:',
        },
        {
            type: 'input',
            name: 'name',
            message: 'Nome do usuario:',
        },
        {
            type: 'input',
            name: 'email',
            message: 'E-mail:',
        }
    ]);
    console.log('user:', userData);

    const tenant = await prisma.tenant.create({
        data: tenantData,
    });

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            login: login,
            password: hashedPassword,
            tenantId: tenant.id,
            rule: 'admin',
            status: true,
        }
    });

    console.log('Tenant created:', tenantData);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });