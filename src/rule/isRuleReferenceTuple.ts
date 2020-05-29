import { RuleReferenceTupleType } from '../validateMap/validateMap';
import { isRuleArray } from './isRuleArray';
import { isRuleReference } from './isRuleReference';

export function isRuleReferenceTuple(obj: any): obj is RuleReferenceTupleType {
  if (Array.isArray(obj) && obj.length === 2 && isRuleArray(obj[0]) && isRuleReference(obj[1])) return true;
  return false;
}
