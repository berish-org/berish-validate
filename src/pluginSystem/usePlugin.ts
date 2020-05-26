import { IRulePlugin } from './abstract';
import { useUpgradeMethods } from './system';
import * as globalMethods from '../index';

export const plugins: IRulePlugin[] = [];

export function usePlugin(...include: IRulePlugin[]) {
  include = include.filter(m => plugins.indexOf(m) === -1);
  if (include.length > 0) {
    plugins.push(...include);
    include.reduce((out, plugin) => useUpgradeMethods(plugin, out), globalMethods);
  }
}

export function callPlugin<T>(initialValue: T, callbackPlugin: (plugin: IRulePlugin, initialValue: T) => T) {
  return plugins.reduce((out, plugin) => callbackPlugin(plugin, out), initialValue);
}
