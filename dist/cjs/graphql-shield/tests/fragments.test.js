"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const index_1 = require("../src/index");
const constructors_1 = require("../src/constructors");
describe('Fragment extraction', () => {
    test('Extracts fragment from rule correctly.', async () => {
        const ruleWithFragment = (0, index_1.rule)({ fragment: 'pass' })(() => true);
        expect(ruleWithFragment.extractFragment()).toBe('pass');
    });
    test('Extracts fragment from logic rule correctly.', async () => {
        const ruleWithNoFragment = (0, index_1.rule)()(() => true);
        const ruleWithFragmentA = (0, index_1.rule)({ fragment: 'pass-A' })(() => true);
        const ruleWithFragmentB = (0, index_1.rule)({ fragment: 'pass-B' })(() => true);
        const ruleWithFragmentC = (0, index_1.rule)({ fragment: 'pass-C' })(() => true);
        const logicRuleAND = (0, index_1.and)(ruleWithNoFragment, ruleWithFragmentA, ruleWithFragmentB);
        const logicRuleNOT = (0, index_1.not)(logicRuleAND);
        const logicRuleOR = (0, index_1.or)(ruleWithFragmentB, ruleWithFragmentC, logicRuleNOT);
        expect(logicRuleOR.extractFragments()).toEqual([
            'pass-B',
            'pass-C',
            'pass-A',
            'pass-B',
        ]);
    });
});
describe('Fragment application', () => {
    test('Applies rule-fragment correctly.', async () => {
        /* Schema */
        const typeDefs = `
      type Query {
        user: User
        events: [Event!]
      }

      type User {
        id: ID!
        name: String!
      }

      type Event {
        id: ID!
        location: String!
        published: Boolean
      }
    `;
        /* Permissions */
        const isUserSelf = (0, index_1.rule)({
            fragment: 'fragment UserId on User { id }',
        })(async (parent, args, ctx, info) => {
            return true;
        });
        const isProfilePublic = (0, index_1.rule)({
            fragment: 'fragment UserPublic on User { public }',
        })(async (parent, args, ctx, info) => {
            return true;
        });
        const isEventPublished = (0, index_1.rule)({
            fragment: '... on Event { published }',
        })(async () => {
            return true;
        });
        const permissions = (0, index_1.shield)({
            Query: {
                user: constructors_1.allow,
                events: constructors_1.allow,
            },
            User: (0, index_1.or)(isUserSelf, isProfilePublic),
            Event: isEventPublished,
        });
        const { fragmentReplacements } = (0, graphql_middleware_1.applyMiddleware)((0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: {} }), permissions);
        expect(fragmentReplacements).toEqual([
            {
                field: 'id',
                fragment: '... on User {\n  public\n}',
            },
            {
                field: 'name',
                fragment: '... on User {\n  id\n}',
            },
            {
                field: 'name',
                fragment: '... on User {\n  public\n}',
            },
            {
                field: 'id',
                fragment: '... on Event {\n  published\n}',
            },
            {
                field: 'location',
                fragment: '... on Event {\n  published\n}',
            },
        ]);
    });
});
