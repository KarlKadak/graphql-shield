"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("@graphql-tools/schema");
const graphql_middleware_1 = require("graphql-middleware");
const src_1 = require("../src");
const graphql_1 = require("graphql");
describe('generates correct middleware', () => {
    test('correctly applies schema rule to schema', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                type: () => ({}),
            },
            Type: {
                a: () => 'a',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const allowMock = jest.fn().mockResolvedValue(true);
        const permissions = (0, src_1.shield)((0, src_1.rule)({ cache: 'no_cache' })(allowMock));
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        type {
          a
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
                type: {
                    a: 'a',
                },
            },
        });
        expect(allowMock).toBeCalledTimes(3);
    });
    test('correctly applies type rule to type', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                type: () => ({}),
            },
            Type: {
                a: () => 'a',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const allowMock = jest.fn().mockResolvedValue(true);
        const permissions = (0, src_1.shield)({
            Query: (0, src_1.rule)({ cache: 'no_cache' })(allowMock),
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        type {
          a
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
                type: {
                    a: 'a',
                },
            },
        });
        expect(allowMock).toBeCalledTimes(2);
    });
    test('correctly applies field rule to field', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                type: () => ({}),
            },
            Type: {
                a: () => 'a',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const allowMock = jest.fn().mockResolvedValue(true);
        const permissions = (0, src_1.shield)({
            Query: { a: (0, src_1.rule)({ cache: 'no_cache' })(allowMock) },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        type {
          a
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
                type: {
                    a: 'a',
                },
            },
        });
        expect(allowMock).toBeCalledTimes(1);
    });
    test('correctly applies wildcard rule to type', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        b: String
        type: Type
      }
      type Type {
        field1: String
        field2: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                b: () => 'b',
                type: () => ({
                    field1: 'field1',
                    field2: 'field2',
                }),
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const allowMock = jest.fn().mockResolvedValue(true);
        const defaultQueryMock = jest.fn().mockResolvedValue(true);
        const defaultTypeMock = jest.fn().mockResolvedValue(true);
        const permissions = (0, src_1.shield)({
            Query: {
                a: (0, src_1.rule)({ cache: 'no_cache' })(allowMock),
                type: (0, src_1.rule)({ cache: 'no_cache' })(jest.fn().mockResolvedValue(true)),
                '*': (0, src_1.rule)({ cache: 'no_cache' })(defaultQueryMock),
            },
            Type: {
                '*': (0, src_1.rule)({ cache: 'no_cache' })(defaultTypeMock),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        b
        type {
          field1
          field2
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
                    field1: 'field1',
                    field2: 'field2',
                },
            },
        });
        expect(allowMock).toBeCalledTimes(1);
        expect(defaultQueryMock).toBeCalledTimes(1);
        expect(defaultTypeMock).toBeCalledTimes(2);
    });
    test('correctly allows multiple uses of the same wildcard rule', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        a: String
        b: String
        type: Type
      }
      type Type {
        field1: String
        field2: String
      }
    `;
        const resolvers = {
            Query: {
                a: () => 'a',
                b: () => 'b',
                type: () => ({
                    field1: 'field1',
                    field2: 'field2',
                }),
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const allowMock = jest.fn().mockResolvedValue(true);
        const defaultQueryMock = jest.fn().mockResolvedValue(true);
        const defaultTypeMock = jest.fn().mockResolvedValue(true);
        const permissions = (0, src_1.shield)({
            Query: {
                a: (0, src_1.rule)({ cache: 'no_cache' })(allowMock),
                type: (0, src_1.rule)({ cache: 'no_cache' })(jest.fn().mockResolvedValue(true)),
                '*': (0, src_1.rule)({ cache: 'no_cache' })(defaultQueryMock),
            },
            Type: {
                '*': (0, src_1.rule)({ cache: 'no_cache' })(defaultTypeMock),
            },
        });
        /* First usage */
        (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Second usage */
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        a
        b
        type {
          field1
          field2
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
                    field1: 'field1',
                    field2: 'field2',
                },
            },
        });
        expect(allowMock).toBeCalledTimes(1);
        expect(defaultQueryMock).toBeCalledTimes(1);
        expect(defaultTypeMock).toBeCalledTimes(2);
    });
});
