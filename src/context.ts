import { Request, Response } from 'apollo-server-env';
import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  req: Request;
  res: Response;
}

const prisma = new PrismaClient();

export const context: { prisma: PrismaClient } = {
  prisma: prisma,
};
