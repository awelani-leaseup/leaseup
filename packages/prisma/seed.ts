import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function generateSouthAfricanIntlNumber() {
  const prefixes = [
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '71',
    '72',
    '73',
    '74',
    '76',
    '78',
    '79',
    '81',
    '82',
    '83',
    '84',
  ];
  const prefix = faker.helpers.arrayElement(prefixes);

  const lineNumber = faker.string.numeric(7);

  return `+27${prefix}${lineNumber}`;
}

async function main() {
  const landlords = await prisma.landlord.createMany({
    data: Array.from({ length: 10 }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: generateSouthAfricanIntlNumber(),
      addressLine1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      properties: {
        create: new Array(faker.number.int({ min: 3, max: 8 }))
          .fill(null)
          .map(() => ({
            name: faker.lorem.words({
              min: 1,
              max: 5,
            }),
            addressLine1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zip: faker.location.zipCode(),
          })),
      },
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
