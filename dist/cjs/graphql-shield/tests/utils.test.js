"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const constructors_1 = require("../src/constructors");
const graphql_shield_rules_1 = require("graphql-shield-rules");
describe('type identifiers', () => {
    test('isRuleFunction finds rule function.', async () => {
        expect((0, utils_1.isRuleFunction)((0, constructors_1.rule)()(() => true))).toBeTruthy();
        expect((0, utils_1.isRuleFunction)((0, constructors_1.and)())).toBeTruthy();
        expect((0, utils_1.isRuleFunction)(false)).toBeFalsy();
    });
    test('isRule finds rule.', async () => {
        expect((0, utils_1.isRule)((0, constructors_1.rule)()(() => true))).toBeTruthy();
        expect((0, utils_1.isRule)((0, constructors_1.and)())).toBeFalsy();
        expect((0, utils_1.isRule)(false)).toBeFalsy();
        expect((0, utils_1.isRule)(graphql_shield_rules_1.testSimpleRule)).toBeTruthy();
    });
    test('isLogicRule finds logic rule.', async () => {
        expect((0, utils_1.isLogicRule)((0, constructors_1.and)())).toBeTruthy();
        expect((0, utils_1.isLogicRule)((0, constructors_1.rule)()(() => true))).toBeFalsy();
        expect((0, utils_1.isLogicRule)(false)).toBeFalsy();
        expect((0, utils_1.isLogicRule)(graphql_shield_rules_1.testLogicRule)).toBeTruthy();
    });
    test('isRuleFieldMap finds rule field map.', async () => {
        expect((0, utils_1.isRuleFieldMap)({
            foo: (0, constructors_1.rule)()(() => true),
            bar: (0, constructors_1.and)(),
        })).toBeTruthy();
        expect((0, utils_1.isRuleFieldMap)({
            foo: (0, constructors_1.rule)()(() => true),
            bar: false,
        })).toBeFalsy();
    });
});
describe('helper functions', () => {
    test('withDefault returns correct value', async () => {
        expect((0, utils_1.withDefault)('pass')(undefined)).toBe('pass');
        expect((0, utils_1.withDefault)('fail')('pass')).toBe('pass');
    });
});
