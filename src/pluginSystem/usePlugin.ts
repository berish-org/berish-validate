import { IRulePlugin } from './abstract';
import { useUpgradeMethods, useUpgradeRuleAfterInit, useUpgradeRuleAfterRegister } from './system';
import * as globalMethods from '../index';
import { getAllRules, getRegisteredRules } from '../rule';

export const plugins: IRulePlugin[] = [];

function _callPlugin<T>(
  plugins: IRulePlugin[],
  initialValue: T,
  callbackPlugin: (plugin: IRulePlugin, initialValue: T) => T,
) {
  return plugins.reduce((out, plugin) => callbackPlugin(plugin, out), initialValue);
}

export function usePlugin(...include: IRulePlugin[]) {
  include = include.filter(m => plugins.indexOf(m) === -1);
  if (include.length > 0) {
    plugins.push(...include);
    _callPlugin(include, globalMethods, (plugin, globalMethods) => useUpgradeMethods(plugin, globalMethods));
    getAllRules().forEach(rule => {
      _callPlugin(include, rule, (plugin, rule) => useUpgradeRuleAfterInit(plugin, rule));
    });
    getRegisteredRules().forEach(rule => {
      _callPlugin(include, rule, (plugin, rule) => useUpgradeRuleAfterRegister(plugin, rule));
    });
  }
}

export function callPlugin<T>(initialValue: T, callbackPlugin: (plugin: IRulePlugin, initialValue: T) => T) {
  return _callPlugin(plugins, initialValue, callbackPlugin);
}
