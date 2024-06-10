// System Module Imports
import { ActionHandlerImpMal } from './ActionHandler.mjs'
import { RollHandlerImpMal } from './RollHandler.mjs'
import { DEFAULTS } from './defaults.mjs'
import { MODULE } from './constants.mjs';
import * as systemSettings from './settings.mjs'

export let SystemManagerImpMal = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's SystemManager class
     */
    SystemManagerImpMal = class SystemManagerImpMal extends coreModule.api.SystemManager {
        /**
         * Returns an instance of the ActionHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @returns {class} The ActionHandler instance
         */
        getActionHandler () {
            return new ActionHandlerImpMal()
        }

        /**
         * Returns a list of roll handlers to Token Action HUD Core
         * Used to populate the Roll Handler module setting choices
         * Called by Token Action HUD Core
         * @override
         * @returns {object} The available roll handlers
         */
        getAvailableRollHandlers () {
            const coreTitle = 'ImpMal'
            const choices = { core: coreTitle }
            return choices
        }


        /**
         * Returns an instance of the RollHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @param {string} rollHandlerId The roll handler ID
         * @returns {object}             The RollHandler instance
         */
        getRollHandler (rollHandlerId) {
            let rollHandler
            switch (rollHandlerId) {
            case 'core':
            default:
                rollHandler = new RollHandlerImpMal()
                break
            }
            return rollHandler
        }

        /**
         * Returns the default layout and groups to Token Action HUD Core
         * Called by Token Action HUD Core
         * @returns {Promise<object>} The default layout and groups
         */
        async registerDefaults () {
            return DEFAULTS
        }

        /**
         * Register Token Action HUD system module settings
         * Called by Token Action HUD Core
         * @override
         * @param {function} coreUpdate The Token Action HUD Core update function
         */
        registerSettings (coreUpdate) {
            systemSettings.register(coreUpdate)
        }
    }
})
