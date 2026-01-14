"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const src_1 = require("../src");
const rules_1 = require("../src/rules");
const constructors_1 = require("../src/constructors");
describe('logic rules', () => {
    test('allow, deny work as expeted', async () => {
        var _a;
        const typeDefs = `
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
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        // Permissions
        const permissions = (0, src_1.shield)({
            Query: {
                allow: src_1.allow,
                deny: src_1.deny,
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(1);
    });
    test('and works as expected', async () => {
        var _a;
        const typeDefs = `
      type Query {
        allow: String
        deny: String
        ruleError: String
      }
    `;
        const resolvers = {
            Query: {
                allow: () => 'allow',
                deny: () => 'deny',
                ruleError: () => 'ruleError',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const ruleWithError = (0, src_1.rule)()(async () => {
            throw new Error();
        });
        const permissions = (0, src_1.shield)({
            Query: {
                allow: (0, src_1.and)(src_1.allow, src_1.allow),
                deny: (0, src_1.and)(src_1.allow, src_1.deny),
                ruleError: (0, src_1.and)(src_1.allow, ruleWithError),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
        ruleError
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
            ruleError: null,
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(2);
    });
    test('chain works as expected', async () => {
        var _a;
        const typeDefs = `
      type Query {
        allow: String
        deny: String
        ruleError: String
      }
    `;
        const resolvers = {
            Query: {
                allow: () => 'allow',
                deny: () => 'deny',
                ruleError: () => 'error',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        let allowRuleSequence = [];
        const allowRuleA = (0, src_1.rule)()(() => {
            allowRuleSequence.push('A');
            return true;
        });
        const allowRuleB = (0, src_1.rule)()(() => {
            allowRuleSequence.push('B');
            return true;
        });
        const allowRuleC = (0, src_1.rule)()(() => {
            allowRuleSequence.push('C');
            return true;
        });
        let denyRuleCount = 0;
        const denyRule = (0, src_1.rule)({})(() => {
            denyRuleCount += 1;
            return false;
        });
        let ruleWithErrorCount = 0;
        const ruleWithError = (0, src_1.rule)()(() => {
            ruleWithErrorCount += 1;
            throw new Error('error');
        });
        const permissions = (0, src_1.shield)({
            Query: {
                allow: (0, constructors_1.chain)(allowRuleA, allowRuleB, allowRuleC),
                deny: (0, constructors_1.chain)(denyRule, denyRule, denyRule),
                ruleError: (0, constructors_1.chain)(ruleWithError, ruleWithError, ruleWithError),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
        ruleError
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
            ruleError: null,
        });
        expect(allowRuleSequence.toString()).toEqual(['A', 'B', 'C'].toString());
        expect(denyRuleCount).toEqual(1);
        expect(ruleWithErrorCount).toEqual(1);
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(2);
    });
    test('race chain works as expected', async () => {
        var _a;
        const typeDefs = `
      type Query {
        allow: String
        deny: String
        ruleError: String
      }
    `;
        const resolvers = {
            Query: {
                allow: () => 'allow',
                deny: () => 'deny',
                ruleError: () => 'error',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        let allowRuleSequence = [];
        const denyRuleA = (0, src_1.rule)()(() => {
            allowRuleSequence.push('A');
            return false;
        });
        const allowRuleB = (0, src_1.rule)()(() => {
            allowRuleSequence.push('B');
            return true;
        });
        const allowRuleC = (0, src_1.rule)()(() => {
            allowRuleSequence.push('C');
            return true;
        });
        let denyRuleCount = 0;
        const denyRule = (0, src_1.rule)({})(() => {
            denyRuleCount += 1;
            return false;
        });
        let ruleWithErrorCount = 0;
        const ruleWithError = (0, src_1.rule)()(() => {
            ruleWithErrorCount += 1;
            throw new Error('error');
        });
        const permissions = (0, src_1.shield)({
            Query: {
                allow: (0, constructors_1.race)(denyRuleA, allowRuleB, allowRuleC),
                deny: (0, constructors_1.race)(denyRule, denyRule, denyRule),
                ruleError: (0, constructors_1.race)(ruleWithError, ruleWithError, ruleWithError),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
        ruleError
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
            ruleError: null,
        });
        expect(allowRuleSequence.toString()).toEqual(['A', 'B'].toString());
        expect(denyRuleCount).toEqual(3);
        expect(ruleWithErrorCount).toEqual(3);
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(2);
    });
    test('or works as expected', async () => {
        var _a;
        const typeDefs = `
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
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const permissions = (0, src_1.shield)({
            Query: {
                allow: (0, src_1.or)(src_1.allow, src_1.deny),
                deny: (0, src_1.or)(src_1.deny, src_1.deny),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(1);
    });
    test('not works as expected', async () => {
        var _a;
        const typeDefs = `
      type Query {
        allow: String
        deny: String
        ruleError: String
        resolverError: String
        customRuleError: String
        customRuleErrorString: String
      }
    `;
        const resolvers = {
            Query: {
                allow: () => 'allow',
                deny: () => 'deny',
                ruleError: () => 'ruleError',
                resolverError: () => {
                    throw new Error();
                },
                customRuleError: () => 'customRuleError',
                customRuleErrorString: () => 'customRuleErrorString',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const ruleWithError = (0, src_1.rule)()(async () => {
            throw new Error();
        });
        const ruleWithCustomError = (0, src_1.rule)()(async () => {
            return new Error('error_pass');
        });
        const ruleWithCustomErrorString = (0, src_1.rule)()(async () => {
            return 'error_string_pass';
        });
        const permissions = (0, src_1.shield)({
            Query: {
                allow: (0, src_1.not)(src_1.deny),
                deny: (0, src_1.not)(src_1.allow),
                ruleError: (0, src_1.not)(ruleWithError),
                resolverError: (0, src_1.not)(src_1.allow),
                customRuleError: (0, src_1.not)(ruleWithCustomError),
                customRuleErrorString: (0, src_1.not)(ruleWithCustomErrorString),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        allow
        deny
        ruleError
        resolverError
        customRuleError
        customRuleErrorString
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        expect(res.data).toEqual({
            allow: 'allow',
            deny: null,
            ruleError: 'ruleError',
            resolverError: null,
            customRuleError: 'customRuleError',
            customRuleErrorString: 'customRuleErrorString',
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.map((err) => err.message)).toEqual([
            'Not Authorised!',
            'Not Authorised!',
        ]);
    });
    test('not returns custom error', async () => {
        var _a;
        const typeDefs = `
      type Query {
        not: String
      }
    `;
        const resolvers = {
            Query: {
                not: () => 'not',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const permissions = (0, src_1.shield)({
            Query: {
                not: (0, src_1.not)(src_1.allow, 'This is a custom not message.'),
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        not
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        expect(res.data).toEqual({
            not: null,
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.map((err) => err.message)).toEqual([
            'This is a custom not message.',
        ]);
    });
});
describe('internal execution', () => {
    test('logic rule by default resolves to false', async () => {
        const rule = new rules_1.LogicRule([]);
        const res = await rule.resolve({}, {}, { _shield: { cache: {} } }, {}, {
            allowExternalErrors: false,
            debug: false,
            fallbackRule: src_1.allow,
            fallbackError: new Error(),
            hashFunction: () => `${Math.random()}`,
        });
        expect(res).toBeFalsy();
    });
    test('rule prevents access when access not permited', async () => {
        var _a;
        const typeDefs = `
      type Query {
        deny: String
      }
    `;
        const resolvers = {
            Query: {
                deny: () => 'deny',
            },
        };
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
        /* Permissions */
        const ruleDeny = (0, src_1.rule)()(() => false);
        const permissions = (0, src_1.shield)({
            Query: {
                deny: ruleDeny,
            },
        });
        const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions);
        /* Execution */
        const query = `
      query {
        deny
      }
    `;
        const res = await (0, graphql_1.graphql)({
            schema: schemaWithPermissions,
            source: query,
        });
        /* Tests */
        expect(res.data).toEqual({
            deny: null,
        });
        expect((_a = res.errors) === null || _a === void 0 ? void 0 : _a.length).toBe(1);
    });
});
