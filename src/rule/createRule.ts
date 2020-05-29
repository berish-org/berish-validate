import guid from 'berish-guid';
import { registerRule, isRegisteredRule, getRegisteredRule, addRule } from './registrator';
import { IValidateRule, IRuleObject, IRuleObjectBody, IRuleObjectFlag, IRuleErrorTextResult } from './types';
import { IRuleFlag } from './createRuleFlag';
import { FLAG_CONDITION_TRUTHY, FLAG_CONDITION_FALSY } from './flags';
import { isRuleFlag } from './isRuleFlag';
import { useUpgradeRuleAfterRegister, callPlugin, useUpgradeRuleAfterInit } from '../pluginSystem';

export const SYMBOL_ERROR_TEXT_DEFAULT = Symbol('errorTextDefault');

export interface ICreateRuleParams<Body extends any[]> {
  name?: string;
  conditionSync?: (obj: IRuleObject & IRuleObjectBody<Body>) => boolean | IRuleFlag;
  conditionAsync?: (obj: IRuleObject & IRuleObjectBody<Body>) => boolean | IRuleFlag | Promise<boolean | IRuleFlag>;
  errorText?: (
    obj: IRuleObject & IRuleObjectBody<Body> & IRuleObjectFlag,
  ) => IRuleErrorTextResult | typeof SYMBOL_ERROR_TEXT_DEFAULT;
}

export function createRule<Body extends any[]>(params: ICreateRuleParams<Body>): IValidateRule<Body> {
  if (!params) throw new Error('params is undefined in createRule');

  const _createRule = (params: ICreateRuleParams<Body>, body: Body) => {
    const ruleName = params.name || `rule-${guid.generateId()}`;
    const defaultErrorText = `${ruleName}-error`;

    const rule: IValidateRule<Body> = (...args: Body) => _createRule(params, args);
    rule.ruleName = ruleName;
    Object.defineProperty(rule, 'name', { value: rule.ruleName });
    Object.defineProperty(rule, 'isRegistered', {
      get: function() {
        return isRegisteredRule(rule.ruleName);
      },
    });
    rule.revertSimple = newRuleName => {
      newRuleName = newRuleName || `${ruleName}-revertSimple`;
      return rule.revertError(newRuleName);
    };
    rule.revertError = (newRuleName, errorText) => {
      newRuleName = newRuleName || `${ruleName}-revertError`;
      if (isRegisteredRule(newRuleName)) return getRegisteredRule(newRuleName);
      const newRule = _createRule(
        {
          ...params,
          name: newRuleName,
          conditionSync: obj => {
            if (!params.conditionSync) return FLAG_CONDITION_FALSY;
            const result = params.conditionSync(obj);
            if (isRuleFlag(result)) {
              if (result === FLAG_CONDITION_TRUTHY) return FLAG_CONDITION_FALSY;
              if (result === FLAG_CONDITION_FALSY) return FLAG_CONDITION_TRUTHY;
              return FLAG_CONDITION_TRUTHY;
            }
            return !result;
          },
          conditionAsync: async obj => {
            if (!params.conditionSync && !params.conditionAsync) return FLAG_CONDITION_FALSY;
            const result = params.conditionAsync ? await params.conditionAsync(obj) : params.conditionSync(obj);
            if (isRuleFlag(result)) {
              if (result === FLAG_CONDITION_TRUTHY) return FLAG_CONDITION_FALSY;
              if (result === FLAG_CONDITION_FALSY) return FLAG_CONDITION_TRUTHY;
              return FLAG_CONDITION_TRUTHY;
            }
            return !result;
          },
          errorText,
        },
        body,
      );
      newRule.revertSimple = () => rule;
      newRule.revertError = () => rule;
      registerRule(newRule);
      return newRule;
    };
    rule.conditionSync = obj => {
      if (!params.conditionSync) return FLAG_CONDITION_TRUTHY;
      const result = params.conditionSync({ ...obj, body });
      if (isRuleFlag(result)) return result;
      return result ? FLAG_CONDITION_TRUTHY : FLAG_CONDITION_FALSY;
    };
    rule.conditionAsync = async obj => {
      if (!params.conditionSync && !params.conditionAsync) return FLAG_CONDITION_TRUTHY;
      const result = params.conditionAsync
        ? await params.conditionAsync({ ...obj, body })
        : params.conditionSync({ ...obj, body });
      if (isRuleFlag(result)) return result;
      return result ? FLAG_CONDITION_TRUTHY : FLAG_CONDITION_FALSY;
    };
    rule.errorText = obj => {
      if (!params.errorText) return defaultErrorText;
      const result = params.errorText({ ...obj, body });
      if (!result) return defaultErrorText;
      if (result === SYMBOL_ERROR_TEXT_DEFAULT) return defaultErrorText;
      return result;
    };

    addRule(rule);

    return callPlugin(rule, (plugin, rule) => useUpgradeRuleAfterInit(plugin, rule));
  };
  const rule = _createRule(params, [] as any);
  registerRule(rule);
  return callPlugin(rule, (plugin, rule) => useUpgradeRuleAfterRegister(plugin, rule));
}
