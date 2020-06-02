import guid from 'berish-guid';
import { IRuleObject, IRuleObjectBody, IRuleErrorTextResult, IValidateRule } from './types';
import { createRule, SYMBOL_ERROR_TEXT_DEFAULT } from './createRule';
import { createRuleFlag, IRuleFlag } from './createRuleFlag';
import { FLAG_CONDITION_FALSY, FLAG_CONDITION_TRUTHY } from './flags';

export interface ICreateSimpleRuleParams<Body extends any[]> {
  name?: string;
  conditionSync?: (obj: IRuleObject & IRuleObjectBody<Body>) => boolean | IRuleErrorTextResult | void;
  conditionAsync?: (
    obj: IRuleObject & IRuleObjectBody<Body>,
  ) => boolean | IRuleErrorTextResult | void | Promise<boolean | IRuleErrorTextResult | void>;
}

export function createSimpleRule<Body extends any[]>(params: ICreateSimpleRuleParams<Body>): IValidateRule<Body> {
  const ruleName = params.name || `rule-simple-${guid.generateId()}`;
  let cacheFlags: [IRuleFlag, IRuleErrorTextResult][] = [];

  return createRule({
    name: ruleName,
    conditionSync:
      params.conditionSync &&
      (obj => {
        const result = params.conditionSync(obj);
        if (!result) return FLAG_CONDITION_FALSY;
        if (result === true) return FLAG_CONDITION_TRUTHY;
        const flagId = createRuleFlag(`ruleSimple-flagId-${guid.generateId()}`);
        cacheFlags.push([flagId, result]);
        return flagId;
      }),
    conditionAsync:
      (params.conditionAsync || params.conditionSync) &&
      (async obj => {
        const result = params.conditionAsync ? await params.conditionAsync(obj) : params.conditionSync(obj);
        if (!result) return FLAG_CONDITION_FALSY;
        if (result === true) return FLAG_CONDITION_TRUTHY;
        const flagId = createRuleFlag(`ruleSimple-flagId-${guid.generateId()}`);
        cacheFlags.push([flagId, result]);
        return flagId;
      }),
    errorText: obj => {
      const flag = obj.flag;
      if (!flag || flag === FLAG_CONDITION_FALSY) return SYMBOL_ERROR_TEXT_DEFAULT;
      const cacheResult = cacheFlags.filter(m => m[0] === flag)[0];
      if (!cacheResult) return SYMBOL_ERROR_TEXT_DEFAULT;
      const errorText = cacheResult[1];
      cacheFlags = cacheFlags.filter(m => m[0] !== flag);
      return errorText;
    },
  });
}
