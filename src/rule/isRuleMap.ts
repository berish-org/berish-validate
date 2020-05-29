import { RuleMapType } from '../validateMap/validateMap';
import { isValidateMap } from '../validateMap/isValidateMap';
import { isRuleReference } from './isRuleReference';
import { isRuleReferenceTuple } from './isRuleReferenceTuple';

export function isRuleMap(obj: any): obj is RuleMapType<any> {
  if (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.entries(obj).every(m => isRuleReference(m[1]) || isRuleReferenceTuple(m[1]) || isValidateMap(m[1]))
  )
    return true;
  return false;
}
