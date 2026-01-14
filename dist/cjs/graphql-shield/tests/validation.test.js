"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const validation_1 = require("../src/validation");
const src_1 = require("../src/");
const constructors_1 = require("../src/constructors");
describe('correctly helps developer', () => {
    test('Finds a type missing in schema and warns developer.', async () => {
        /* Schema */
        const typeDefs = `
     type Query {
       a: String!
     }
   `;
        const schema = (0, schema_1.makeExecutableSchema)({
            typeDefs,
            resolvers: {},
        });
        // Permissions
        const permissions = (0, src_1.shield)({
            Query: src_1.allow,
            Fail1: src_1.allow,
            Fail2: src_1.allow,
        });
        expect(() => {
            (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        }).toThrow(`It seems like you have applied rules to Fail1, Fail2 types but Shield cannot find them in your schema.`);
    });
    test('Finds the fields missing in schema and warns developer.', async () => {
        // Schema
        const typeDefs = `
     type Query {
       a: String!
     }
   `;
        const schema = (0, schema_1.makeExecutableSchema)({
            typeDefs,
            resolvers: {},
        });
        // Permissions
        const permissions = (0, src_1.shield)({
            Query: {
                a: src_1.allow,
                b: src_1.allow,
                c: src_1.allow,
            },
        });
        expect(() => {
            (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        }).toThrow('It seems like you have applied rules to Query.b, Query.c fields but Shield cannot find them in your schema.');
    });
});
describe('rule tree validation', () => {
    test('validates rules correctly', async () => {
        /* Rules */
        const rule1 = (0, src_1.rule)('one')(() => true);
        const rule12 = (0, src_1.rule)('one')(() => true);
        const rule2 = (0, src_1.rule)('two')(() => true);
        const rule22 = (0, src_1.rule)('two')(() => true);
        const rule3 = (0, src_1.rule)()(() => true);
        const rule4 = (0, src_1.rule)()(() => true);
        const correctRuleTree = {
            Query: {
                foo: rule1,
                bar: rule2,
            },
            Mutation: rule3,
            Bar: rule4,
        };
        const incorrectRuleTree = {
            Query: {
                foo: rule1,
                bar: rule12,
                qux: rule2,
                foobarqux: rule22,
                quxbarfoo: (0, constructors_1.and)(rule1, rule12),
            },
            Mutation: rule3,
            Bar: rule4,
        };
        /* Tests */
        expect((0, validation_1.validateRuleTree)(correctRuleTree)).toEqual({ status: 'ok' });
        expect((0, validation_1.validateRuleTree)(incorrectRuleTree)).toEqual({
            status: 'err',
            message: `There seem to be multiple definitions of these rules: one, two`,
        });
    });
});
describe('shield works as expected', () => {
    test('throws an error on invalid schema', async () => {
        /* Rules */
        const rule1 = (0, src_1.rule)('one')(() => true);
        const rule12 = (0, src_1.rule)('one')(() => true);
        const rule2 = (0, src_1.rule)('two')(() => true);
        const rule22 = (0, src_1.rule)('two')(() => true);
        const rule3 = (0, src_1.rule)()(() => true);
        const rule4 = (0, src_1.rule)()(() => true);
        const incorrectRuleTree = {
            Query: {
                foo: rule1,
                bar: rule12,
                qux: rule2,
                foobarqux: rule22,
                quxbarfoo: (0, constructors_1.and)(rule1, rule12),
            },
            Mutation: rule3,
            Bar: rule4,
        };
        /* Tests */
        expect(() => {
            (0, src_1.shield)(incorrectRuleTree);
        }).toThrow(`There seem to be multiple definitions of these rules: one, two`);
    });
});
