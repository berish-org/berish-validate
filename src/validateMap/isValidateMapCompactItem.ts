import { ValidateMapCompactItem } from './validateMap';
import { isRuleArray, isRuleReference, isRuleReferenceTuple } from '../rule';

export function isValidateMapCompactItem(obj: any): obj is ValidateMapCompactItem {
  if (Array.isArray(obj) && obj.length === 2) {
    const [keys, value] = obj;
    const checkKeys =
      Array.isArray(keys) && keys.every(m => typeof m === 'string' || typeof m === 'number' || typeof m === 'symbol');
    const checkValue = isRuleArray(value) || isRuleReference(value) || isRuleReferenceTuple(value);
    if (checkKeys && checkValue) return true;
  }
  return false;
}
