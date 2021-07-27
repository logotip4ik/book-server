import { processFields } from '../../helpers';
import { Context } from '../../context';
import { decodedToken } from '../../decodedToken';

export const Query = {
  async getAllBooks(
    _parent: undefined,
    args: { first?: number; offset?: number },
    context: Context,
    info: any,
  ) {
    const select = processFields(info);
    return await context.prisma.book.findMany({
      select,
      take: args.first ? args.first : 10,
      skip: args.offset ? args.offset : 0,
    });
  },
  async getOneBook(
    _parent: undefined,
    args: { id: number },
    context: Context,
    info: any,
  ) {
    const select = processFields(info);
    return await context.prisma.book.findUnique({
      where: { id: args.id },
      select,
    });
  },

  async getAllAuthors(
    _parent: undefined,
    args: { first?: number; offset?: number },
    context: Context,
    info: any,
  ) {
    const token = decodedToken(context.req);
    if (!token || !token.isAuthor)
      throw Error('Login or be author to access this source');
    const select = processFields(info);
    return await context.prisma.user.findMany({
      select,
      take: args.first ? args.first : 10,
      skip: args.offset ? args.offset : 0,
    });
  },
  async getOneAuthor(
    _parent: undefined,
    args: { id: number },
    context: Context,
    info: any,
  ) {
    const select = processFields(info);
    return await context.prisma.user.findUnique({
      where: { id: args.id },
      select,
    });
  },
  async getMe(_parent: undefined, _args: Object, context: Context, info: any) {
    const token = decodedToken(context.req);
    if (!token) throw Error('Login to access this source');
    const select = processFields(info);
    const user = await context.prisma.user.findUnique({
      where: { email: token.email },
      select,
    });
    if (!user) throw Error('Not Found');
    return user;
  },
};
