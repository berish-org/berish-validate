import { IValidateRule } from './types';

export function isRule(rule: any): rule is IValidateRule<any> {
  if (
    rule &&
    typeof rule === 'function' &&
    typeof rule.ruleName === 'string' &&
    'isRegistered' in rule &&
    'conditionSync' in rule &&
    'conditionAsync' in rule
  )
    return true;
  return false;
}
