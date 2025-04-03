import { Damage, Resistance } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { getResultsForStatusEffectHook, getStatusEffect, StatusEffect, StatusEffectApplication, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";
import { ActionResult, AttackResult } from "./attackResult";
import { CombatantType } from "./Combatants/CombatantType";

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

    startTurn(): void {
        if(this.isDefending()) {
            this.removeStatusEffect(StatusEffectType.DEFENDING);
        }
        this.stats.hp === this.baseStats.hp;
    }

    abstract basicAttack(): Damage

    abstract getCombatantType(): CombatantType;

    getSpecialMoves(): SpecialMove[] {
      return this.specialMoves;
    }
  
    move(newPosition: Position, board: Board) {
        // const onMovingHooks: StatusEffect[] = this.getStatusEffectsOfHook(StatusEffectHook.OnMoving);
        // const onMovingHookskResults: ActionResult[] = onMovingHooks
        // .map((hook) => hook.applicationHooks[StatusEffectHook.OnMoving]!(this))
        // .filter((result) => result !== undefined) as ActionResult[];

        const onMovingHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnMoving);

        board.removeCombatant(this);
        board.placeCombatant(this, newPosition);
    }
  
    defend(): number {
      // const onDefendingHooks: StatusEffect[] = this.getStatusEffectsOfHook(StatusEffectHook.OnDefending);
      // const onDefendingHookResults: ActionResult[] = onDefendingHooks
      // .map((hook) => hook.applicationHooks[StatusEffectHook.OnDefending]!(this))
      // .filter((result) => result !== undefined) as ActionResult[];

      const onDefendingHookResults = getResultsForStatusEffectHook(this, StatusEffectHook.OnDefending);
      const defenseStatus: StatusEffectApplication = {
          name: StatusEffectType.DEFENDING,
          duration: 0,
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
    }

    updateStatusEffect(effect: StatusEffectApplication): void {
      const effectToUpdate = this.statusEffects.find((effect) => effect.name === effect.name);
      if(effectToUpdate) {
        effectToUpdate.duration = effect.duration;
      }
    }
    
    removeStatusEffect(effectName: StatusEffectType): void {
      const effectToRemove = this.statusEffects.find((effect) => effect.name === effectName);
      if(effectToRemove) {
        this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);
      }
    }
    
      updateStatusEffects(roundCount: number): void {
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