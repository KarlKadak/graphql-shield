"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const src_1 = require("../src");
describe('input rule', () => {
    test('schema validation works as expected', async () => {
        const typeDefs = `
      type Query {
        hello: String!
      }

      type Mutation {
        login(email: String!): String
      }
    `;
        const resolvers = {
            Query: {
                hello: () => 'world',
            },
            Mutation: {
                login: () => 'pass',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        // Permissions
        const permissions = (0, src_1.shield)({
            Mutation: {
                login: (0, src_1.inputRule)()((yup) => yup.object({
                    email: yup.string().email('It has to be an email!').required(),
                })),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      mutation {
        success: login(email: "shield@graphql.com")
        failure: login(email: "notemail")
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            success: 'pass',
            failure: null,
        });
        expect(res.errors).toMatchSnapshot();
    });
});
