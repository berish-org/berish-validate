import { IValidateRule, IRuleErrorTextResult } from '../rule';

export interface IRulePlugin {
  upgradeRuleBeforeInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeRuleAfterInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
}

export interface IRulePluginDefault<PluginParams> extends IRulePlugin {
  (params?: PluginParams): IRulePlugin;
}
