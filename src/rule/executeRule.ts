import { IValidateRule, IRuleObject, IRuleErrorTextResult } from './types';
import { FLAG_CONDITION_TRUTHY } from './flags';

export function executeRuleSync(
  rule: IValidateRule<any>,
  ruleObject: IRuleObject,
): IRuleErrorTextResult | typeof FLAG_CONDITION_TRUTHY {
  const flag = rule.conditionSync(ruleObject);
  if (flag === FLAG_CONDITION_TRUTHY) return FLAG_CONDITION_TRUTHY;
  return rule.errorText({ ...ruleObject, flag });
}

export async function executeRuleAsync(
  rule: IValidateRule<any>,
  ruleObject: IRuleObject,
): Promise<IRuleErrorTextResult | typeof FLAG_CONDITION_TRUTHY> {
  const flag = await rule.conditionAsync(ruleObject);
  if (flag === FLAG_CONDITION_TRUTHY) return FLAG_CONDITION_TRUTHY;
  return rule.errorText({ ...ruleObject, flag });
}
