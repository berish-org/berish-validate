import { IRulePlugin } from './abstract';
import { IValidateRule, IRuleErrorTextResult } from '../rule';
import * as globalModule from '../globalModule';

export function useUpgradeRuleBeforeInit(plugin: IRulePlugin, rule: IValidateRule<any>) {
  try {
    return (rule && plugin && plugin.upgradeRuleBeforeInit && plugin.upgradeRuleBeforeInit(rule)) || rule;
  } catch (err) {
    return rule;
  }
}

export function useUpgradeRuleAfterInit(plugin: IRulePlugin, rule: IValidateRule<any>) {
  try {
    return (rule && plugin && plugin.upgradeRuleAfterInit && plugin.upgradeRuleAfterInit(rule)) || rule;
  } catch (err) {
    return rule;
  }
}

export function useUpgradeGlobalModule(plugin: IRulePlugin, module: typeof globalModule) {
  try {
    const newModule = (plugin && plugin.upgradeGlobalModule && plugin.upgradeGlobalModule(module)) || module;
    if (newModule !== module)
      Object.entries(newModule).forEach(([key, value]) => Object.defineProperty(module, key, { value }));
    return module;
  } catch (err) {
    return module;
  }
}
