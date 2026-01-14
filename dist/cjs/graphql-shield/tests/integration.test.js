"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const schema_1 = require("@graphql-tools/schema");
const apollo_server_1 = require("apollo-server");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const graphql_middleware_1 = require("graphql-middleware");
const src_1 = require("../src");
describe('integration tests', () => {
    test('works with ApolloServer', async () => {
        /* Schema */
        const typeDefs = (0, apollo_server_1.gql) `
      type Query {
        allow: String
        deny: String
      }
    `;
        const resolvers = {
            Query: {
                allow: () => 'allow',
                deny: () => 'deny',
            },
        };
        /* Permissions */
        const permissions = (0, src_1.shield)({
            Query: {
                allow: src_1.allow,
                deny: src_1.deny,
            },
        });
        const server = new apollo_server_1.ApolloServer({
            schema: (0, graphql_middleware_1.applyMiddleware)((0, schema_1.makeExecutableSchema)({ typeDefs, resolvers }), permissions),
        });
        await server.listen({ port: 8008 });
        const uri = `http://localhost:8008/`;
        /* Tests */
        const query = `
      query {
        allow
        deny
      }
    `;
        const res = await (0, node_fetch_1.default)(uri, {
            method: 'POST',
            body: JSON.stringify({ query }),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.json());
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
        });
        expect(res.errors.length).toBe(1);
        await server.stop();
    });
});
