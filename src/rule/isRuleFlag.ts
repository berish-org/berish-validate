import { IRuleFlag } from './createRuleFlag';

export function isRuleFlag(flag: any): flag is IRuleFlag {
  if (flag && typeof flag.unique === 'symbol' && flag.isRuleFlag === true) return true;
  return false;
}
