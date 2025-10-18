import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@leaseup/prisma/client';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auth } from '@leaseup/trpc/src/server/auth/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestDatabase {
  private container: StartedPostgreSqlContainer | null = null;
  private prisma: PrismaClient | null = null;
  private connectionString: string = '';

  async start(): Promise<void> {
    console.log('Starting PostgreSQL test container...');

    this.container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('leaseup_test')
      .withUsername('leaseup_test')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .withCopyFilesToContainer([
        {
          source: path.join(__dirname, '../docker/test-db-init.sql'),
          target: '/docker-entrypoint-initdb.d/init.sql',
        },
      ])
      .start();

    const host = this.container.getHost();
    const port = this.container.getMappedPort(5432);
    this.connectionString = `postgresql://leaseup_test:test_password@${host}:${port}/leaseup_test`;

    console.log(`Database container started at: ${this.connectionString}`);

    process.env.DATABASE_URL = this.connectionString;

    await this.runMigrations();

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.connectionString,
        },
      },
    });

    await this.prisma.$connect();
    console.log('Database setup completed');
  }

  async stop(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }

    console.log('Database container stopped');
  }

  private async runMigrations(): Promise<void> {
    try {
      console.log('Running database migrations...');

      const prismaDir = path.join(__dirname, '../../prisma');

      execSync('pnpm prisma migrate deploy', {
        cwd: prismaDir,
        env: {
          ...process.env,
          DATABASE_URL: this.connectionString,
        },
        stdio: 'inherit',
      });

      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not initialized');
    }

    console.log('Cleaning up test data...');

    await this.prisma.session.deleteMany();
    await this.prisma.account.deleteMany();
    await this.prisma.verification.deleteMany();
    await this.prisma.invoice.deleteMany();
    await this.prisma.tenant.deleteMany();
    await this.prisma.property.deleteMany();
    await this.prisma.user.deleteMany();

    console.log('Test data cleanup completed');
  }

  async seed(data?: any): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not initialized');
    }

    console.log('Seeding test data...');

    if (data?.testUser) {
      await this.prisma.user.create({
        data: data.testUser,
      });
    }
  }

  getPrismaClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not initialized');
    }
    return this.prisma;
  }

  isInitialized(): boolean {
    return this.prisma !== null;
  }

  async waitForInitialization(timeoutMs: number = 30000): Promise<void> {
    const startTime = Date.now();
    while (!this.isInitialized()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Database initialization timeout after ${timeoutMs}ms`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  getConnectionString(): string {
    return this.connectionString;
  }

  async createTestUser(userData: {
    name: string;
    email: string;
    password?: string;
    emailVerified?: boolean;
  }) {
    if (!this.prisma) {
      throw new Error('Database not initialized');
    }

    if (userData.password) {
      await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        throw new Error('Failed to create user with Better Auth');
      }

      if (
        userData.emailVerified !== undefined &&
        userData.emailVerified !== user.emailVerified
      ) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: userData.emailVerified },
        });
      }

      return user;
    } else {
      const { nanoid } = await import('nanoid');
      const user = await this.prisma.user.create({
        data: {
          id: nanoid(),
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified ?? true,
        },
      });

      return user;
    }
  }

  async getUserByEmail(email: string) {
    if (!this.prisma) {
      throw new Error('Database not initialized');
    }

    return this.prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
      },
    });
  }
}

export const testDb = new TestDatabase();
