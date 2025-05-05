import { Damage, Resistance } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove, SpecialMoveTriggerType } from "./SpecialMove";
import { getResultsForStatusEffectHook, getStatusEffect, StatusEffect, StatusEffectApplication, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";
import { ActionResult, AttackResult } from "./attackResult";
import { CombatantType } from "./Combatants/CombatantType";
import { emitter } from "@/eventBus";
import { AIAgent, AIAgentType } from "./AI/AIAgent";
import { EventLogger } from "@/eventLogger";

export interface CombatantStats {
    hp: number;
    attackPower: number;
    defensePower: number;
    stamina: number;
    initiative: number;
    movementSpeed: number;
    range: number;
    agility: number;
    luck: number;
  }

  export abstract class Combatant {
    constructor(
      public name: string,
      public baseStats: CombatantStats,
      public position: Position,
      public resistances: Resistance[],
      public specialMoves: SpecialMove[],
      public team: Team
    ) {
        this.stats = { ...this.baseStats }; 
        this.team = team;
        this.specialMoves.filter((move) => move.triggerType === SpecialMoveTriggerType.Passive).forEach((move) => {
          move.effect && move.effect(this, this.position,  {} as Board);
        });
      }

    public stats: CombatantStats; // Current stats, can be modified by effects
    public statusEffects: StatusEffectApplication[] = [];
    public aiAgent: AIAgent[] | undefined;
    hasMoved: boolean = false;

    startTurn(): ActionResult[] {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent(`${this.name} the ${this.getCombatantType()} acts`);
        this.hasMoved = false;
        if(this.isDefending()) {
            this.removeStatusEffect(StatusEffectType.DEFENDING);
        }
        const turnStartHookResults: ActionResult[] = getResultsForStatusEffectHook(this, StatusEffectHook.OnTurnStart);
        turnStartHookResults.filter((result) => result.attackResult !== AttackResult.NotFound).forEach((result) => {
            emitter.emit('trigger-method', result);
        });
        return turnStartHookResults;
    }

    endTurn(board: Board): ActionResult[] {
        const endTurnHookResults: ActionResult[] = getResultsForStatusEffectHook(this, StatusEffectHook.OnTurnEnd, undefined, undefined, undefined, board);
        endTurnHookResults.forEach((result) => {
            emitter.emit('trigger-method', result);
        });
        return endTurnHookResults;
    }

    abstract basicAttack(): Damage

    abstract getCombatantType(): CombatantType;

    getSpecialMoves(): SpecialMove[] {
      return this.specialMoves;
    }
  
    move(newPosition: Position, board: Board) {
        const onMovingHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnMoving);

        board.removeCombatant(this);
        board.placeCombatant(this, newPosition);
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent(`${this.name} moves to (${newPosition.x},${newPosition.y})`);
        this.hasMoved = true;
        // emitter.emit('play-move-sound');
    }
  
    defend(): number {
      const onDefendingHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnDefending);
      const defenseStatus: StatusEffectApplication = {
          name: StatusEffectType.DEFENDING,
          duration: Number.POSITIVE_INFINITY,
        };
        this.applyStatusEffect(defenseStatus);
        return 1;
      }

    isDefending(): boolean {
        return this.statusEffects.some((effect) => effect.name === StatusEffectType.DEFENDING);
    }

    isKnockedOut(): boolean {
      return this.stats.hp <= 0;
    }
  
    takeDamage(damageAmount: number): void {
      this.stats.hp -= damageAmount;
  
      if (this.stats.hp < 0) this.stats.hp = 0;
    }
    
    applyStatusEffect(effect: StatusEffectApplication, statusSource?: Combatant): void {
        if(this.hasStatusEffect(effect.name)) {
           this.updateStatusEffect(effect);
           return;
        }
        this.statusEffects.push(effect);
        const statusEffect = getStatusEffect(effect.name);
        if(statusEffect) {
          const applyHook = statusEffect.applicationHooks[StatusEffectHook.OnApply];
          applyHook && applyHook(this, statusSource || this, {amount: 0, type: DamageType.Unstoppable});
        }
    }

    removeStatusEffect(effectName: StatusEffectType): void {
      const effectToRemove = this.statusEffects.find((effect) => effect.name === effectName);
      if(effectToRemove) {
        const statusEffect = getStatusEffect(effectToRemove.name);
        const removeStatusHook = statusEffect?.applicationHooks[StatusEffectHook.OnRemove];
        removeStatusHook && removeStatusHook(this, this, {amount: 0, type: DamageType.Unstoppable});
        this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);
      }
    }

    updateStatusEffect(effect: StatusEffectApplication): void {
      const effectToUpdate = this.statusEffects.find((effect) => effect.name === effect.name);
      if(effectToUpdate) {
        effectToUpdate.duration = effect.duration;
      }
    }
    
    
    
    updateStatusEffects(): void {
      for (let i = this.statusEffects.length - 1; i >= 0; i--) {
          const effect = this.statusEffects[i];
          effect.duration--;
          if (effect.duration <= 0) {
            this.removeStatusEffect(effect.name);
          }
        }
    }

      hasStatusEffect(effectName: StatusEffectType): boolean {
        return this.statusEffects.some((effect) => effect.name === effectName);
      }

      getStatusEffectsOfHook(hook: StatusEffectHook): StatusEffect[] {
        const statusEffectsOfHook = this.statusEffects.filter((statusApp) => {
          const statusEffect = getStatusEffect(statusApp.name);
          return statusEffect && statusEffect.applicationHooks[hook];
        }).map((statusApp) => getStatusEffect(statusApp.name))
        .filter((statusEffect) => statusEffect !== undefined) as StatusEffect[];
        return statusEffectsOfHook;
      }

      getStatusEffects(): StatusEffect[] {
        return this.statusEffects.map((statusApp) => getStatusEffect(statusApp.name))
        .filter((statusEffect) => statusEffect !== undefined) as StatusEffect[];
      }
    

      canUseSkill(skill: SpecialMove): boolean {
        return this.stats.stamina >= skill.cost && 
        (!skill.checkRequirements || skill.checkRequirements(this)) &&
        !this.hasStatusEffect(StatusEffectType.STUPEFIED);
      }

      insertAiAgent(aiAgent: AIAgent) {
        if(this.aiAgent) {
            this.aiAgent.unshift(aiAgent);
        } else {
            this.aiAgent = [aiAgent];
        }
      }

      getAiAgent(): AIAgent | undefined {
        return this.aiAgent && this.aiAgent.length > 0 ? this.aiAgent[0] : undefined;
      }

      removeAiAgent(aiAgentType: AIAgentType) {
        if(!this.aiAgent) {
          throw new Error('No AI agent to remove');
        }
        if(this.aiAgent.length === 0) {
          return;
        }
        if(this.aiAgent.length === 1) {
          this.aiAgent.shift();
        } else {
          const index = this.aiAgent.findIndex(agent => agent.getAIAgentType() === aiAgentType);
          if (index !== -1) {
            this.aiAgent.splice(index, 1);
          }
        }
      }
  }

  