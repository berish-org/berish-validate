import { IValidateRule, IRuleErrorTextResult } from '../rule';
import * as globalModule from '../globalModule';

export interface IRulePlugin {
  upgradeRuleBeforeInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeRuleAfterInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeGlobalModule?(module: typeof globalModule): typeof globalModule | { [key: string]: any } | void;
}

export interface IRulePluginDefault<PluginParams> extends IRulePlugin {
  (params?: PluginParams): IRulePlugin;
}
