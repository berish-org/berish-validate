import { RuleMapType } from '../validateMap/validateMap';
import { isValidateMap } from '../validateMap/isValidateMap';

export function isRuleMap(obj: any): obj is RuleMapType<any> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && Object.entries(obj).every(m => isValidateMap(m[1])))
    return true;
  return false;
}
