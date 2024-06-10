import { GROUP } from './constants.mjs'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })

    const groupsArray = Object.values(groups)

    DEFAULTS = {
        layout: [
            {
                nestId: 'categoryCharacter',
                id: 'categoryCharacter',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.character'),
                groups: [
                    { ...groups.characteristicsFate, nestId: 'categoryCharacter_fate'},
                    { ...groups.characteristics, nestId: 'categoryCharacter_characteristics'},
                    { ...groups.characteristicsWoundsCorruption, nestId: 'categoryCharacter_woundsCorruption'},
                ],
            },
            {
                nestId: 'categorySkills',
                id: 'categorySkills',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.skills'),
                groups: [
                    {...groups.skillsBasic, nestId: 'categorySkills_skillsBasic'},
                    {...groups.skillsSpecialization, nestId: 'categorySkills_skillsSpecialization'},
                ],
            },
            {
                nestId: 'categoryTalents',
                id: 'categoryTalents',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.talents'),
                groups: [
                    {...groups.talents, nestId: 'categoryTalents_talents'},
                    {...groups.traits, nestId: 'categoryTalents_traits'},
                    {...groups.boonLiability, nestId: 'categoryTalents_boonsLiabilities'},
                ]
            },
            {
                nestId: 'categoryCombat',
                id: 'categoryCombat',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.combat'),
                groups: [
                    {...groups.combatDefendingAgainst, nestId: 'categoryCombat_combatDefendingAgainst'},
                    {...groups.combatActions, nestId: 'categoryCombat_combatActions'},
                    {...groups.combatTraits, nestId: 'categoryCombat_combatTraits'},
                    {...groups.combatProtection, nestId: 'categoryCombat_combatProtection'},
                    {...groups.combatForceFields, nestId: 'categoryCombat_combatForceField'},
                    {...groups.combatWeapons, nestId: 'categoryCombat_combatWeapons'},
                ],
                settings: { customWidth: 500 }
            },
            {
                nestId: 'categoryConditions',
                id: 'categoryConditions',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.conditions'),
                groups: [
                    { ...groups.conditions, nestId: 'categoryConditions_conditions' },
                ]
            },
            {
                nestId: 'categoryPowers',
                id: 'categoryPowers',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.powers'),
                groups: [
                    {...groups.powersActions, nestId: 'categoryPowers_actions'},
                    {...groups.powersMinor, nestId: 'categoryPowers_minor'},
                    {...groups.powersBiomancy, nestId: 'categoryPowers_biomancy'},
                    {...groups.powersDivination, nestId: 'categoryPowers_divination'},
                    {...groups.powersPyromancy, nestId: 'categoryPowers_pyromancy'},
                    {...groups.powersTelekinesis, nestId: 'categoryPowers_telekinesis'},
                    {...groups.powersTelepathy, nestId: 'categoryPowers_telepathy'},
                ],
                settings: { customWidth: 500 }
            },
            {
                nestId: 'categoryInventory',
                id: 'categoryInventory',
                name: coreModule.api.Utils.i18n('tokenActionHud.impmal.inventory'),
                groups: [
                    { ...groups.inventoryAmmo, nestId: 'categoryInventory_ammo' },
                    { ...groups.inventoryWeapon, nestId: 'categoryInventory_weapons' },
                    { ...groups.inventoryProtection, nestId: 'categoryInventory_protection' },
                    { ...groups.inventoryEquipment, nestId: 'categoryInventory_equipment' },
                    { ...groups.inventoryForceField, nestId: 'categoryInventory_forceField' },
                    { ...groups.inventoryAugmetic, nestId: 'categoryInventory_augmetics' },
                    { ...groups.inventoryModification, nestId: 'categoryInventory_modification' },
                ]
            },
            {
                nestId: 'categoryUtility',
                id: 'categoryUtility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    { ...groups.utilityCombat, nestId: 'categoryUtility_combat' },
                    { ...groups.utilityToken, nestId: 'categoryUtility_token' },
                    { ...groups.utilityCharacter, nestId: 'categoryUtility_character' },
                    { ...groups.utilityRest, nestId: 'categoryUtility_rest'},
                    { ...groups.utility, nestId: 'categoryUtility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
