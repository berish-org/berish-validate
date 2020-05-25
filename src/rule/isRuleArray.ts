import { IValidateRule } from './types';
import { isRule } from './isRule';
import { RuleArrayType } from '../validateMap/validateMap';

export function isRuleArray(obj: any): obj is RuleArrayType {
  if (Array.isArray(obj)) return obj.every(m => isRule(m));
  return false;
}
