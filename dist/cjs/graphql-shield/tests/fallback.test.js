"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const index_1 = require("../src/index");
describe('fallbackError correctly handles errors', () => {
    test('error in resolver returns fallback error.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const resolvers = {
            Query: {
                test: async () => {
                    throw new Error();
                },
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({
            typeDefs,
            resolvers,
        });
        /* Permissions */
        const fallbackError = new Error('fallback');
        const permissions = (0, index_1.shield)({
            Query: index_1.allow,
        }, {
            fallbackError,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(fallbackError.message);
    });
    test('error in rule returns fallback error.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const fallbackError = new Error('fallback');
        const allow = (0, index_1.rule)()(() => {
            throw new Error();
        });
        const permissions = (0, index_1.shield)({
            Query: allow,
        }, {
            fallbackError,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(fallbackError.message);
    });
    test('correctly converts string fallbackError to error fallbackError', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const resolvers = {
            Query: {
                test: () => {
                    throw new Error();
                },
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const fallbackMessage = Math.random().toString();
        const permissions = (0, index_1.shield)({
            Query: index_1.allow,
        }, {
            fallbackError: fallbackMessage,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(fallbackMessage);
    });
    test('error in rule can be mapped.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const fallbackError = () => new Error('fallback');
        const allow = (0, index_1.rule)()(() => {
            throw new Error();
        });
        const permissions = (0, index_1.shield)({
            Query: allow,
        }, {
            fallbackError,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(fallbackError().message);
    });
    test('error in resolver can be mapped.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const resolvers = {
            Query: {
                test: async () => {
                    throw new Error();
                },
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({
            typeDefs,
            resolvers,
        });
        /* Permissions */
        const fallbackError = () => new Error('fallback');
        const permissions = (0, index_1.shield)({
            Query: index_1.allow,
        }, {
            fallbackError,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(fallbackError().message);
    });
});
describe('external errors can be controled correctly', () => {
    test('error in resolver with allowExternalErrors returns external error.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const resolvers = {
            Query: {
                test: () => {
                    throw new Error('external');
                },
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const permissions = (0, index_1.shield)({
            Query: index_1.allow,
        }, {
            allowExternalErrors: true,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe('external');
    });
    test('error in rule with allowExternalErrors returns fallback.', async () => {
        var _a, _b;
        /* Schema */
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const allow = (0, index_1.rule)()(() => {
            throw new Error('external');
        });
        const permissions = (0, index_1.shield)({
            Query: allow,
        }, {
            allowExternalErrors: true,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe('Not Authorised!');
    });
});
describe('debug mode works as expected', () => {
    test('returns original error in debug mode when rule error occurs', async () => {
        var _a, _b;
        /* Schema */
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const allow = (0, index_1.rule)()(() => {
            throw new Error('debug');
        });
        const permissions = (0, index_1.shield)({
            Query: allow,
        }, {
            debug: true,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe('debug');
    });
    test('returns original error in debug mode when resolver error occurs.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const resolvers = {
            Query: {
                test: () => {
                    throw new Error('debug');
                },
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const permissions = (0, index_1.shield)({
            Query: index_1.allow,
        }, {
            debug: true,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe('debug');
    });
});
describe('custom errors work as expected', () => {
    test('custom error in rule returns custom error.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const error = new Error(`${Math.random()}`);
        const permissions = (0, index_1.shield)({
            Query: (0, index_1.rule)()(() => {
                return error;
            }),
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(error.message);
    });
    test('custom error message in rule returns custom error.', async () => {
        /* Schema */
        var _a, _b;
        const typeDefs = `
      type Query {
        test: String!
      }
    `;
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} });
        /* Permissions */
        const error = `${Math.random()}`;
        const permissions = (0, index_1.shield)({
            Query: (0, index_1.rule)()(() => {
                return error;
            }),
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        test
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toBeNull();
        expect((_b = (_a = res.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message).toBe(error);
    });
});
describe('fallbackRule correctly applies fallback rule', () => {
    test('correctly applies fallback rule on undefined fields', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        b: String
        type: Type
      }

      type Type {
        a: String
        b: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                b: () => 'b',
                type: () => ({}),
            },
            Type: {
                a: () => 'a',
                b: () => 'b',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const fallbackRuleMock = jest.fn().mockResolvedValue(true);
        const fallbackRule = (0, index_1.rule)({ cache: 'no_cache' })(fallbackRuleMock);
        const permissions = (0, index_1.shield)({
            Query: {
                a: index_1.allow,
                type: index_1.allow,
            },
        }, {
            fallbackRule: fallbackRule,
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        b
        type {
          a
          b
        }
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res).toEqual({
            data: {
                a: 'a',
                b: 'b',
                type: {
                    a: 'a',
                    b: 'b',
                },
            },
        });
        expect(fallbackRuleMock).toBeCalledTimes(3);
    });
});
