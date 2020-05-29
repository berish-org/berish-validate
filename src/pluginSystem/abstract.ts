import { IValidateRule, IRuleErrorTextResult } from '../rule';
import * as globalMethodsImport from '../index';

export interface IRulePlugin {
  upgradeRuleAfterInit?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeRuleAfterRegister?(rule: IValidateRule<any>): IValidateRule<any> | void;
  upgradeMethods?(
    globalMethods: typeof globalMethodsImport,
  ): typeof globalMethodsImport | { [key: string]: any } | void;
}

export interface IRulePluginDefault<PluginParams> extends IRulePlugin {
  (params?: PluginParams): IRulePlugin;
}
