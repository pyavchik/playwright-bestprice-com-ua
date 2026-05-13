export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  password: string;
}

const FIRST_NAMES = ['Ivan', 'Olga', 'Andriy', 'Maria', 'Petro', 'Kateryna'];
const LAST_NAMES = ['Shevchenko', 'Kovalenko', 'Bondarenko', 'Tkachenko', 'Melnyk'];
const CITIES = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function buildValidUser(overrides: Partial<TestUser> = {}): TestUser {
  const stamp = Date.now().toString(36);
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return {
    firstName: first,
    lastName: last,
    email: `qa.${first.toLowerCase()}.${stamp}@example.test`,
    phone: `+38067${randomDigits(7)}`,
    city: pick(CITIES),
    address: `Test Street, ${Math.floor(Math.random() * 200) + 1}`,
    password: `Qa!${stamp}Aa1`,
    ...overrides,
  };
}

export const invalidEmails = [
  '',
  'plainaddress',
  '@no-local.com',
  'no-at-sign.com',
  'spaces in@email.com',
  'two@@signs.com',
];

export const invalidPhones = ['', 'abcdefg', '12', '+0000', '++380671234567'];

export const invalidPasswords = ['', '1', 'short', '       '];
