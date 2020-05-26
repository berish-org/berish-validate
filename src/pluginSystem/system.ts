import { IRulePlugin } from './abstract';
import { IValidateRule } from '../rule';
import * as globalMethodsImport from '../index';

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

export function useUpgradeMethods(plugin: IRulePlugin, globalMethods: typeof globalMethodsImport) {
  try {
    const newGlobalMethods = (plugin && plugin.upgradeMethods && plugin.upgradeMethods(globalMethods)) || globalMethods;
    if (newGlobalMethods !== globalMethods)
      Object.entries(newGlobalMethods).forEach(
        ([key, value]) =>
          typeof globalMethods[key] === 'undefined' && Object.defineProperty(globalMethods, key, { value }),
      );
    return globalMethods;
  } catch (err) {
    return globalMethods;
  }
}
