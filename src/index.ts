import { callPlugin, useUpgradeGlobalModule } from './pluginSystem';
import * as globalModule from './globalModule';

callPlugin(globalModule, (plugin, mod) => useUpgradeGlobalModule(plugin, mod));

export * from './pluginSystem';
export * from './globalModule';
