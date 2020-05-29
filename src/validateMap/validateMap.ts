import { of } from '@berish/pathof';
import { IValidateRule, IRuleErrorTextResult } from '../rule/types';
import { getValidateMapCompact } from './getValidateMapCompact';
import { zipValidateMapCompact } from './zipValidateMapCompact';
import { executeRuleSync, executeRuleAsync } from '../rule/executeRule';
import { FLAG_CONDITION_TRUTHY } from '../rule/flags';
import { isValidateMapCompact } from './isValidateMapCompact';
import { isValidateMap } from './isValidateMap';
import { isRuleArray, isRuleReference, isRuleReferenceTuple } from '../rule';
import LINQ from '@berish/linq';

export type RuleArrayType = IValidateRule<any>[];
export type RuleTupleType<T> = [RuleArrayType, RuleMapType<T>];
export type RuleReferenceType = { $$ref: (string | symbol | number)[] };
export type RuleReferenceTupleType = [RuleArrayType, RuleReferenceType];
export type RuleMapType<T> = {
  [Key in keyof T]?: RuleReferenceType | RuleReferenceTupleType | ValidateMap<T[Key]>;
};
export type ValidateMap<T> = RuleArrayType | RuleMapType<T> | RuleTupleType<T>;
export type ValidateMapCompactItem = [
  (string | symbol | number)[],
  RuleArrayType | RuleReferenceType | RuleReferenceTupleType,
];
export type ValidateMapCompact = ValidateMapCompactItem[];

export interface IValidationRuleResult {
  name: string;
  isValid: boolean;
  errorText: IRuleErrorTextResult;
}

export interface IValidationResult {
  key: (string | number | symbol)[];
  rules: IValidationRuleResult[];
}

export function validateMapSync<T>(
  obj: T,
  map: ValidateMap<T> | ValidateMapCompact,
  showOnlyInvalid?: boolean,
): IValidationResult[] {
  const globalValidateMapCompact = isValidateMapCompact(map)
    ? zipValidateMapCompact(map)
    : isValidateMap(map)
    ? getValidateMapCompact(map)
    : null;
  if (!globalValidateMapCompact) return null;
  if (globalValidateMapCompact.length <= 0) return [];
  const cacheSet = new WeakSet();

  const _validateMapMethod = (obj: T, validateMapCompact: ValidateMapCompact): IValidationResult[] => {
    const currentPathResult: IPathResult<any, T> = of(obj);
    const data = validateMapCompact.map<IValidationResult[]>(([dataPath, rulesRef]) => {
      const dataKey = dataPath.length === 0 ? null : dataPath[dataPath.length - 1];
      const dataValue = dataPath.reduce((of, key) => of(key as any), currentPathResult).get();
      const isObject = dataValue !== null && typeof dataValue === 'object';
      const isCache = isObject && cacheSet.has(dataValue);
      const [rules, ref]: RuleReferenceTupleType = isRuleReference(rulesRef)
        ? [[], rulesRef]
        : isRuleReferenceTuple(rulesRef)
        ? rulesRef
        : isRuleArray(rulesRef)
        ? [rulesRef, null]
        : [[], null];

      if (isObject && !isCache) cacheSet.add(dataValue);

      const validateResults: IValidationResult[] = [];
      const resultOfRules = rules
        .map<IValidationRuleResult>(rule => {
          if (!rule) return null;
          const executeResult = executeRuleSync(rule, { target: obj, key: dataKey, value: dataValue });
          return {
            name: rule.ruleName,
            isValid: executeResult === FLAG_CONDITION_TRUTHY,
            errorText: executeResult === FLAG_CONDITION_TRUTHY ? null : (executeResult as IRuleErrorTextResult),
          };
        })
        .filter(m => !!m);
      validateResults.push({ key: dataPath, rules: resultOfRules });
      if (ref && isObject && !isCache) {
        const { $$ref } = ref;
        const refMap: ValidateMapCompact = globalValidateMapCompact
          // Получаем элементы из глобальной карты по началу пути
          .filter(m => $$ref.every((key, i) => m[0][i] === key))
          // Очищаем найденные пути от текущего пути
          .map(m => [m[0].filter((key, i) => typeof $$ref[i] === 'undefined' || $$ref[i] !== key), m[1]]);
        // console.log(refMap);
        if (refMap.length > 0) {
          const items = _validateMapMethod(dataValue, refMap);
          if (items.length > 0) {
            const itemsWithCorretKeys = items.map(m => ({ key: dataPath.concat(...m.key), rules: m.rules }));
            const itemsNeedConcat = itemsWithCorretKeys.filter(
              m => m.key.length === dataPath.length && m.key.every((k, i) => dataPath[i] === k),
            );
            if (itemsNeedConcat.length > 0) {
              validateResults[0].rules = [
                ...validateResults[0].rules,
                ...LINQ.from(itemsNeedConcat)
                  .selectMany(m => m.rules)
                  .toArray(),
              ];
              validateResults.push(...itemsWithCorretKeys.filter(m => itemsNeedConcat.indexOf(m) === -1));
            } else validateResults.push(...itemsWithCorretKeys);
          }
        }
      }
      return validateResults;
      // return { key: subPathResult.path, rules: validateRuleResults };
    });
    return LINQ.from(data)
      .selectMany(m => m)
      .toArray();
  };
  const results = _validateMapMethod(obj, globalValidateMapCompact);
  if (!showOnlyInvalid) return results;
  return results.filter(m => {
    m.rules = m.rules.filter(m => !m.isValid);
    return m.rules.length > 0;
  });
}

export async function validateMapAsync<T>(
  obj: T,
  map: ValidateMap<T> | ValidateMapCompact,
  showOnlyInvalid?: boolean,
): Promise<IValidationResult[]> {
  const globalValidateMapCompact = isValidateMapCompact(map)
    ? zipValidateMapCompact(map)
    : isValidateMap(map)
    ? getValidateMapCompact(map)
    : null;
  if (!globalValidateMapCompact) return null;
  if (globalValidateMapCompact.length <= 0) return [];
  const cacheSet = new WeakSet();

  const _validateMapMethod = async (obj: T, validateMapCompact: ValidateMapCompact): Promise<IValidationResult[]> => {
    const currentPathResult: IPathResult<any, T> = of(obj);
    const data = await Promise.all(
      validateMapCompact.map<Promise<IValidationResult[]>>(async ([dataPath, rulesRef]) => {
        const dataKey = dataPath.length === 0 ? null : dataPath[dataPath.length - 1];
        const dataValue = dataPath.reduce((of, key) => of(key as any), currentPathResult).get();
        const isObject = dataValue !== null && typeof dataValue === 'object';
        const isCache = isObject && cacheSet.has(dataValue);
        const [rules, ref]: RuleReferenceTupleType = isRuleReference(rulesRef)
          ? [[], rulesRef]
          : isRuleReferenceTuple(rulesRef)
          ? rulesRef
          : isRuleArray(rulesRef)
          ? [rulesRef, null]
          : [[], null];

        if (isObject && !isCache) cacheSet.add(dataValue);

        const validateResults: IValidationResult[] = [];
        const resultOfRules = await Promise.all(
          rules.map<Promise<IValidationRuleResult>>(async rule => {
            if (!rule) return null;
            const executeResult = await executeRuleAsync(rule, { target: obj, key: dataKey, value: dataValue });
            return {
              name: rule.ruleName,
              isValid: executeResult === FLAG_CONDITION_TRUTHY,
              errorText: executeResult === FLAG_CONDITION_TRUTHY ? null : (executeResult as IRuleErrorTextResult),
            };
          }),
        ).then(results => results.filter(m => !!m));
        validateResults.push({ key: dataPath, rules: resultOfRules });
        if (ref && isObject && !isCache) {
          const { $$ref } = ref;
          const refMap: ValidateMapCompact = globalValidateMapCompact
            // Получаем элементы из глобальной карты по началу пути
            .filter(m => $$ref.every((key, i) => m[0][i] === key))
            // Очищаем найденные пути от текущего пути
            .map(m => [m[0].filter((key, i) => typeof $$ref[i] === 'undefined' || $$ref[i] !== key), m[1]]);
          // console.log(refMap);
          if (refMap.length > 0) {
            const items = await _validateMapMethod(dataValue, refMap);
            if (items.length > 0) {
              const itemsWithCorretKeys = items.map(m => ({ key: dataPath.concat(...m.key), rules: m.rules }));
              const itemsNeedConcat = itemsWithCorretKeys.filter(
                m => m.key.length === dataPath.length && m.key.every((k, i) => dataPath[i] === k),
              );
              if (itemsNeedConcat.length > 0) {
                validateResults[0].rules = [
                  ...validateResults[0].rules,
                  ...LINQ.from(itemsNeedConcat)
                    .selectMany(m => m.rules)
                    .toArray(),
                ];
                validateResults.push(...itemsWithCorretKeys.filter(m => itemsNeedConcat.indexOf(m) === -1));
              } else validateResults.push(...itemsWithCorretKeys);
            }
          }
        }
        return validateResults;
      }),
    );
    return LINQ.from(data)
      .selectMany(m => m)
      .toArray();
  };
  const results = await _validateMapMethod(obj, globalValidateMapCompact);
  if (!showOnlyInvalid) return results;
  return results.filter(m => {
    m.rules = m.rules.filter(m => !m.isValid);
    return m.rules.length > 0;
  });
}
