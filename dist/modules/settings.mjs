import { MODULE } from './constants.mjs'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register (coreUpdate) {
    game.settings.register(MODULE.ID, 'displayUnequipped', {
        name: game.i18n.localize('tokenActionHud.impmal.settings.displayUnequipped.name'),
        hint: game.i18n.localize('tokenActionHud.impmal.settings.displayUnequipped.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    }),
    game.settings.register(MODULE.ID, 'showWeaponActionImages', {
        name: game.i18n.localize('tokenActionHud.impmal.settings.showWeaponActionImages.name'),
        hint: game.i18n.localize('tokenActionHud.impmal.settings.showWeaponActionImages.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    }),
    game.settings.register(MODULE.ID, 'showWeaponActionNames', {
        name: game.i18n.localize('tokenActionHud.impmal.settings.showWeaponActionNames.name'),
        hint: game.i18n.localize('tokenActionHud.impmal.settings.showWeaponActionNames.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })
}
