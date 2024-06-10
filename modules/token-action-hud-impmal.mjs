import { SystemManagerImpMal } from './SystemManager.mjs'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.mjs'

Hooks.on('tokenActionHudCoreApiReady', async () => {
    /**
     * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
     */
    const module = game.modules.get(MODULE.ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager: SystemManagerImpMal
    }
    Hooks.call('tokenActionHudSystemReady', module)
})
