import { ValidateMap } from './validateMap';
import { isRuleArray } from '../rule/isRuleArray';
import { isRuleMap } from '../rule/isRuleMap';
import { isRuleTuple } from '../rule/isRuleTuple';

export function isValidateMap(obj: any): obj is ValidateMap<any> {
  if (isRuleArray(obj)) return true;
  if (isRuleMap(obj)) return true;
  if (isRuleTuple(obj)) return true;
  return false;
}
