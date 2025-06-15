import { Damage, Resistance } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove, SpecialMoveTriggerType } from "./SpecialMove";
import { getResultsForStatusEffectHook, getStatusEffect, StatusEffect, StatusEffectAlignment, StatusEffectApplication, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";
import { ActionResult, AttackResult } from "./attackResult";
import { CombatantType } from "./Combatants/CombatantType";
import { emitter } from "@/eventBus";
import { AIAgent, AIAgentType } from "./AI/AIAgent";
import { EventLogger } from "@/eventLogger";
import { BoardPiece } from "./BoardObject";

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

  export abstract class Combatant implements BoardPiece {
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
    public relatedCombatants: Record<string, Combatant> = {};
    hasMoved: boolean = false;

    startTurn(): ActionResult[] {
        const eventLogger = EventLogger.getInstance();
        // eventLogger.logEvent(`${this.name} the ${this.getCombatantType()} acts`);
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
        const movingDistance = board.getDistanceBetweenPositions(this.position, newPosition);
        const onMovingHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnMoving, undefined, undefined, movingDistance, board);

        if(this.isKnockedOut() || onMovingHookResults.some((result) => result.attackResult !== AttackResult.NotFound)) {
          return true;
        }

        board.removeCombatant(this);
        if(!board.isPositionEmpty(newPosition)) {
          board.placeCombatantWherePossible(this, newPosition);
          const occupyingCombatant = board.getCombatantAtPosition(newPosition);
          occupyingCombatant?.beingSteppedOn(board);
        } else{
          board.placeCombatant(this, newPosition);
        }

        const eventLogger = EventLogger.getInstance();
        // eventLogger.logEvent(`${this.name} moves to (${newPosition.x},${newPosition.y})`);
        this.hasMoved = true;
        // emitter.emit('play-move-sound');
    }

    beingSteppedOn(board: Board): boolean {
      const onBeingSteppedOnHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnBeingSteppedOn, this, undefined, undefined, board);
      return false;
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
  
    takeDamage(damage: Damage, board?: Board): void {
      this.stats.hp -= damage.amount;
      getResultsForStatusEffectHook(this, StatusEffectHook.OnDamageTaken, this, damage, 1);
      if (this.stats.hp <= 0) {
        this.stats.hp = 0;
        const onDeathHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnDeath, this, {amount: 0, type: DamageType.Unstoppable}, 1, board);
        onDeathHookResults.flatMap(e => e).filter((result) => result.attackResult !== AttackResult.NotFound).forEach((result) => {
          emitter.emit('trigger-method', result);
        });
      }
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

        // removeStatusHook && removeStatusHook(this, this, {amount: 0, type: DamageType.Unstoppable});
        // this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);

        this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);
        removeStatusHook && removeStatusHook(this, this, {amount: 0, type: DamageType.Unstoppable});
        
      }
    }

    removeAllStatusEffects(): void {
      this.statusEffects.forEach((effect) => {
        const statusEffect = getStatusEffect(effect.name);
        if(statusEffect?.alignment === StatusEffectAlignment.Permanent) {
          return;
        }
        this.removeStatusEffect(effect.name);
      });
    }

    updateStatusEffect(effect: StatusEffectApplication): void {
      const effectToUpdate = this.statusEffects.find((existingEffect) => existingEffect.name === effect.name);
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
      
      canSupportSkill(skill: SpecialMove): boolean {
        return this.stats.stamina >= skill.cost && 
          [
            StatusEffectType.STUPEFIED,
            StatusEffectType.CHARMED,
            StatusEffectType.NIGHTMARE_LOCKED,
            StatusEffectType.MESMERIZED,
            StatusEffectType.FROZEN,
            StatusEffectType.NAUSEATED,
            StatusEffectType.TAUNTED,
            StatusEffectType.PANICKED,
          ].every(statusEffect => !this.hasStatusEffect(statusEffect));
      }

      isCloaked(): boolean {
        return this.statusEffects.some(effect => effect.name === StatusEffectType.CLOAKED);
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

      // can be healed with ReinforceConstruct
      isConstruct(): boolean {
        return this.hasStatusEffect(StatusEffectType.FULL_METAL_JACKET);
      }

      // does not count towards team survival
      isExpendable(): boolean {
        return false;
      }

      // can be mind controlled, poisoned, etc.
      isOrganic(): boolean {
        return true;
      }

      addRelatedCombatant(relation:string, combatant: Combatant): void {
        this.relatedCombatants[relation] = combatant;
      }

      removeRelatedCombatant(relation:string): void {
        delete this.relatedCombatants[relation];
      }

      getRelatedCombatants(): Record<string, Combatant> {
        return this.relatedCombatants;
      }
  }

  