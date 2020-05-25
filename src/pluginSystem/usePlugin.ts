import { IRulePlugin } from './abstract';

export const plugins: IRulePlugin[] = [];

export function usePlugin(...include: IRulePlugin[]) {
  include = include.filter(m => plugins.indexOf(m) === -1);
  plugins.push(...include);
}

export function callPlugin<T>(initialValue: T, callbackPlugin: (plugin: IRulePlugin, initialValue: T) => T) {
  return plugins.reduce((out, plugin) => callbackPlugin(plugin, out), initialValue);
}
