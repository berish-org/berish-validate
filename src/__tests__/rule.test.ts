import { createRule, isRule, isRuleArray, isRuleTuple, isRuleMap, isRegisteredRule, createSimpleRule } from '../rule';
import {
  isValidateMap,
  validateMapSync,
  getValidateMapCompact,
  zipValidateMapCompact,
  ValidateMapCompact,
  ValidateMap,
} from '../validateMap';
import { FLAG_CONDITION_TRUTHY, FLAG_CONDITION_FALSY } from '../rule/flags';

describe('rule test', () => {
  const isRequiredRule = createRule({
    name: 'isRequired',
    conditionSync: ({ value }) => typeof value === 'number' || !!value,
    conditionAsync: ({ value }) => Promise.resolve(typeof value === 'number' || !!value),
  });

  const range = createSimpleRule<[number, number]>({
    name: 'range',
    conditionSync: ({ value, body: [minValue, maxValue] }) => {
      if (typeof value !== 'number') return 'Значение не является числом';
      if (typeof minValue !== 'number' || typeof maxValue !== 'number') return 'Некорректный диапозон';
      return value >= minValue && value <= maxValue
        ? true
        : `Значение должно быть в диапозоне от ${minValue} до ${maxValue}`;
    },
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

  test('zipValidateMapCompact', () => {
    const rule1 = createRule({ name: 'rule1' });
    const rule2 = createRule({ name: 'rule2' });
    const rule3 = createRule({ name: 'rule3' });

    const validateMapCompact: ValidateMapCompact = [
      [
        ['a', 'b'],
        [rule1, rule2],
      ],
      [['a', 'b'], [rule3]],
      [['a', 'k'], { $$ref: ['a', 'b'] }],
      [['a', 'k'], [rule1]],
    ];

    const zipMap = zipValidateMapCompact(validateMapCompact);
    expect(zipMap).toEqual([
      [
        ['a', 'b'],
        [rule1, rule2, rule3],
      ],
      [
        ['a', 'k'],
        [[rule1], { $$ref: ['a', 'b'] }],
      ],
    ]);
  });

  test('getValidateMapCompact', () => {
    const rule1 = createRule({ name: 'rule1' });
    const rule2 = createRule({ name: 'rule2' });
    const rule3 = createRule({ name: 'rule3' });

    expect(getValidateMapCompact([rule1, rule2, rule3])).toEqual([[[], [rule1, rule2, rule3]]]);
    expect(getValidateMapCompact([rule1, 123 as any])).toEqual([]);
    expect(
      getValidateMapCompact([
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

    const hardMap: ValidateMap<any> = {
      x: { y: [rule1] },
      a: {
        b: [rule1],
        c: [
          [rule2],
          {
            d: [rule1],
            k: { $$ref: ['a', 'c'] },
            l: [[rule3], { $$ref: ['x', 'y'] }],
          },
        ],
      },
    };

    const hardMapCompact: ValidateMapCompact = [
      [['x', 'y'], [rule1]],
      [['a', 'b'], [rule1]],
      [['a', 'c'], [rule2]],
      [['a', 'c', 'd'], [rule1]],
      [['a', 'c', 'k'], { $$ref: ['a', 'c'] }],
      [
        ['a', 'c', 'l'],
        [[rule3], { $$ref: ['x', 'y'] }],
      ],
    ];

    expect(getValidateMapCompact(hardMap)).toEqual(hardMapCompact);
  });

  // test('validateMap', () => {
  //   const user = {
  //     name: 'Ravil',
  //     age: 24,
  //     meta: {
  //       emailVerified: true,
  //       auth: {
  //         login: 'berishev@fartix.com',
  //         password: 'myPassword123',
  //       },
  //     },
  //   };
  //   const validateResult1 = validateMapSync(user, {
  //     name: [isRequiredRule.revertSimple()],
  //     age: [isRequiredRule],
  //     meta: { auth: [isRequiredRule] },
  //   });
  //   expect(validateResult1.length).toBe(3);
  //   expect(validateResult1[0].key).toEqual(['name']);
  //   expect(validateResult1[1].key).toEqual(['age']);
  //   expect(validateResult1[2].key).toEqual(['meta', 'auth']);
  //   expect(validateResult1[0].rules.length).toBe(1);
  //   expect(validateResult1[0].rules[0].isValid).toBe(false);
  //   expect(validateResult1[0].rules[0].name).toBe(isRequiredRule.revertSimple().ruleName);

  //   const validateResult2 = validateMapSync(
  //     user,
  //     {
  //       name: [isRequiredRule],
  //       age: [isRequiredRule],
  //       meta: { auth: [isRequiredRule, isRequiredRule.revertSimple()] },
  //     },
  //     true,
  //   );

  //   expect(validateResult2.length).toBe(1);
  //   expect(validateResult2[0].key).toEqual(['meta', 'auth']);
  //   expect(validateResult2[0].rules.length).toBe(1);
  //   expect(validateResult2[0].rules[0].isValid).toBe(false);
  //   expect(validateResult2[0].rules[0].name).toBe(isRequiredRule.revertSimple().ruleName);
  // });

  test('validateMap hard case1', () => {
    interface IBook {
      name: string;
      pages: number;
      author: IAuthor;
    }
    interface IAuthor {
      firstname: string;
      age: number;
      lastBook: IBook;
    }

    const author1: IAuthor = {
      firstname: 'Ravil',
      age: 240,
      lastBook: null,
    };

    const author2: IAuthor = {
      firstname: 'Azat',
      age: 23,
      lastBook: null,
    };

    const book1: IBook = {
      name: 'firstBook',
      pages: 100,
      author: author1,
    };

    const book2: IBook = {
      name: 'secondBook',
      pages: 1001,
      author: author2,
    };
    author1.lastBook = book1;

    const obj = {
      book1,
    };

    const hardMap: ValidateMap<typeof obj> = {
      book1: [
        [isRequiredRule],
        {
          name: [isRequiredRule],
          pages: [isRequiredRule, range(100, 1000)],
          author: {
            firstname: [isRequiredRule],
            age: [range(10, 100)],
            lastBook: { $$ref: ['book1'] },
          },
        },
      ],
    };

    expect(validateMapSync(obj, hardMap)).toEqual([
      { key: ['book1'], rules: [{ name: isRequiredRule.ruleName, isValid: true, errorText: null }] },
      { key: ['book1', 'name'], rules: [{ name: isRequiredRule.ruleName, isValid: true, errorText: null }] },
      {
        key: ['book1', 'pages'],
        rules: [
          { name: isRequiredRule.ruleName, isValid: true, errorText: null },
          { name: range.ruleName, isValid: true, errorText: null },
        ],
      },
      {
        key: ['book1', 'author', 'firstname'],
        rules: [{ name: isRequiredRule.ruleName, isValid: true, errorText: null }],
      },
      {
        key: ['book1', 'author', 'age'],
        rules: [{ name: range.ruleName, isValid: false, errorText: 'Значение должно быть в диапозоне от 10 до 100' }],
      },
      { key: ['book1', 'author', 'lastBook'], rules: [] },
    ]);
  });
});
