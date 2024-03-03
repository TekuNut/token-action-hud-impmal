// System Module Imports
import { ACTION_TYPE, ITEM_TYPE, GROUP, CARRY_TYPE_ICON, FORCEFIELD_ICONS, WOUND_CORRUPTION_GROUPS } from './constants.mjs'
import { Utils } from './utils.mjs'

/** @type {any} */
export let ActionHandlerImpMal = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandlerImpMal = class ActionHandlerImpMal extends coreModule.api.ActionHandler {
        // Initialize actor variables

        actors = null
        actorType = null
        items = [];
        itemCategories = {};
        skills = [];
        talents = [];
        boonsAndLiabilities = [];
        powers = [];

        displayUnequipped = false;
        showWeaponImages = false;
        showWeaponNames = false;
        #maxCharacters = 0;

        #findGroup(data = {}) {
            if (data?.nestId) {
                return this.groups[data.nestId]
            } else {
                return Object.values(this.groups).find(
                    group =>
                        (!data.id || group.id === data.id) &&
                        (!data.type || group.type === data.type) &&
                        (!data.level || group.level === data.level)
                )
            }
        }

        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions(groupIds) {
            // Set actor and token variables
            this.actors = (!this.actor) ? this.#getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Set setting variables.
            this.displayUnequipped = Utils.getSetting('displayUnequipped');
            this.showWeaponActionImages = Utils.getSetting('showWeaponActionImages');
            this.showWeaponActionNames = Utils.getSetting('showWeaponActionNames');

            // Set items variable
            if (this.actor) {
                let items = this.actor.items

                this.actorData = { id: this.actor.id };
                this.items = coreModule.api.Utils.sortItemsByName(items);
                this.itemCategories = this.actor.itemCategories;

                let skills = this.actor.system.skills;
                let skillSpecializations = this.actor.items.filter((item) => item.type == 'specialisation')
                let talents = this.#getActorTalents();
                let boonsAndLiabilities = this.#getActorBoonsAndLiabilities();
                let powers = this.actor.items.filter((item) => item.type == "power");

                this.skills = skills;
                this.skillSpecializations = skillSpecializations;
                this.talents = coreModule.api.Utils.sortItemsByName(talents);
                this.boonsAndLiabilities = boonsAndLiabilities;
                this.powers = powers;
            }

            if (this.actorType === 'character' || this.actorType == 'npc') {
                await this.#buildCharacterActions();

                const exceededWarpChargesIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';

                // Update the group to display the actors warp charge build-up.
                let inventoryGroup = this.#findGroup({ id: 'categoryInventory' });
                let powerGroup = this.#findGroup({ id: 'categoryPowers' });

                const tokenIds = canvas.tokens.controlled.map((token) => token.id);

                // Update the group to show encumberance.
                inventoryGroup.info1 = {
                    class: this.actor.system.encumbrance.state > 0 ? 'tah-spotlight' : '',
                    text: `${this.actor.system.encumbrance.value}/${this.actor.system.encumbrance.overburdened}`,
                    title: game.i18n.localize("tokenActionHud.impmal.tooltips.encumbrance")
                }

                // Add an icon when the actor has exceeded their warp charge threshold.
                powerGroup.icon1 = this.actor.system.warp.state >= 1 ? exceededWarpChargesIcon : null;
                powerGroup.info1 = {
                    class: this.actor.system.warp.state > 0 ? 'tah-spotlight' : '',
                    text: `${this.actor.system.warp.charge ?? 0}/${this.actor.system.warp.threshold ?? 0}`,
                    title: game.i18n.localize("tokenActionHud.impmal.tooltips.warpCharge")
                };
            } else if (!this.actor) {
                await this.#buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         */
        async #buildCharacterActions() {
            await this.#buildCharacteristics();
            await this.#buildCharacteristicsFate();
            await this.#buildCharacterWoundsAndCorruption();
            await this.#buildSkills();
            await this.#buildTalents();
            await this.#buildCombat();
            await this.#buildConditions();
            await this.#buildPowers();
            await this.#buildInventory();
            await this.#buildUtility();
        }

        /**
         * Build multiple token actions
         */
        async #buildMultipleTokenActions() {
        }



        /**
         * Build tests
         */
        async #buildCharacteristics() {
            if (this.tokens?.length === 0) return

            const groupData = GROUP.characteristics;
            const actions = [];

            // Get the list of characteristics.
            for (let characteristic in IMPMAL.characteristics) {
                let name = IMPMAL.characteristics[characteristic];
                let actionTypeName = game.i18n.localize(ACTION_TYPE.characteristic);
                let listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
                let encodedValue = ['characteristic', characteristic].join(this.delimiter);
                let info1 = {
                    class: '',
                    text: this.actor.system.characteristics[characteristic].total,
                    title: game.i18n.localize('tokenActionHud.impmal.tooltips.testTarget'),
                };

                actions.push({
                    id: characteristic,
                    name,
                    listName,
                    encodedValue,
                    info1
                });
            }

            // Create group data and add actions to HUD.
            this.addActions(actions, groupData);
        }

        /**
         * Build actions for manipulating a characters fate.
         * @returns
         */
        async #buildCharacteristicsFate() {
            if (this.actor.type !== "character") return;

            const groupData = GROUP.characteristicsFate;
            const actionType = 'fate';
            const actions = [];

            let fate = this.actor.system.fate;

            actions.push({
                id: 'fate',
                name: game.i18n.localize('tokenActionHud.impmal.fate'),
                encodedValue: [actionType, 'change'].join(this.delimiter),
                info1: {
                    class: '',
                    text: `${fate.value}/${fate.max}`,
                    title: game.i18n.localize('tokenActionHud.impmal.fate'),
                }
            });


            if (fate.max > 0) {
                actions.push({
                    id: 'fateBurn',
                    name: game.i18n.localize('tokenActionHud.impmal.fateBurn'),
                    encodedValue: [actionType, 'burn'].join(this.delimiter),
                    icon1: '<i class="fa-solid fa-fire"></i>'
                });
            }

            if (fate.value < fate.max) {
                actions.push({
                    id: 'fateReset',
                    name: game.i18n.localize('tokenActionHud.impmal.fateReset'),
                    encodedValue: [actionType, 'reset'].join(this.delimiter),
                    icon1: '<i class="fa-solid fa-arrows-rotate"></i>'
                });
            }

            this.addActions(actions, groupData);
        }

        /**
         * Build the wounds section under the character group.
         */
        async #buildCharacterWoundsAndCorruption() {
            if (this.actor.type !== "character" && this.actor.type !== "npc") return;

            const actions = [];

            let wounds = this.actor.system.combat.wounds;
            let corruption = this.actor.system?.corruption;

            actions.push({
                id: 'wounds',
                name: game.i18n.localize('tokenActionHud.impmal.wounds'),
                encodedValue: "wounds|change",
                icon1: '<i class="fa-solid fa-plus"></i>',
                info1: {
                    class: wounds.value >= wounds.max ? 'tah-spotlight' : '',
                    text: `${wounds.value}/${wounds.max}`,
                    title: game.i18n.localize('tokenActionHud.impmal.wounds'),
                }
            });

            if (corruption) {
                actions.push({
                    id: 'corruption',
                    name: game.i18n.localize('tokenActionHud.impmal.corruption'),
                    encodedValue: 'corruption|change',
                    icon1: '<i class="fa-solid fa-skull"></i>',
                    info1: {
                        class: corruption.value > corruption.max ? 'tah-spotlight' : '',
                        text: `${corruption.value}/${corruption.max}`,
                        title: game.i18n.localize('tokenActionHud.impmal.corruption'),
                    },
                });
            }


            await this.addActions(actions, GROUP.characteristicsWoundsCorruption);

            // Add the injuries, corruption and critical wounds.
            for (let [_, g] of Object.entries(WOUND_CORRUPTION_GROUPS)) {
                const items = (this.itemCategories[g.itemType] ?? []).filter(i => !g.category || i.system.category == g.category);

                const info1 = this.#getWoundCorruptionGroupInfo(g.itemType, g.category, items);
                const icon1 = this.#getWoundCorruptionGroupIcons(g.itemType, g.category);
                const groupData = { id: g.id, name: game.i18n.localize(g.name), type: g.type, icon1, info1, settings: { style: 'tab' } };
                this.addGroup(groupData, GROUP.characteristicsWoundsCorruption);

                await this.#buildWoundsAndCorruptionGroup(g.itemType, g?.category, items, groupData);
            }
        }

        async #buildWoundsAndCorruptionGroup(type, category, items, parentGroup) {
            const actions = [];
            if (items.length == 0) {
                actions.push({
                    id: 'empty',
                    cssClass: 'disabled',
                    name: game.i18n.localize('tokenActionHud.impmal.none'),
                    encodedValue: null,
                });
            }

            for (let item of items) {
                const actionTypeName = `${game.i18n.localize(ACTION_TYPE[type])}` ?? '';
                const a = this.#makeActionFromItem(item, actionTypeName, type, {}, [], true);
                actions.push(a);
            }

            this.addActions(actions, parentGroup);
        }

        #getWoundCorruptionGroupInfo(type, category, items) {
            let infoClass;
            let text;
            let title;

            const t = category ? `${type}_${category}` : type;
            let max;
            let value;

            switch (t) {
                case 'corruption_mutation':
                    value = items?.length ?? 0;
                    max = this.actor.system.characteristics.tgh.bonus;

                    text = `${value}/${max}`;
                    infoClass = value > max ? "tah-spotlight" : "";
                    title = game.i18n.localize("tokenActionHud.impmal.mutations");
                    break;
                case 'corruption_malignancy':
                    value = items?.length ?? 0;
                    max = this.actor.system.characteristics.wil.bonus;


                    text = `${items?.length ?? 0}/${max}`;
                    infoClass = value > max ? "tah-spotlight" : "";
                    title = game.i18n.localize("tokenActionHud.impmal.malignancies");
                    break;
                case 'critical':
                    const criticals = this.actor.system.combat.criticals;

                    text = criticals.max ? `${criticals.value}/${criticals.max}` : `${criticals.value}`;
                    infoClass = criticals.value > criticals.max ?? 0 ? "tah-spotlight" : "";
                    title = game.i18n.localize("tokenActionHud.impmal.criticalWounds");
                    break;
                case 'injury':
                    text = `${items?.length ?? 0}`;
                    title = game.i18n.localize("tokenActionHud.impmal.injuries");
                    break;
            }

            return {
                class: infoClass,
                text,
                title
            };
        }

        #getWoundCorruptionGroupIcons(type, category) {
            const mutationIcon = '<i class="fa-solid fa-dna"></i>';
            const malignancyIcon = '<i class="fa-solid fa-brain"></i>';
            const criticalIcon = '<i class="fa-solid fa-heart-pulse"></i>';
            const injuryIcon = '<i class="fa-solid fa-bone-break"></i>';

            const t = category ? `${type}_${category}` : type;

            switch (t) {
                case 'corruption_mutation':
                    return mutationIcon;
                case 'corruption_malignancy':
                    return malignancyIcon;
                case 'critical':
                    return criticalIcon;
                case 'injury':
                    return injuryIcon;
            }
        }

        /**
         * Build skills and specializations
         * @returns
         */
        async #buildSkills() {
            if (Object.keys(this.skills).length === 0) return;

            const actions = [];
            const specializationActions = [];

            for (let [skillName, skillModel] of Object.entries(this.skills)) {
                let name = skillName.charAt(0).toUpperCase() + skillName.slice(1); // Capitialize the name of the skill.
                let actionTypeName = game.i18n.localize(ACTION_TYPE.skill);
                let listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
                let encodedValue = ['skill', skillName].join(this.delimiter);
                let info1 = {
                    title: game.i18n.localize('tokenActionHud.impmal.tooltips.testTarget'),
                    text: skillModel.total
                };

                actions.push({
                    id: skillName,
                    name,
                    listName,
                    encodedValue,
                    info1
                });
            }

            for (let specialization of this.skillSpecializations) {
                let id = specialization.id;
                let name = specialization.system.skillName;
                let actionTypeName = game.i18n.localize(ACTION_TYPE.skill);
                let listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
                let encodedValue = ['specialization', id].join(this.delimiter);
                let info1 = {
                    title: game.i18n.localize('tokenActionHud.impmal.tooltips.testTarget'),
                    text: specialization.system.total
                };

                specializationActions.push({
                    id,
                    name,
                    listName,
                    encodedValue,
                    info1,
                });
            }

            this.addActions(actions, GROUP.skillsBasic);
            this.addActions(specializationActions, GROUP.skillsSpecialization);
        }

        /**
         * Build the talent/trait actions.
         * @returns
         */
        async #buildTalents() {
            if (this.talents.length === 0) return;

            const actionMap = new Map();
            const actionTypeId = this.actor.type == "character" ? "talent" : "trait";

            // Assume that this is either a list of talents or a list of traits.
            for (let [key, talent] of this.talents) {
                const type = talent.type;
                let typeMap = actionMap.get(type) ?? new Map();

                typeMap.set(talent.id, talent);
                actionMap.set(type, typeMap);
            }

            await this.#addActionsFromMap(actionTypeId, actionMap);
            await this.#buildBoonsAndLiabilities();
        }

        async #buildBoonsAndLiabilities() {
            if (this.boonsAndLiabilities.length === 0) return;

            const actionMap = new Map();
            const actionTypeId = "boonLiability";

            // Assume that this is either a list of talents or a list of traits.
            for (let boonLiability of this.boonsAndLiabilities) {
                const type = boonLiability.type;
                let typeMap = actionMap.get(type) ?? new Map();

                typeMap.set(boonLiability.id, boonLiability);
                actionMap.set(type, typeMap);
            }

            await this.#addActionsFromMap(actionTypeId, actionMap);
        }

        /**
         * Build the combat action menu.
         */
        async #buildCombat() {
            await this.#buildCombatDefendingAgainst();
            await this.#buildCombatActions();
            await this.#buildCombatProtectionActions();
            await this.#buildCombatForceFieldActions();
            await this.#buildCombatWeaponActions();
        }

        /**
         * Add the actions to represent the actors Defending Against status.
         */
        async #buildCombatDefendingAgainst()
        {
            const defendingAgainst = this.actor.defendingAgainst;
            if(!defendingAgainst) {
                return;
            }

            const testActor = defendingAgainst.actor;
            const actionType = 'combatDefendingAgainst';

            const cancelTestIcon = '<i class="fa-solid fa-xmark"></i>';

            const actions = [];

            {
                let title = defendingAgainst.context.title;

                const id = `defendingAgainst`;
                const name = `${title}`;
                const listName = `Defending Against: ${title}`;
                const encodedValue = [actionType, 'goto', defendingAgainst.context.messageId].join(this.delimiter);
                const img = testActor.token ? testActor.token.texture.src : testActor.prototypeToken.texture.src;
                const info1 = {
                    text: testActor.name
                };
                const info2 = {
                    text: `${defendingAgainst.result.SL} SL`
                };


                actions.push({
                    id,
                    name,
                    listName,
                    encodedValue,
                    img,
                    info1,
                    info2,
                });
            }

            actions.push({
                id: 'defendingAgainstCancel',
                name: '',
                encodedValue: [actionType, 'clear'].join(this.delimiter),
                icon1: cancelTestIcon,

            });

            this.addActions(actions, GROUP.combatDefendingAgainst);
        }

        /**
         * Add the group for the basic combat actions.
         */
        async #buildCombatActions() {
            const actions = [];
            const actionType = 'action';
            const actionTypeName = game.i18n.localize(ACTION_TYPE.action);

            const currentAction = this.actor.system.combat.action;
            if (currentAction) {
                // Display a single action button to indicate the selected action.
                let id = currentAction;
                let name = `Current Action: ${IMPMAL.actions[currentAction].label}`;
                const listName = `${name}`;
                const encodedValue = [actionType, 'clear'].join(this.delimiter);
                const img = coreModule.api.Utils.getImage(IMPMAL.actions[currentAction]);
                const icon3 = '<i class="fa-solid fa-xmark"></i>';

                actions.push({
                    id,
                    name,
                    listName,
                    encodedValue,
                    img,
                    icon3
                });

                this.addActions(actions, GROUP.combatActions);
                return;
            }

            // No action selected. Display all available actions.
            for (let [actionKey, actionModel] of Object.entries(IMPMAL.actions)) {
                let id = actionKey;
                let name = actionModel.label;
                const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
                const encodedValue = [actionType, id].join(this.delimiter);
                const img = coreModule.api.Utils.getImage(actionModel);

                actions.push({
                    id,
                    name,
                    listName,
                    encodedValue,
                    img
                });
            }

            // Add TWF if the actor is holding two different weapons.
            let hands = this.actor.system?.hands;
            let canUseTWF = hands && (hands.left.document && hands.right.document && hands.left.id != hands.right.id);
            if (canUseTWF) {
                const id = `${actionType}_twf`;
                const name = game.i18n.localize('tokenActionHud.impmal.twoWeaponFighting');
                const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
                const encodedValue = [actionType, 'twf'].join(this.delimiter);

                actions.push({
                    id,
                    name,
                    listName,
                    encodedValue,
                });
            }

            this.addActions(actions, GROUP.combatActions);
        }

        async #buildCombatWeaponActions() {
            let actions = [];
            const actionType = 'combatWeapon';
            const actionTypeName = game.i18n.localize(ACTION_TYPE.weapon);
            let groupData = GROUP.combatWeapons;

            for (let [key, item] of this.items) {
                if (item.type !== 'weapon') continue;
                if ((!this.displayUnequipped && !item.system.isEquipped && item.name !== "Unarmed")) continue;


                let icons = this.#getItemIcons(item);
                let action = this.#makeActionFromItem(item, actionTypeName, actionType, icons, [], true);
                actions.push(action);
            }

            await this.addActions(actions, groupData);
        }

        async #buildCombatProtectionActions() {
            const actionType = 'combatProtection';
            const actionTypeName = 'Protection';
            const shieldIcon = '<i class="fas fa-shield"></i>';
            const armourIcon = '<i class="fas fa-shirt"></i>';

            const hitLocations = this.actor.system.combat.hitLocations;
            const actions = [];
            const groupData = GROUP.combatProtection;

            for (let [key, hitLocation] of Object.entries(hitLocations)) {
                let icon1 = hitLocation.items.length > 0 ? armourIcon : null;
                let label = game.i18n.localize(hitLocation.label);
                let info1 = {
                    text: hitLocation.armour,
                    title: game.i18n.localize('tokenActionHud.impmal.tooltips.armour'),
                };

                actions.push({
                    id: `combatProtection_${key}`,
                    name: this.#getActionName(label),
                    icon1,
                    cssClass: 'disabled',
                    listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${label}`,
                    encodedValue: [actionType, key].join(this.delimiter),
                    info1,
                });
            }

            let shields = this.actor.items.filter((item) => item.system.category == "shield" && item.system.isEquipped)
            if (shields.length > 0) {
                let item = shields[0];
                let shieldTrait = item.system.traits.list.find((trait) => trait.key == "shield")
                let icon1 = shieldIcon;
                actions.push({
                    id: `combatProtection_${item.id}`,
                    name: "Shield",
                    icon1,
                    cssClass: 'disabled',
                    listName: `${actionTypeName ? `${actionTypeName}: ` : ''}Shield`,
                    encodedValue: [actionType, item.id].join(this.delimiter),
                    info1: {
                        text: shieldTrait?.value,
                        title: game.i18n.localize('tokenActionHud.impmal.tooltips.shieldRating'),
                    }
                });
            }

            return this.addActions(actions, groupData);
        }

        async #buildCombatForceFieldActions() {
            const actionType = 'combatForceField';
            const actionTypeName = 'Force Field';

            const actions = [];

            // Get first active force field.
            let forceFields = this.actor.itemCategories.forceField;
            let activeForceField = forceFields.find(item => item.system.isEquipped);
            for (let forceField of forceFields) {
                let isActive = !forceField.system.overload.collapsed && forceField.id == activeForceField?.id;
                let { icon1 } = this.#getItemIcons(forceField);
                let cssClass = [
                    'toggle',
                    isActive ? 'active' : '',
                    forceField.system.overload.collapsed ? 'tah-impmal-forceField-collapsed' : ''
                ].join(' ');

                actions.push({
                    id: `combatForceField_${forceField.id}`,
                    name: forceField.name,
                    icon1,
                    cssClass,
                    listName: `${actionTypeName ? `${actionTypeName}: ` : ''}Shield`,
                    encodedValue: [actionType, forceField.id].join(this.delimiter),
                    info1: {
                        text: forceField.system.protection,
                        title: game.i18n.localize('tokenActionHud.impmal.tooltips.forceFieldProtection'),
                    }
                });
            }

            return this.addActions(actions, GROUP.combatForceFields);
        }

        /**
         * Build conditions
         */
        async #buildConditions() {
            if (this.tokens?.length === 0) return

            const actionType = 'condition'

            const conditionPipEmptyIcon = '<i class="fa-regular fa-square fa-2xs"></i>';
            const conditionPipFilledIcon = '<i class="fa-solid fa-square fa-2xs"></i>';

            // Get the conditions and exit if they do not exist.
            const conditions = CONFIG.statusEffects.filter((condition) => condition.id !== '')
            if (conditions.length === 0) return

            const actions = await Promise.all(conditions.map(async (condition) => {
                const id = condition.id
                const name = condition.name; // TODO: Localization.
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)

                const hasCondition = this.actor.hasCondition(condition.id)
                const tiered = game.impmal.config.tieredCondition[condition.id]

                const active = hasCondition ? ' active' : ' ';
                const cssClass = `toggle${active} tah-action-button-condition`;
                const img = coreModule.api.Utils.getImage(condition);
                const tooltip = hasCondition?.name ?? '';

                // Render the condition pips.
                let pip_count = (hasCondition?.isMajor)
                    ? 2
                    : (hasCondition ? 1 : 0);

                let icon1;
                let icon2;

                icon1 = pip_count > 0 ? conditionPipFilledIcon : conditionPipEmptyIcon;
                if (tiered) {
                    icon2 = pip_count > 1 ? conditionPipFilledIcon : conditionPipEmptyIcon;
                }

                return {
                    id,
                    name,
                    encodedValue,
                    img,
                    cssClass,
                    listName,
                    tooltip,
                    icon1,
                    icon2,
                };
            }))

            // Create group data and add actions to HUD.
            this.addActions(actions, GROUP.conditions);
        }

        async #buildPowers() {
            if (this.powers.length == 0) return;

            const chargeAddIcon = '<i class="fa-solid fa-plus"></i>';
            const chargeRemoveIcon = '<i class="fa-solid fa-minus"></i>';
            const purgeIcon = '<i class="fa-solid fa-burst"></i>';
            const exceededWarpChargesIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';

            const actionTypeId = 'power';
            const actionTypeName = game.i18n.localize(ACTION_TYPE.power);

            const powerMap = new Map();

            {
                const actions = [];

                actions.push({
                    id: 'powersAdd',
                    name: '',
                    encodedValue: [actionTypeId, 'add'].join(this.delimiter),
                    icon1: chargeAddIcon
                });

                actions.push({
                    id: 'powersRemove',
                    name: '',
                    encodedValue: [actionTypeId, 'remove'].join(this.delimiter),
                    icon1: chargeRemoveIcon,
                });

                // Add an action to purge warp charge.
                if (this.actor.system.warp.charge > 0) {
                    actions.push({
                        id: 'powersPurge',
                        name: game.i18n.localize("tokenActionHud.impmal.purge"), // TODO: Localize
                        cssClass: this.actor.system.warp.charge === 0 ? 'disabled' : '',
                        listName: `${actionTypeName ? `${actionTypeName}: ` : ''}Purge`,
                        encodedValue: [actionTypeId, 'purge'].join(this.delimiter),
                        icon1: purgeIcon,
                    });
                }

                if (this.actor.system.warp.state == 1) {
                    // Actor needs to roll a physic mastery test.
                    actions.push({
                        id: 'powersMasteryTest',
                        name: game.i18n.localize("tokenActionHud.impmal.psychicMasteryTest"), // TODO: Localize
                        listName: `${actionTypeName ? `${actionTypeName}: ` : ''}Psychic Mastery Test`,
                        encodedValue: [actionTypeId, 'psychicMastery'].join(this.delimiter),
                        icon1: exceededWarpChargesIcon,
                    });
                }

                if (this.actor.system.warp.state == 2) {
                    actions.push({
                        id: 'powersPerils',
                        name: game.i18n.localize("tokenActionHud.impmal.perilsOfTheWarp"),
                        cssClass: this.actor.system.warp.state == 2 ? 'tah-impmal-powers-perils' : '',
                        listName: `${actionTypeName ? `${actionTypeName}: ` : ''}Perils of the Warp`,
                        encodedValue: [actionTypeId, 'perils'].join(this.delimiter),
                        icon1: exceededWarpChargesIcon,
                    });
                }

                this.addActions(actions, GROUP.powersActions);
            }

            // Add powers to their group representing the powers discipline.
            for (let power of this.powers) {
                let type;

                switch (power.system.discipline) {
                    case 'minor':
                        type = 'powerMinor';
                        break;
                    case 'biomancy':
                        type = 'powerBiomancy';
                        break;
                    case 'divination':
                        type = 'powerDivination';
                        break;
                    case 'pyromancy':
                        type = 'powerPyromancy';
                        break;
                    case 'telekinesis':
                        type = 'powerTelekinesis';
                        break;
                    case 'telepathy':
                        type = 'powerTelepathy';
                        break;
                    default:
                        continue;
                }

                const disciplineMap = powerMap.get(type) ?? new Map();

                disciplineMap.set(power.id, power);
                powerMap.set(type, disciplineMap);
            }

            return this.#addActionsFromMap(actionTypeId, powerMap);
        }

        /**
         * Build inventory
         */
        async #buildInventory() {
            if (this.items.size === 0) return

            const actionTypeId = 'item'
            const inventoryMap = new Map()

            for (const [itemKey, itemData] of this.items) {
                const itemId = itemData.id;
                const type = itemData.type;
                const equipped = itemData.system.isEquipped;

                switch (itemData.type) {
                    case 'ammo':
                    case 'boonLiability':
                    case 'augmetic':
                    case 'equipment':
                    case 'forceField':
                    case 'modification':
                    case 'protection':
                    case 'weapon':
                        break;
                    case 'corruption':
                    case 'critical':
                    case 'duty':
                    case 'faction':
                    case 'injury':
                    case 'origin':
                    case 'power':
                    case 'role':
                    case 'specialisation':
                    case 'talent':
                    case 'trait':
                    default:
                        continue;
                }

                const typeMap = inventoryMap.get(type) ?? new Map();
                typeMap.set(itemId, itemData);
                inventoryMap.set(type, typeMap);
            }

            return this.#addActionsFromMap(actionTypeId, inventoryMap);
        }

        /**
         * Build Utility
         */
        async #buildUtility() {
            const combat = await this.#buildUtilityCombat();
            const rest = await this.#buildUtilityRest();

            const actionTypeId = 'utility';
            let actionData = mergeObject(combat, rest);

            for (let group in actionData) {
                const types = actionData[group];
                const actions = Object.entries(types).map((type) => {
                    const id = type[1].id;
                    const name = type[1].name;
                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])}: ` ?? '';
                    const listName = `${actionTypeName}${name}`;
                    const encodedValue = [actionTypeId, id].join(this.delimiter);
                    const info1 = {};
                    let cssClass = '';


                    if (type[0] === 'initiative' && game.combat) {
                        const tokenIds = canvas.tokens.controlled.map((token) => token.id);
                        const combatants = game.combat.combatants.filter((combatant) => tokenIds.includes(combatant.tokenId));

                        // Get initiative for single token
                        if (combatants.length === 1) {
                            const currentInitiative = combatants[0].initiative;
                            info1.class = 'tah-spotlight';
                            info1.text = currentInitiative;
                        }

                        const active = combatants.length > 0 && (combatants.every((combatant) => combatant?.initiative)) ? ' active' : '';
                        cssClass = `toggle${active}`;
                    }

                    return {
                        id,
                        name,
                        encodedValue,
                        info1,
                        cssClass,
                        listName
                    };
                });

                const groupData = { id: group, type: 'system' };
                this.addActions(actions, groupData);
            }
        }

        async #buildUtilityCombat() {
            const combatTypes = {
                initiative: { id: 'initiative', name: game.i18n.localize('tokenActionHud.impmal.actions.rollInitiative') },
                endTurn: { id: 'endTurn', name: game.i18n.localize('tokenActionHud.endTurn') }
            }

            if (!game.combat || game.combat?.current?.tokenId !== this.token?.id) delete combatTypes.endTurn

            return { 'combat': combatTypes };
        }

        async #buildUtilityRest() {
            if (this.actor?.type != "character") return {}

            const restTypes = {
                rest: { id: 'rest', name: game.i18n.localize('tokenActionHud.impmal.actions.rest') },
            }

            return { 'utilityRest': restTypes };
        }

        /**
         * Make an action button for a single Item instance
         * @param {*} item
         * @param {*} actionTypeName
         * @param {*} actionType
         * @param {*} param3
         * @param {*} values
         * @param {*} image
         * @returns
         */
        #makeActionFromItem(item, actionTypeName, actionType, {
            icon1 = null,
            icon2 = null,
            icon3 = null
        } = {}, values = [], image = true) {
            values = [actionType, item._id, ...values];

            return {
                id: item._id,
                name: this.#getActionName(item.name),
                img: image ? coreModule.api.Utils.getImage(item) : null,
                icon1,
                icon2,
                icon3,
                listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${item.name}`,
                encodedValue: values.join(this.delimiter),
                info1: {
                    class: '',
                    text: this.#getTestTarget(item),
                    title: game.i18n.localize('tokenActionHud.impmal.tooltips.testTarget')
                },
                info2: {
                    class: '',
                    text: this.#getItemValue(item, actionType),
                    title: this.#getItemValueTooltip(item, actionType)
                },
                info3: {
                    class: '',
                    text: this.#getItemSecondaryValue(item),
                    title: this.#getItemSecondaryValueTooltip(item)
                },
                tooltip: item.name
            };
        }

        /**
         * @param {string} actionTypeId
         * @param {Map<string,Map>} inventoryMap
         * @param {string|null} parentGroup
         */
        async #addActionsFromMap(actionTypeId, inventoryMap, parentGroup = null) {
            for (const [type, typeMap] of inventoryMap) {
                const groupId = parentGroup ?? ITEM_TYPE[type]?.groupId ?? this.#findGroup({ id: type })?.id;
                if (!groupId) continue;

                const groupData = { id: groupId, type: 'system' };

                const actions = [...typeMap].map(([itemId, itemData]) => {
                    const id = itemId;
                    const name = this.#getActionName(itemData.name);
                    const actionTypeName = game.i18n.localize(ACTION_TYPE[actionTypeId]);
                    const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${itemData.name}`;
                    const encodedValue = [actionTypeId, id].join(this.delimiter);
                    const img = coreModule.api.Utils.getImage(itemData);
                    const tooltip = itemData.name;
                    const { icon1, icon2, icon3 } = this.#getItemIcons(itemData);

                    const info1 = {
                        class: '',
                        text: this.#getTestTarget(itemData),
                        title: game.i18n.localize('tokenActionHud.impmal.tooltips.testTarget')
                    };
                    const info2 = {
                        class: '', text: this.#getItemValue(itemData),
                        title: this.#getItemValueTooltip(itemData)
                    };
                    const info3 = {
                        class: '',
                        text: this.#getItemSecondaryValue(itemData),
                        title: this.#getItemSecondaryValueTooltip(itemData)
                    };

                    return {
                        id,
                        name,
                        img,
                        listName,
                        encodedValue,
                        icon1,
                        icon2,
                        icon3,
                        info1,
                        info2,
                        info3,
                        tooltip
                    }
                })

                this.addActions(actions, groupData);
            }
        }

        /**
         *
         * @param {*} name
         * @returns
         */
        #getActionName(name) {
            if (this.#maxCharacters > 0) {
                return name.substring(0, this.#maxCharacters) + '…';
            }

            return name;
        }

        /**
         *
         * @param {*} itemData
         * @returns
         */
        #getTestTarget(itemData) {
            if (itemData.type === 'weapon')
                return itemData.system.skillTotal;

            return null;
        }

        #getItemValue(item, actionType = null) {
            const type = actionType ? `${item.type}_${actionType}` : item.type;

            switch (type) {
                case 'ammo':
                    return item.system.quantity;
                case 'weapon':
                case 'weapon_weapon':
                    return `+${item.system.damage.value}`;
                case 'weapon_combatWeapon':
                    if (item.system.selfAmmo)
                        return `${item.system.quantity}`;
                    else if (item.system?.attackType == "ranged")
                        return `${item.system.mag.current ?? 0}/${item.system.mag.value}`;
                    else
                        return `+${item.system.damage.value}`;
                case 'forceField':
                    return item.system.protection;
                case 'protection':
                    if (item.system.category == "shield") {
                        return item.system.traits.list.find(t => t.key == "shield")?.value;
                    }
                    return item.system.armour;

                case 'power':
                    return item.system.rating;
                default:
                    return null;
            }
        }

        #getItemValueTooltip(item, actionType = null) {
            const type = actionType ? `${item.type}_${actionType}` : item.type;

            switch (type) {
                case 'ammo':
                    return game.i18n.localize('tokenActionHud.impmal.tooltips.quantity');
                case 'weapon':
                case 'weapon_weapon':
                    return game.i18n.localize('tokenActionHud.impmal.tooltips.weaponDamage');
                case 'weapon_combatWeapon':
                    if (item.system.selfAmmo)
                        return game.i18n.localize('tokenActionHud.impmal.tooltips.quantity');
                    else if (item.system?.attackType == "ranged")
                        return game.i18n.localize('tokenActionHud.impmal.tooltips.loadedAmmo');
                    else
                        return game.i18n.localize('tokenActionHud.impmal.tooltips.weaponDamage');
                case 'forceField':
                    return game.i18n.localize('tokenActionHud.impmal.tooltips.forceFieldProtection');
                case 'protection':
                    if (item.system.category == "shield") {
                        return game.i18n.localize('tokenActionHud.impmal.tooltips.shieldRating');
                    }
                    return game.i18n.localize('tokenActionHud.impmal.tooltips.armour');
                case 'power':
                    return game.i18n.localize("tokenActionHud.impmal.tooltips.warpRating");
                default:
                    return null;
            }
        }

        #getItemSecondaryValue(item) {
            return null;
        }

        #getItemSecondaryValueTooltip(item) {
            return null;
        }

        #getItemIcons(item) {
            let icon1 = null;
            let icon2 = null;
            let icon3 = null;

            const equipped = item.system.isEquipped;

            if (item.type == "weapon") {
                const leftHand = item.system.equipped?.hands?.left;
                const rightHand = item.system.equipped?.hands?.right;
                const offhand = item.system.equipped?.offhand;

                if (equipped && rightHand) {
                    let iconClasses = `fa-solid fa-hand tah-hand-right ${offhand ? "tah-hand-offhand" : ""
                        } ${leftHand && rightHand ? 'fa-xs' : 'fa-sm'}`;

                    icon1 = `<i class="${iconClasses}"></i>`
                }

                if (equipped && leftHand) {
                    let iconClasses = `fa-solid fa-hand tah-hand-left ${offhand ? "tah-hand-offhand" : ""
                        } ${leftHand && rightHand ? 'fa-xs' : ''}`;

                    icon2 = `<i class="${iconClasses}"></i>`
                }

            } else if (item.type == "boonLiability") {
                const unusedIcon = '<i class="fa-regular fa-circle"></i>';
                const usedIcon = '<i class="fa-regular fa-circle-check"></i>';

                if (item.system.oneUse)
                    icon1 = item.system.used ? usedIcon : unusedIcon;
            } else if (item.type == "protection" && equipped) {
                icon1 = item.system.category == "shield" ? CARRY_TYPE_ICON.wornShield : CARRY_TYPE_ICON.worn;
            } else if (["augmetic", "equipment"].includes(item.type)) {
                icon1 = equipped ? CARRY_TYPE_ICON.equipmentEquipped : CARRY_TYPE_ICON.equipmentUnequipped;
            } else if (item.type == "forceField") {
                const collapsed = item.system.overload.collapsed;
                icon1 = collapsed ? FORCEFIELD_ICONS.collapsed : (equipped ? FORCEFIELD_ICONS.active : FORCEFIELD_ICONS.inactive);
            }

            return { icon1, icon2, icon3 };
        }

        /**
         * Get actors
         * @returns {object}
         */
        #getActors() {
            const allowedTypes = ['character', 'npc']
            const tokens = coreModule.api.Utils.getControlledTokens()
            const actors = tokens?.filter(token => token.actor).map((token) => token.actor)
            if (actors.every((actor) => allowedTypes.includes(actor.type))) {
                return actors
            } else {
                return []
            }
        }

        /**
         * Get the talents (or traits for NPCs) an actor posseses, removing any duplicates.
         * @return {Array.<Item>}
         */
        #getActorTalents() {
            let type = this.actor.type == "character" ? "talent" : "trait";
            let talents = this.actor.items.filter(i => i.type === type);

            let consolidated = [];
            for (let talent of talents) {
                let existing = consolidated.find(t => t.name === talent.name)
                if (!existing)
                    consolidated.push(talent)
            }

            return consolidated;
        }

        /**
         * Get the visible boons/liabilities the actors patron possesses. If the actor does
         * have a patron then an empty list is returned.
         *
         * @returns {Array<Item>}
         */
        #getActorBoonsAndLiabilities() {
            if (this.actor.type != "character") return [];

            let patron = this.actor.system.patron.document;
            if (!patron) return [];

            let boonsLiabilities = [];
            for (let item of patron.itemCategories.boonLiability) {
                if (!item.system.visible) continue;
                boonsLiabilities.push(item);
            }

            return boonsLiabilities;
        }
    }
})
