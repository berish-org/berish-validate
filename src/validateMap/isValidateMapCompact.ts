import { ValidateMapCompact } from './validateMap';
import { isValidateMapCompactItem } from './isValidateMapCompactItem';

export function isValidateMapCompact(obj: any): obj is ValidateMapCompact {
  if (obj && Array.isArray(obj) && obj.every(m => isValidateMapCompactItem(m))) return true;
  return false;
}
