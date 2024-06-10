/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-impmal'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '1.5'

/**
 * Action types
 */
export const ACTION_TYPE = {
    action: 'tokenActionHud.impmal.action',
    attack: 'tokenActionHud.impmal.attack',
    boonLiability: 'tokenActionHud.impmal.boonOrLiability',
    characteristic: 'tokenActionHud.impmal.characteristics',
    condition: 'tokenActionHud.impmal.condition',
    corruption: 'tokenActionHud.impmal.corruption',
    item: 'tokenActionHud.impmal.item',
    power: 'tokenActionHud.impmal.power',
    skill: 'tokenActionHud.impmal.skill',
    talent: 'tokenActionHud.impmal.talent',
    trait: 'tokenActionHud.impmal.trait',
    test: 'tokenActionHud.impmal.test',
    utility: 'tokenActionHud.utility',
    weapon: 'tokenActionHud.impmal.weapon',
}

/**
 * Groups
 */
export const GROUP = {
    boonLiability: { id: 'boonLiability', name: 'tokenActionHud.impmal.boonOrLiability', type: 'system' },
    characteristics: { id: 'characteristics', name: 'tokenActionHud.impmal.characteristics', type: 'system' },
    characteristicsFate: { id: 'characteristicsFate', name: 'tokenActionHud.impmal.fate', type: 'system' },
    characteristicsWoundsCorruption: { id: 'characteristicsWoundsCorruption', name: 'tokenActionHud.impmal.woundsCorruption', type: 'system' },
    combatDefendingAgainst: { id: 'combatDefendingAgainst', name: 'tokenActionHud.impmal.combatDefendingAgainst'},
    combatActions: { id: 'combatActions', name: 'tokenActionHud.impmal.combatActions', type: 'system' },
    combatTraits: { id: 'combatTraits', name: 'tokenActionHud.impmal.combatTraits', type: 'system' },
    combatForceFields: { id: 'combatForceField', name: 'tokenActionHud.impmal.combatForceFields', type: 'system' },
    combatWeapons: { id: 'combatWeapons', name: 'tokenActionHud.impmal.weapons', type: 'system'},
    combatProtection: {id: 'combatProtection', name: 'tokenActionHud.impmal.combatProtection', type: 'system'},
    conditions : { id: 'conditions', name: 'tokenActionHud.impmal.conditions', type: 'system' },
    equipment: { id: 'equipment', name: 'tokenActionHud.impmal.equipment', type: 'system' },
    powersActions: { id: 'powersActions', name: 'tokenActionHud.impmal.powersActions', type: 'system' },
    powersMinor: { id: 'powersMinor', name: 'tokenActionHud.impmal.powersMinor', type: 'system'},
    powersBiomancy: { id: 'powersBiomancy', name: 'tokenActionHud.impmal.powersBiomancy', type: 'system'},
    powersDivination: { id: 'powersDivination', name: 'tokenActionHud.impmal.powersDivination', type: 'system'},
    powersPyromancy: { id: 'powersPyromancy', name: 'tokenActionHud.impmal.powersPyromancy', type: 'system'},
    powersTelekinesis: { id: 'powersTelekinesis', name: 'tokenActionHud.impmal.powersTelekinesis', type: 'system'},
    powersTelepathy: { id: 'powersTelepathy', name: 'tokenActionHud.impmal.powersTelepathy', type: 'system'},
    skillsBasic: { id: 'skillsBasic', name: 'tokenActionHud.impmal.skillsBasic', type: 'system'},
    skillsSpecialization: { id: 'skillsSpecialization', name: 'tokenActionHud.impmal.skillsSpecialized', type: 'system'},
    talents: { id: 'talents', name: 'tokenActionHud.impmal.talents', type: 'system' },
    traits: { id: 'traits', name: 'tokenActionHud.impmal.traits', type: 'system'},
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' },
    utilityCharacter: { id: 'utilityCharacter', name: 'tokenActionHud.impmal.character', type: 'system' },
    utilityCombat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    utilityRest: { id: 'utilityRest', name: 'tokenActionHud.impmal.rest', type: 'system' },
    utilityToken: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    inventoryAmmo: { id: 'inventoryAmmo', name: 'tokenActionHud.impmal.ammo', type: 'system' },
    inventoryAugmetic: { id: 'inventoryAugmetic', name: 'tokenActionHud.impmal.augmetics', type: 'system' },
    inventoryEquipment: { id: 'inventoryEquipment', name: 'tokenActionHud.impmal.equipment', type: 'system' },
    inventoryForceField: { id: 'inventoryForceField', name: 'tokenActionHud.impmal.forceFields', type: 'system' },
    inventoryModification: { id: 'inventoryModification', name: 'tokenActionHud.impmal.modifications', type: 'system' },
    inventoryProtection: { id: 'inventoryProtection', name: 'tokenActionHud.impmal.protection', type: 'system' },
    inventoryWeapon: { id: 'inventoryWeapon', name: 'tokenActionHud.impmal.weapons', type: 'system' },
}

/**
 * Sub groups for a characters wounds and corruption.
 */
export const WOUND_CORRUPTION_GROUPS = {
    characteristicsCriticalWounds: { id: 'criticalWounds', itemType: 'critical', name: 'tokenActionHud.impmal.criticalWounds', type: 'system'},
    characteristicsInjuries: { id: 'injuries', itemType: 'injury', name: 'tokenActionHud.impmal.injuries', type: 'system'},
    characteristicsMutations: { id: 'corruptionMutations', itemType: 'corruption', category: 'mutation', name: 'tokenActionHud.impmal.mutations', type: 'system'},
    characteristicsMalignanicies: { id: 'corruptionMalignanicies', itemType: 'corruption', category: 'malignancy', name: 'tokenActionHud.impmal.malignancies', type: 'system'},
};

export const FORCEFIELD_ICONS = {
    inactive: '<i class="fa-light fa-shield"></i>',
    active: '<i class="fa-solid fa-shield"></i>',
    collapsed: '<i class="fa-solid fa-bolt"></i>',
}

/**
 * Carry types icons
 */
export const CARRY_TYPE_ICON = {
    equipmentUnequipped: '<i class="fa-regular fa-circle"></i>',
    equipmentEquipped: '<i class="fa-regular fa-circle-check"></i>',
    worn: '<i class="fas fa-tshirt fa-fw"></i>',
    wornShield: '<i class="fas fa-shield"></i>',
};

/**
 * Item types
 */
export const ITEM_TYPE = {
    ammo: { groupId: 'inventoryAmmo' },
    augmetic: { groupId: 'inventoryAugmetic' },
    boonLiability: { groupId: 'boonLiability'},
    corruption: { groupId: 'corruption' },
    critical: { groupId: 'critical' },
    duty: { groupId: 'duty' },
    equipment: { groupId: 'inventoryEquipment' },
    faction: { groupId: 'faction'},
    forceField: { groupId: 'inventoryForceField' },
    injury: { groupId: 'injury' },
    modification: { groupId: 'inventoryModification' },
    origin: { groupId: 'origin'},
    power: { groupId: 'power' },
    powerMinor: { groupId: 'powersMinor'},
    powerBiomancy: {groupId: 'powersBiomancy'},
    powerDivination: { groupId: 'powersDivination' },
    powerPyromancy: { groupId: 'powersPyromancy' },
    powerTelekinesis: { groupId: 'powersTelekinesis' },
    powerTelepathy: { groupId: 'powersTelepathy' },
    protection: { groupId: 'inventoryProtection'},
    role: { groupId: 'role' },
    specialisation: { groupId: 'specialisation' },
    talent: { groupId: 'talents' },
    trait: { groupId: 'traits' },
    weapon: { groupId: 'inventoryWeapon' },
}
