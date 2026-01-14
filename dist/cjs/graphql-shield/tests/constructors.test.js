"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constructors_1 = require("../src/constructors");
const rules_1 = require("../src/rules");
describe('rule constructor', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    test('correctly constructs from no arguments', async () => {
        /* Mocks */
        const n = Math.random();
        jest.spyOn(Math, 'random').mockReturnValue(n);
        /* Tests */
        const func = () => true;
        expect((0, constructors_1.rule)()(func)).toEqual(new rules_1.Rule(n.toString(), func, {}));
    });
    test('correctly constructs with name and options', async () => {
        const func = () => true;
        expect((0, constructors_1.rule)('name', {
            cache: 'contextual',
            fragment: 'fragment',
        })(func)).toEqual(new rules_1.Rule('name', func, { cache: 'contextual', fragment: 'fragment' }));
    });
    test('correctly constructs with name but no options', async () => {
        const func = () => true;
        expect((0, constructors_1.rule)('name')(func)).toEqual(new rules_1.Rule('name', func, {}));
    });
    test('correctly constructs with options', async () => {
        /* Mocks */
        const n = Math.random();
        jest.spyOn(Math, 'random').mockReturnValue(n);
        /* Tests */
        const func = () => true;
        expect((0, constructors_1.rule)({
            cache: 'contextual',
            fragment: 'fragment',
        })(func)).toEqual(new rules_1.Rule(n.toString(), func, {
            cache: 'contextual',
            fragment: 'fragment',
        }));
    });
});
describe('input rules constructor', () => {
    test('correnctly constructs an input rule with name', async () => {
        const name = Math.random().toString();
        let schema;
        const rule = (0, constructors_1.inputRule)(name)((yup) => {
            schema = yup.object().shape({}).required();
            return schema;
        });
        expect(JSON.stringify(rule)).toEqual(JSON.stringify(new rules_1.InputRule(name, () => schema)));
    });
    test('correnctly constructs an input rule', async () => {
        const n = Math.random();
        jest.spyOn(Math, 'random').mockReturnValue(n);
        let schema;
        const rule = (0, constructors_1.inputRule)()((yup) => {
            schema = yup.object().shape({}).required();
            return schema;
        });
        expect(JSON.stringify(rule)).toEqual(JSON.stringify(new rules_1.InputRule(n.toString(), () => schema)));
    });
    test('correctly contructs an input rule with validation options', async () => {
        const n = Math.random();
        jest.spyOn(Math, 'random').mockReturnValue(n);
        let schema;
        let options = { abortEarly: false };
        const rule = (0, constructors_1.inputRule)()((yup) => {
            schema = yup.object().shape({}).required();
            return schema;
        }, options);
        expect(JSON.stringify(rule)).toEqual(JSON.stringify(new rules_1.InputRule(n.toString(), () => schema, options)));
    });
});
describe('logic rules constructors', () => {
    test('and correctly constructs rule and', async () => {
        const ruleA = (0, constructors_1.rule)()(() => true);
        const ruleB = (0, constructors_1.rule)()(() => true);
        expect((0, constructors_1.and)(ruleA, ruleB)).toEqual(new rules_1.RuleAnd([ruleA, ruleB]));
    });
    test('chain correctly constructs rule chain', async () => {
        const ruleA = (0, constructors_1.rule)()(() => true);
        const ruleB = (0, constructors_1.rule)()(() => true);
        expect((0, constructors_1.chain)(ruleA, ruleB)).toEqual(new rules_1.RuleChain([ruleA, ruleB]));
    });
    test('or correctly constructs rule or', async () => {
        const ruleA = (0, constructors_1.rule)()(() => true);
        const ruleB = (0, constructors_1.rule)()(() => true);
        expect((0, constructors_1.or)(ruleA, ruleB)).toEqual(new rules_1.RuleOr([ruleA, ruleB]));
    });
    test('not correctly constructs rule not', async () => {
        const ruleA = (0, constructors_1.rule)()(() => true);
        expect((0, constructors_1.not)(ruleA)).toEqual(new rules_1.RuleNot(ruleA));
    });
});
describe('basic rules', () => {
    test('rule allow', async () => {
        expect(constructors_1.allow).toEqual(new rules_1.RuleTrue());
    });
    test('rule deny', async () => {
        expect(constructors_1.deny).toEqual(new rules_1.RuleFalse());
    });
});
