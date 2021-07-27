import { ApolloServer, gql } from 'apollo-server';
import { context } from './context';
import { resolvers } from './graphql/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  typeDefs as typeDefsTools,
  resolvers as resolversTools,
} from 'graphql-scalars';
import { readFileSync } from 'fs';

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: [
      gql(
        readFileSync(__dirname + '/graphql/schema.graphql', {
          encoding: 'utf-8',
        }),
      ),
      ...typeDefsTools,
    ],
    resolvers: [resolversTools, resolvers],
  }),
  context: ({ req }) => {
    return { req, ...context };
  },
});

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => console.log(`Server is ready at: ${url}`));
