import { RuleReferenceType } from '../validateMap';

export function isRuleReference(obj: any): obj is RuleReferenceType {
  if (obj && typeof obj === 'object' && obj.$$ref && Array.isArray(obj.$$ref)) return true;
  return false;
}
