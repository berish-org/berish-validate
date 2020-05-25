import { createRule, isRule, isRuleArray, isRuleTuple, isRuleMap, isRegisteredRule } from '../rule';
import { isValidateMap } from '../validateMap/isValidateMap';
import { getRulesFromMap } from '../validateMap/getRulesFromMap';
import { validateMapSync } from '../validateMap/validateMap';
import { FLAG_CONDITION_TRUTHY, FLAG_CONDITION_FALSY } from '../rule/flags';

describe('rule test', () => {
  const isRequiredRule = createRule({
    name: 'isRequired',
    conditionSync: ({ value }) => typeof value === 'number' || !!value,
    conditionAsync: ({ value }) => Promise.resolve(typeof value === 'number' || !!value),
  });

  test('createRule empty', () => {
    const rule = createRule({});

    expect(isRule(rule)).toBe(true);
    expect(isRule({})).toBe(false);

    expect(rule.ruleName).toBeDefined();
    expect(rule.conditionSync).toBeDefined();
    expect(rule.conditionAsync).toBeDefined();
    expect(rule.isRegistered).toBeTruthy();
  });

  test('createRule conditions', async () => {
    expect(isRequiredRule.ruleName).toBe('isRequired');
    expect(isRequiredRule.conditionSync({ target: null, key: null, value: '123' })).toBe(FLAG_CONDITION_TRUTHY);
    expect(isRequiredRule.conditionSync({ target: null, key: null, value: null })).toBe(FLAG_CONDITION_FALSY);
    expect(isRequiredRule.conditionSync({ target: null, key: null, value: 0 })).toBe(FLAG_CONDITION_TRUTHY);
    expect(isRequiredRule.conditionSync({ target: null, key: null, value: '' })).toBe(FLAG_CONDITION_FALSY);

    expect(await isRequiredRule.conditionAsync({ target: null, key: null, value: '123' })).toBe(FLAG_CONDITION_TRUTHY);
    expect(await isRequiredRule.conditionAsync({ target: null, key: null, value: null })).toBe(FLAG_CONDITION_FALSY);
    expect(await isRequiredRule.conditionAsync({ target: null, key: null, value: 0 })).toBe(FLAG_CONDITION_TRUTHY);
    expect(await isRequiredRule.conditionAsync({ target: null, key: null, value: '' })).toBe(FLAG_CONDITION_FALSY);
  });

  test('createRule fabic', () => {
    const maxRule = createRule<[number]>({
      name: 'max',
      conditionSync: ({ value, body }) => {
        const max = body[0] || 0;
        if (typeof value === 'number') return value <= max;
        return true;
      },
    });

    expect(maxRule.ruleName).toBe('max');
    expect(maxRule.isRegistered).toBeTruthy();
    expect(maxRule.conditionSync({ target: null, key: null, value: 10 })).toBe(FLAG_CONDITION_FALSY);
    expect(maxRule(30).conditionSync({ target: null, key: null, value: 10 })).toBe(FLAG_CONDITION_TRUTHY);
    expect(maxRule(9).conditionSync({ target: null, key: null, value: 10 })).toBe(FLAG_CONDITION_FALSY);
    expect(maxRule(30)(9).conditionSync({ target: null, key: null, value: 10 })).toBe(FLAG_CONDITION_FALSY);
    expect(maxRule(9)(30).conditionSync({ target: null, key: null, value: 10 })).toBe(FLAG_CONDITION_TRUTHY);
  });

  test('createRule revert', () => {
    expect(isRequiredRule.revertSimple()).not.toBe(isRequiredRule);
    expect(isRequiredRule.revertSimple().revertSimple()).toBe(isRequiredRule);
    expect(
      isRequiredRule
        .revertSimple()
        .revertSimple()
        .revertSimple(),
    ).toBe(isRequiredRule.revertSimple());
    expect(
      isRequiredRule
        .revertSimple()
        .revertSimple()
        .revertSimple()
        .revertSimple(),
    ).toBe(isRequiredRule.revertSimple().revertSimple());

    const isRequiredRevertRule = isRequiredRule.revertSimple();
    expect(isRequiredRule.conditionSync({ target: null, key: null, value: 5 })).toBe(FLAG_CONDITION_TRUTHY);
    expect(isRequiredRevertRule.conditionSync({ target: null, key: null, value: 5 })).toBe(FLAG_CONDITION_FALSY);
    expect(isRequiredRevertRule.conditionSync({ target: null, key: null, value: '' })).toBe(FLAG_CONDITION_TRUTHY);

    const isRequiredRevertWithTruthyRule = isRequiredRule.revertSimple('withTruthy');
    expect(isRequiredRevertWithTruthyRule.conditionSync({ target: null, key: null, value: 5 })).toBe(
      FLAG_CONDITION_FALSY,
    );
    expect(isRequiredRevertWithTruthyRule.conditionSync({ target: null, key: null, value: 6 })).toBe(
      FLAG_CONDITION_FALSY,
    );
    expect(isRequiredRevertWithTruthyRule.conditionSync({ target: null, key: null, value: 7 })).toBe(
      FLAG_CONDITION_FALSY,
    );
  });

  test('check types', () => {
    const rule = createRule({});

    expect(isRule(rule)).toBeTruthy();
    expect(isRule(null)).toBeFalsy();

    expect(isRuleArray(rule)).toBeFalsy();
    expect(isRuleArray([rule, '123'])).toBeFalsy();
    expect(isRuleArray([rule, rule])).toBeTruthy();

    expect(isRuleMap({ age: [rule] })).toBeTruthy();

    expect(isRuleTuple([[rule], {}])).toBeTruthy();
    expect(isRuleTuple([[rule], [rule]])).toBeFalsy();
    expect(isRuleTuple([[rule], { age: 24 }])).toBeFalsy();

    expect(isValidateMap({})).toBeTruthy();
    expect(isValidateMap([])).toBeTruthy();
    expect(isValidateMap([rule])).toBeTruthy();
    expect(isValidateMap([rule, 123])).toBeFalsy();
    expect(isValidateMap([[rule], [[rule], {}]])).toBeFalsy();
  });

  test('getRulesFromMap', () => {
    const rule1 = createRule({ name: 'rule1' });
    const rule2 = createRule({ name: 'rule2' });
    const rule3 = createRule({ name: 'rule3' });

    expect(getRulesFromMap([rule1, rule2, rule3])).toEqual([[[], [rule1, rule2, rule3]]]);
    expect(getRulesFromMap([rule1, 123 as any])).toEqual([]);
    expect(
      getRulesFromMap([
        [rule1],
        { info: { age: [rule1, rule2], auth: [[rule1, rule3], { login: [rule3], password: [rule3] }] } },
      ]),
    ).toEqual([
      [[], [rule1]],
      [
        ['info', 'age'],
        [rule1, rule2],
      ],
      [
        ['info', 'auth'],
        [rule1, rule3],
      ],
      [['info', 'auth', 'login'], [rule3]],
      [['info', 'auth', 'password'], [rule3]],
    ]);
  });

  test('validateMap', () => {
    const user = {
      name: 'Ravil',
      age: 24,
      meta: {
        emailVerified: true,
        auth: {
          login: 'berishev@fartix.com',
          password: 'myPassword123',
        },
      },
    };
    const validateResult1 = validateMapSync(user, {
      name: [isRequiredRule.revertSimple()],
      age: [isRequiredRule],
      meta: { auth: [isRequiredRule] },
    });
    expect(validateResult1.length).toBe(3);
    expect(validateResult1[0].key).toEqual(['name']);
    expect(validateResult1[1].key).toEqual(['age']);
    expect(validateResult1[2].key).toEqual(['meta', 'auth']);
    expect(validateResult1[0].rules.length).toBe(1);
    expect(validateResult1[0].rules[0].isValid).toBe(false);
    expect(validateResult1[0].rules[0].name).toBe(isRequiredRule.revertSimple().ruleName);

    const validateResult2 = validateMapSync(
      user,
      {
        name: [isRequiredRule],
        age: [isRequiredRule],
        meta: { auth: [isRequiredRule, isRequiredRule.revertSimple()] },
      },
      true,
    );

    expect(validateResult2.length).toBe(1);
    expect(validateResult2[0].key).toEqual(['meta', 'auth']);
    expect(validateResult2[0].rules.length).toBe(1);
    expect(validateResult2[0].rules[0].isValid).toBe(false);
    expect(validateResult2[0].rules[0].name).toBe(isRequiredRule.revertSimple().ruleName);
  });
});
