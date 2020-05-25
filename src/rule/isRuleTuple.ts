import { RuleTupleType } from '../validateMap/validateMap';
import { isRuleArray } from './isRuleArray';
import { isRuleMap } from './isRuleMap';

export function isRuleTuple(obj: any): obj is RuleTupleType<any> {
  if (Array.isArray(obj) && obj.length === 2 && isRuleArray(obj[0]) && isRuleMap(obj[1])) return true;
  return false;
}
