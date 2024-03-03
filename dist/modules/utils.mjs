import { MODULE } from './constants.mjs'

export let Utils = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Utility functions
     */
    Utils = class Utils {

        /**
         * Performs an animated scroll effect to view the message identified by messageId.
         */
        static scrollToMessage(messageId)
        {
            let message = ui.chat.element.find(`[data-message-id='${messageId}']`)[0];

            if (!message)
            {
                return;
            }

            ui.chat.element.find("ol").animate({scrollTop: message.offsetTop}, 800);
            // Scrolling into view will remove the highlight, so add it for 1 second then remove
            message.classList.add("highlight-delayed");
            setTimeout((message) =>
            {
                message.classList.remove("highlight-delayed");
            }, 1000, message);
        }

        /**
         * @param {Item} item The ranged weapon to compute ammo used for.
         * @param {object} options
         */
        static computeAmmoUsed(item, options = {}) {
            options = Object.assign({burst: false, rapidFire: false}, options);
            const hasBurst = item.system?.traits.has('burst') || item.system?.traits.has('rapidFire');
            const hasRapidFire = item.system?.traits.has('rapidFire');

            if (game.settings.get("impmal", "countEveryBullet"))
            {
                let multiplier = 5;

                if (hasBurst && options.burst) {
                    return multiplier;
                } else if (hasRapidFire && options.rapidFire) {
                    return item.system.traits.has("rapidFire").value * multiplier;
                } else {
                    return 1;
                }
            }
            else // RAW
            {
                let baseAmmoUsed; // RapidFire and Burst weapons don't consume ammo unless those traits are used
                if (hasRapidFire || hasBurst) {
                    baseAmmoUsed =  0;
                }
                else {
                    baseAmmoUsed = 1;
                }

                return baseAmmoUsed + (options.burst ? 1 : 0) + (options.rapidFire ? Number(item.system.traits.has("rapidFire").value) : 0);
            }
        }

        /**
         * Get setting
         * @param {string} key               The key
         * @param {string=null} defaultValue The default value
         * @returns {string}                 The setting value
         */
        static getSetting (key, defaultValue = null) {
            let value = defaultValue ?? null
            try {
                value = game.settings.get(MODULE.ID, key)
            } catch {
                coreModule.api.Logger.debug(`Setting '${key}' not found`)
            }
            return value
        }

        /**
         * Set setting
         * @param {string} key   The key
         * @param {string} value The value
         */
        static async setSetting (key, value) {
            try {
                value = await game.settings.set(MODULE.ID, key, value)
                coreModule.api.Logger.debug(`Setting '${key}' set to '${value}'`)
            } catch {
                coreModule.api.Logger.debug(`Setting '${key}' not found`)
            }
        }
    }
})
