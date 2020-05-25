import { IRuleFlag } from './createRuleFlag';

export interface IRuleObject {
  target: any;
  key: string | number | symbol;
  value: any;
}

export type IRuleErrorTextResult = string;

export interface IRuleObjectBody<Body> {
  body?: Body;
}

export interface IRuleObjectFlag {
  flag?: IRuleFlag;
}

export interface IValidateRule<Body extends any[]> {
  (...args: Body): IValidateRule<Body>;
  ruleName: string;
  readonly isRegistered?: boolean;
  conditionSync: (obj: IRuleObject) => IRuleFlag;
  conditionAsync: (obj: IRuleObject) => Promise<IRuleFlag>;
  errorText: (obj: IRuleObject & IRuleObjectFlag) => IRuleErrorTextResult;
  revertSimple: (ruleName?: string) => IValidateRule<Body>;
  revertError: (
    ruleName?: string,
    errorText?: (obj: IRuleObject & IRuleObjectBody<Body> & IRuleObjectFlag) => IRuleErrorTextResult,
  ) => IValidateRule<Body>;
}
