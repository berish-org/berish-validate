import { IValidateRule, IRuleErrorTextResult } from '../rule';
import * as globalMethodsImport from '../index';

export interface IRulePlugin {
  upgradeRuleBeforeInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeRuleAfterInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeMethods?(
    globalMethods: typeof globalMethodsImport,
  ): typeof globalMethodsImport | { [key: string]: any } | void;
}

export interface IRulePluginDefault<PluginParams> extends IRulePlugin {
  (params?: PluginParams): IRulePlugin;
}
