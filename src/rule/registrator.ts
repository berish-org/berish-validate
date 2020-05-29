import { IValidateRule } from './types';

const registeredRules: { [name: string]: IValidateRule<any> } = {};
let allRules: IValidateRule<any>[] = [];

export function registerRule(rule: IValidateRule<any>) {
  registeredRules[rule.ruleName] = rule;
}

export function unregisterRule(name: string) {
  const rule = getRegisteredRule(name);
  if (rule) delete registeredRules[name];
}

export function getRegisteredRule(name: string) {
  return registeredRules[name];
}

export function isRegisteredRule(name: string) {
  return getRegisteredRule(name) && true;
}

export function getRegisteredRules() {
  return Object.values(registeredRules);
}

export function addRule(rule: IValidateRule<any>) {
  if (allRules.indexOf(rule) === -1) allRules.push(rule);
}

export function removeRule(rule: IValidateRule<any>) {
  allRules = allRules.filter(m => m !== rule);
}

export function getAllRules() {
  return allRules;
}
