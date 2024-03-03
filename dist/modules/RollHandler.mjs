import { Utils } from './utils.mjs'

export let RollHandlerImpMal = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandlerImpMal = class RollHandlerImpMal extends coreModule.api.RollHandler {
        /**
         * Handle action click
         * Called by Token Action HUD Core when an action is left or right-clicked
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick (event, encodedValue) {
            if(encodedValue === null) return;

            const payload = encodedValue.split('|');
            if (payload.length < 2) {
                super.throwInvalidValueErr();
            }

            const actionTypeId = payload[0];
            const actionId = payload[1];
            const subActionTypeId = payload[2] ?? null;
            const subActionId = payload[3] ?? null;

            const renderable = ['item']

            if (renderable.includes(actionTypeId) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }

            const knownCharacters = ['character', 'npc']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId, subActionTypeId, subActionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, token, actionTypeId, actionId, subActionTypeId, subActionId)
            }
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover (event, encodedValue) {}

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick (event, group) {}

        /**
         * Handle action
         * @param {object} event           The event
         * @param {object} actor           The actor
         * @param {object} token           The token
         * @param {string} actionTypeId    The action type id
         * @param {string} actionId        The actionId
         * @param {string} subActionTypeId The sub action type id
         * @param {string} subActionId     The sub actionId
         */
        async #handleAction (event, actor, token, actionTypeId, actionId, subActionTypeId, subActionId) {
            switch (actionTypeId) {
            case 'action':
                this.#handleCombatAction(actor, actionId);
                break;
            case 'combatWeapon':
            case 'combatForceField':
                this.#handleCombatItemAction(actor, actionId, subActionTypeId, subActionId);
                break;
            case 'combatDefendingAgainst':
                this.#handleCombatDefendingAgainst(actor, actionId, subActionTypeId);
                break;
            case 'characteristic':
                this.#handleCharacteristicAction(actor, actionId);
                break;
            case 'fate':
                this.#handleFateActionItem(event, actor, actionId);
                break;
            case 'wounds':
                this.#handleWoundActionItem(event, actor, actionId);
                break;
            case 'corruption':
                this.#handleCorruptionActionItem(event, actor, actionId);
                break;
            case 'skill':
            case 'specialization':
                this.#handleSkillAction(actor, actionTypeId, actionId);
                break
            case 'power':
                this.#handlePowerAction(actor, actionId);
                break;

            case 'boonLiability':
            case 'item':
            case 'trait':
            case 'talent':
            case 'corruption':
            case 'critical':
            case 'injury':
                this.#handleItemAction(event, actor, actionTypeId, actionId)
                break

            case 'condition':
                if(!token) return
                this.#handleConditionAction(event, actor, actionId);
                break;

            case 'utility':
                this.#handleUtilityAction(token, actor, actionId)
                break

            case 'noop':
                break;
            }
        }

        async #handleFateActionItem(event, actor, actionId) {
            if (actionId == "change") {
                const delta = this.isRightClick(event) ? -1 : +1;
                const max = Math.max(0, actor.system.fate.max);
                let value = Math.max(0, actor.system.fate.value + delta);
                if(value > max) value = max;

                actor.update({"system.fate.value": value});
            } else if(actionId == "burn") {
                const value = Math.max(0, actor.system.fate.value - 1);
                const max = Math.max(0, actor.system.fate.max - 1);

                actor.update({"system.fate.value": value, "system.fate.max": max});
            } else if(actionId == "reset") {
                const max = Math.max(0, actor.system.fate.max);
                actor.update({"system.fate.value": max});
            }
        }

        /**
         * Handle changing the actors wounds value.
         */
        async #handleWoundActionItem(event, actor, actionId) {
            let delta = this.isRightClick(event) ? -1 : +1;
            if(this.isCtrl(event)) delta = delta * 5;

            let value = Math.max(0, actor.system.combat.wounds.value + delta);
            actor.update({"system.combat.wounds.value": value});
        }

        /**
         * Handle changing the actors corruption value.
         */
        async #handleCorruptionActionItem(event ,actor, actionId) {
            let delta = this.isRightClick(event) ? -1 : +1;
            if(this.isCtrl(event)) delta = delta * 5;

            let value = Math.max(0, actor.system.corruption.value + delta);
            actor.update({"system.corruption.value": value});
        }



        /**
         * Handle the basic combat actions
         */
        async #handleCombatAction(actor, actionId) {
            if(actionId === 'clear') {
                await actor.clearAction();
            } else if(actionId == 'twf') {
                await actor.useTWF();
            } else {
                await actor.useAction(actionId);
            }
        }

        /**
         * Handle actions for the defending against group.
         */
        async #handleCombatDefendingAgainst(actor, actionId, subActionTypeId) {
            if(actionId === 'clear') {
                await actor.clearOpposed();
            } else if (actionId === 'goto') {
                Utils.scrollToMessage(subActionTypeId);
            }
        }

        /**
         * Handle weapon attack actions.
         */
        async #handleCombatItemAction(actor, actionId, subActionTypeId, subActionId) {
            const item = actor.items.get(actionId);

            switch(item.type) {
                case 'weapon':
                    actor.setupWeaponTest(item.id, {});
                    break;
                case 'forceField':
                    // Force fields are activated via being equipped.
                    item.update({["system.equipped.value"] : !item.system.equipped.value});
                    break;
                default:
            }
        }

        /**
         * Handle item reloading.
         *
         * @param {*} actor
         * @param {*} item
         * @returns
         */
        async #handleCombatItemReloadAction(actor, item) {
            try {
                let trackAmmo = true;
                if(actor.type == "npc" && !item.system.ammo.document)
                    trackAmmo = false; // NPC does not ammo setup.
                item.update(item.system.reload(trackAmmo));
            }
            catch(e) {
                ui.notifications.error(e);
            }

            return;
        }

        /**
         * Handle characteristic action
         * @param {*} actor
         * @param {*} actionId
         * @returns
         */
        #handleCharacteristicAction(actor, actionId) {
            if (actionId == "fate") return;
            if (actionId == "fateBurn") return;

            return actor.setupCharacteristicTest(actionId);
        }

        /**
         * Handle skill actions.
         * @param {*} actor
         * @param {*} actionTypeId
         * @param {*} actionId
         */
        #handleSkillAction(actor, actionTypeId, actionId) {
            let itemId = undefined;
            let key = undefined;

            switch(actionTypeId) {
                case "skill":
                    key = actionId;
                    break;
                case "specialization":
                    itemId = actionId;
                    break;
            }

            this.actor.setupSkillTest({itemId, key})
        }

        /**
         * Handle power actions.
         */
        #handlePowerAction(actor, actionId) {
            if (actionId == "add" || actionId == "remove") {
                const delta = (actionId == "add") ? 1 : -1;
                this.actor.update({"system.warp.charge": this.actor.system.warp.charge + delta});
            } else if(actionId == "purge") {
                return this.actor.setupSkillTest({key: "discipline", name: game.i18n.localize("IMPMAL.Psychic")}, {context : {purge: true},  title : {append : ` - ${game.i18n.localize("IMPMAL.Purge")}`}});
            } else if (actionId == "psychicMastery" || actionId == "perils") {
                const warp = actionId == "psychicMastery" ? 1 : 2;
                this.actor.setupSkillTest({key : "psychic"}, {context : {warp}});
            }

            const power = actor.items.get(actionId);
            if(!power) return;

            this.actor.setupPowerTest(power.id);
        }

        /**
         * Handle item action
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionTypeId The action type
         * @param {string} actionId The action id
         */
        #handleItemAction (event, actor, actionTypeId, actionId) {
            const item = (
                actionTypeId == "boonLiability"
                    ? actor.system.patron?.document?.items?.get(actionId)
                    : actor.items.get(actionId)
                );

            if(!item) return;

            switch (item.type) {
                case 'trait':
                default:
                    item.postItem();
            }
        }

        /**
         * Handle utility action
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #handleUtilityAction (token, actor, actionId) {
            switch (actionId) {
                case 'endTurn':
                    if (game.combat?.current?.tokenId === token.id) {
                        await game.combat?.nextTurn()
                    }
                    break
                case 'initiative':
                    return this.#rollInitiative(actor);
                case 'rest':
                    return this.#restRecover(actor);
            }
        }

        async #rollInitiative(actor) {
            if (!actor) return;
            await actor.rollInitiative({createCombatants: true});

            return Hooks.callAll('forceUpdateTokenActionHud');
          }

        /**
         * Renders a dialog to prompt the user if they want to perform a short rest or long rest.
         * @param {Actor} actor The actor to remove wounds from.
         */
        async #restRecover(actor) {

            const tghBonus = actor.system.characteristics.tgh.bonus;

            const restDialog = new Dialog({
                title: "Rest",
                content: `<p>${game.i18n.localize('tokenActionHud.impmal.dialogs.rest.content')}</p>`,
                buttons: {
                    short: {
                        label: `${game.i18n.localize('tokenActionHud.impmal.dialogs.rest.shortRest')} (-${tghBonus} ${game.i18n.localize('tokenActionHud.impmal.wounds')})`,
                        callback: () => {
                            const woundsRemoved = tghBonus;
                            let updateData = {"system.combat.wounds.value" : actor.system.combat.wounds.value - woundsRemoved};
                            actor.update(updateData);
                        }
                    },
                    long: {
                        label: `${game.i18n.localize('tokenActionHud.impmal.dialogs.rest.longRest')} (-${tghBonus * 2} ${game.i18n.localize('tokenActionHud.impmal.wounds')})`,
                        callback: () => {
                            const woundsRemoved = tghBonus * 2;
                            let updateData = {"system.combat.wounds.value" : actor.system.combat.wounds.value - woundsRemoved};
                            actor.update(updateData);
                        }
                    }
                }
            });

            restDialog.render(true);
        }

        /**
         * Handle condition action
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleConditionAction (event, actor, actionId)
        {
            const isRightClick = this.isRightClick(event)
            const condition = CONFIG.statusEffects.find(statusEffect => statusEffect.id === actionId)

            if(!condition) return

            // Increment the condition when left clicking the action. Decrement when right clicking.
            if(isRightClick) {
                await actor.removeCondition(condition.id);
            } else {
                await actor.addCondition(condition.id);
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }
    }
})
