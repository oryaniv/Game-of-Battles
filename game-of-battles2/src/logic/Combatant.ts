import { Damage, Resistance } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { getResultsForStatusEffectHook, getStatusEffect, StatusEffect, StatusEffectApplication, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";
import { ActionResult, AttackResult } from "./attackResult";
import { CombatantType } from "./Combatants/CombatantType";
import { emitter } from "@/eventBus";

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
    ) {this.stats = { ...this.baseStats }; this.team = team;}

    public stats: CombatantStats; // Current stats, can be modified by effects
    public statusEffects: StatusEffectApplication[] = [];

    startTurn(): ActionResult[] {
        if(this.isDefending()) {
            this.removeStatusEffect(StatusEffectType.DEFENDING);
        }
        const turnStartHookResults: ActionResult[] = getResultsForStatusEffectHook(this, StatusEffectHook.OnTurnStart);
        turnStartHookResults.forEach((result) => {
            emitter.emit('trigger-method', result);
        });
        return turnStartHookResults;
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
    
    applyStatusEffect(effect: StatusEffectApplication): void {
        this.statusEffects.push(effect);
        getResultsForStatusEffectHook(this, StatusEffectHook.OnApply, this, {amount: 0, type: DamageType.Unstoppable});
    }

    updateStatusEffect(effect: StatusEffectApplication): void {
      const effectToUpdate = this.statusEffects.find((effect) => effect.name === effect.name);
      if(effectToUpdate) {
        effectToUpdate.duration = effect.duration;
      }
    }
    
    removeStatusEffect(effectName: StatusEffectType): void {
      getResultsForStatusEffectHook(this, StatusEffectHook.OnRemove, this, {amount: 0, type: DamageType.Unstoppable});
      const effectToRemove = this.statusEffects.find((effect) => effect.name === effectName);
      if(effectToRemove) {
        this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);
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
    
      applyStatModifiers(roundCount: number): void {
        // this.stats = { ...this.baseStats };
    
        // for (const effect of this.statusEffects) {
        //   if (effect.modifyStats) {
        //     this.stats = effect.modifyStats(this.stats);
        //   }
        // }
      }

      canUseSkill(skill: SpecialMove): boolean {
        return this.stats.stamina >= skill.cost && 
        (!skill.checkRequirements || skill.checkRequirements(this));
      }
  }