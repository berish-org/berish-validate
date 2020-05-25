import { IValidateRule } from './types';

const rules: { [name: string]: IValidateRule<any> } = {};

export function registerRule(rule: IValidateRule<any>) {
  rules[rule.ruleName] = rule;
}

export function unregisterRule(name: string) {
  const rule = getRegisteredRule(name);
  if (rule) delete rules[name];
}

export function getRegisteredRule(name: string) {
  return rules[name];
}

export function isRegisteredRule(name: string) {
  return getRegisteredRule(name) && true;
}
