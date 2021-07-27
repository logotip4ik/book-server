import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from '../../context';
import { decodedToken } from '../../decodedToken';
import { processFields } from '../../helpers';
import {
  BookInput,
  BookUpdateInput,
  UserInput,
  SecureUserInput,
} from '../../interfaces';

const supersecret = process.env.SUPER_SECRET_JWT_TOKEN;

export const Mutation = {
  async createUser(
    _parent: undefined,
    args: { data: UserInput },
    context: Context,
  ) {
    const userToken = decodedToken(context.req);

    if (args.data.isStuff === true && userToken?.isStuff === false)
      throw new Error('Must be stuff to create stuff users');
    const user = await context.prisma.user.create({
      data: { ...args.data, password: bcrypt.hashSync(args.data.password, 10) },
    });
    const secureUser: SecureUserInput = { ...user };
    delete secureUser.password;
    return { token: jwt.sign(secureUser, supersecret) };
  },
  async createBook(
    _parent: undefined,
    args: { data: BookInput },
    context: Context,
    info: any,
  ) {
    const token = decodedToken(context.req);
    if (!token || !token.isAuthor)
      throw Error('Login or be author to access this source');
    const select = processFields(info);
    return await context.prisma.book.create({
      data: {
        ...args.data,
        author: { connect: { id: args.data.author } },
      },
      select,
    });
  },
  async updateBook(
    _parent: undefined,
    args: { data: BookUpdateInput },
    context: Context,
    info: any,
  ) {
    const token = decodedToken(context.req);
    if (!token || !token.isAuthor)
      throw Error('Login or be author to access this source');
    const select = processFields(info);

    const userBooks = await context.prisma.user.findUnique({
      where: { email: token.email },
      select: { books: true },
    });
    if (!userBooks?.books) throw new Error('500');

    const userBook = userBooks.books.filter(({ id }) => id == args.data.id)[0];

    if (!userBook) throw new Error('You can modify only yours books');
    const needToUpdate: any = {};

    Object.keys(args.data).forEach((key) =>
      // @ts-ignore
      key === 'id' || !args.data[key]
        ? null
        : // @ts-ignore
          (needToUpdate[key] = args.data[key]),
    );

    return await context.prisma.book.update({
      where: { id: args.data.id },
      data: needToUpdate,
      select,
    });
  },
  async starBook(
    _parent: undefined,
    args: { data: { id: number } },
    context: Context,
  ) {
    if (!args.data.id) throw new Error('Must add an book id');
    const userToken = decodedToken(context.req);
    if (!userToken?.email)
      throw new Error('Need to login to access this resource');
    const user = await context.prisma.user.update({
      where: { email: userToken.email },
      data: { starredBooks: { connect: { id: args.data.id } } },
    });
    return { success: !!user };
  },
  async unStarBook(
    _parent: undefined,
    args: { data: { id: number } },
    context: Context,
  ) {
    if (!args.data.id) throw new Error('Must add an book id');
    const userToken = decodedToken(context.req);
    if (!userToken?.email)
      throw new Error('Need to login to access this resource');
    const user = await context.prisma.user.update({
      where: { email: userToken.email },
      data: { starredBooks: { disconnect: { id: args.data.id } } },
    });
    return { success: !!user };
  },
  async loginUser(_parent: undefined, args: { data: any }, context: Context) {
    const { data } = args;
    const user = await context.prisma.user.findUnique({
      select: {
        id: true,
        about: true,
        email: true,
        name: true,
        isAuthor: true,
        isStuff: true,
        password: true,
      },
      where: {
        email: data.email,
      },
    });
    if (!user) throw new Error('Unable to Login');
    const isMatch = bcrypt.compareSync(data.password, user.password);
    if (!isMatch) throw new Error('Unable to Login');
    const author: SecureUserInput = { ...user };
    delete author.password;

    return { token: jwt.sign(author, supersecret) };
  },
};
