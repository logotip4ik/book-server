import { Request } from 'apollo-server-env';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SecureUserInput } from './interfaces';

export const decodedToken = (req: Request) => {
  // @ts-ignore
  const header = req.headers.authorization;
  const supersecret = process.env.SUPER_SECRET_JWT_TOKEN;

  if (header) {
    const token = header.replace('Bearer ', '');
    // @ts-ignore
    const decoded: SecureUserInput = jwt.verify(token, supersecret);
    return decoded;
  }
  return null;
};
