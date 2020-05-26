import { of } from '@berish/pathof';
import { IValidateRule, IRuleErrorTextResult } from '../rule/types';
import { createRule } from '../rule/createRule';
import { getRulesFromMap } from './getRulesFromMap';
import { executeRuleSync, executeRuleAsync } from '../rule/executeRule';
import { FLAG_CONDITION_TRUTHY } from '../rule/flags';

export type RuleArrayType = IValidateRule<any>[];
export type RuleMapType<T> = {
  [Key in keyof T]?: ValidateMap<T[Key]>;
};
export type RuleTupleType<T> = [RuleArrayType, RuleMapType<T>];
export type ValidateMap<T> = RuleArrayType | RuleMapType<T> | RuleTupleType<T>;

export interface IValidationRuleResult {
  name: string;
  isValid: boolean;
  errorText: IRuleErrorTextResult;
}

export interface IValidationResult {
  key: (string | number | symbol)[];
  rules: IValidationRuleResult[];
}

export function validateMapSync<T>(obj: T, map: ValidateMap<T>, showOnlyInvalid?: boolean): IValidationResult[] {
  const rulesWithPaths = getRulesFromMap(map);
  if (rulesWithPaths.length <= 0) return [];
  const pathResult: IPathResult<any, T> = of(obj);
  const data = rulesWithPaths.map<IValidationResult>(([path, rules]) => {
    const subPathResult = path.reduce((of, key) => of(key as any), pathResult);
    const results = rules
      .map<IValidationRuleResult>(rule => {
        if (!rule) return null;
        const key = subPathResult.path.length === 0 ? null : subPathResult.path[subPathResult.path.length - 1];
        const value = subPathResult.get();
        const executeResult = executeRuleSync(rule, { target: obj, key, value });
        return {
          name: rule.ruleName,
          isValid: executeResult === FLAG_CONDITION_TRUTHY,
          errorText: executeResult === FLAG_CONDITION_TRUTHY ? null : (executeResult as IRuleErrorTextResult),
        };
      })
      .filter(m => !!m);
    return { key: subPathResult.path, rules: results };
  });
  return data.filter(m => {
    if (showOnlyInvalid) {
      m.rules = m.rules.filter(m => !m.isValid);
      if (m.rules.length <= 0) return false;
    }
    return true;
  });
}

export async function validateMapAsync<T>(
  obj: T,
  map: ValidateMap<T>,
  showOnlyInvalid?: boolean,
): Promise<IValidationResult[]> {
  const rulesWithPaths = getRulesFromMap(map);
  if (rulesWithPaths.length <= 0) return [];
  const pathResult: IPathResult<any, T> = of(obj);
  const data = await Promise.all(
    rulesWithPaths.map<Promise<IValidationResult>>(async ([path, rules]) => {
      const subPathResult = path.reduce((of, key) => of(key as any), pathResult);
      const results = await Promise.all(
        rules
          .map<Promise<IValidationRuleResult>>(async rule => {
            if (!rule) return null;
            const key = subPathResult.path.length === 0 ? null : subPathResult.path[subPathResult.path.length - 1];
            const value = subPathResult.get();
            const executeResult = await executeRuleAsync(rule, { target: obj, key, value });
            return {
              name: rule.ruleName,
              isValid: executeResult === FLAG_CONDITION_TRUTHY,
              errorText: executeResult === FLAG_CONDITION_TRUTHY ? null : (executeResult as IRuleErrorTextResult),
            };
          })
          .filter(m => !!m),
      );
      return { key: subPathResult.path, rules: results };
    }),
  );
  return data.filter(m => {
    if (showOnlyInvalid) {
      m.rules = m.rules.filter(m => !m.isValid);
      if (m.rules.length <= 0) return false;
    }
    return true;
  });
}
