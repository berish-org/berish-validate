import { IRulePlugin } from './abstract';
import { IValidateRule, IRuleErrorTextResult } from '../rule';

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
