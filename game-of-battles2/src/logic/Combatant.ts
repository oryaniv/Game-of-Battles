import { Damage } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { StatusEffect, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";

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
      public weaknesses: DamageType[],
      public resistances: DamageType[],
      public specialMoves: SpecialMove[],
      public team: Team
    ) {this.stats = { ...this.baseStats }; this.team = team;}

    public stats: CombatantStats; // Current stats, can be modified by effects
    public statusEffects: StatusEffect[] = [];
    // private defending: boolean = false;

    startTurn(): void {
        if(this.isDefending()) {
            this.removeStatusEffect(StatusEffectType.DEFENDING);
        }
    }

    abstract basicAttack(target: Combatant): Damage;
  
    useSpecialMove(target: Combatant, moveName: string): Damage | null {
      const move = this.specialMoves.find((m) => m.name === moveName);
      if (!move) return null;
  
      if (this.stats.stamina < move.cost) {
        console.log("Not enough stamina!");
        return null;
      }
  
      this.stats.stamina -= move.cost;
  
      const damage = move.damage;
  
      // Apply special effect if any.
      if (move.effect) {
        move.effect(target);
      }
      return damage;
    }
  
    move(newPosition: Position, board: Board): boolean {
      if (board.isValidMove(this.position, newPosition, this.stats.movementSpeed)) {
        this.position = newPosition;
        return true;
      }
      return false;
    }
  
    defend(): number {
        const defenseStatus: StatusEffect = {
          name: StatusEffectType.DEFENDING,
          duration: 0,
          hooks: {
            [StatusEffectHook.OnDamageTaken]: (combatant, damage: number) => damage / 2,
          },
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
  
    takeDamage(damage: Damage): void {
      let finalDamage = damage.amount;
  
      if (this.weaknesses.includes(damage.type)) {
        finalDamage *= 1.25; // Example: 50% extra damage
      }
  
      if (this.resistances.includes(damage.type)) {
        finalDamage *= 0.5; // Example: 50% reduced damage
      }
  
      if(finalDamage < 0) finalDamage = 0;
  
      this.stats.hp -= finalDamage;
  
      if (this.stats.hp < 0) this.stats.hp = 0;
    }
  
    calculateHitChance(target: Combatant): boolean {
      const hitChance = (this.stats.agility / (this.stats.agility + target.stats.agility)) * 100;
  
      return Math.random() < hitChance / 100;
    }
  
    calculateCriticalHit(): boolean {
        return Math.random() < this.stats.luck / 100;
    }
  
    calculateFumble(): boolean{
        return Math.random() < 0.05; // 5% chance of fumble
    }
    
    applyStatusEffect(effect: StatusEffect): void {
        this.statusEffects.push(effect);
        const onApplyHook = effect.hooks[StatusEffectHook.OnApply];
        if (onApplyHook && typeof onApplyHook === 'function') {
            onApplyHook(this);
        }
      }
    
      removeStatusEffect(effectName: StatusEffectType): void {
        const effectToRemove = this.statusEffects.find((effect) => effect.name === effectName);

        if (effectToRemove && effectToRemove.hooks[StatusEffectHook.OnRemove] !== undefined && typeof effectToRemove.hooks[StatusEffectHook.OnRemove] === 'function') {
            effectToRemove.hooks[StatusEffectHook.OnRemove]?.(this);
        }

        this.statusEffects = this.statusEffects.filter((effect) => effect.name !== effectName);
      }
    
      updateStatusEffects(roundCount: number): void {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            if (effect.hooks[StatusEffectHook.OnTurnStart] !== undefined && typeof effect.hooks[StatusEffectHook.OnTurnStart] === 'function') {
              effect.hooks[StatusEffectHook.OnTurnStart]?.(this);
            }
            effect.duration--;
            if (effect.duration <= 0) {
              this.removeStatusEffect(effect.name);
            }
          }
      }
    
      applyStatModifiers(roundCount: number): void {
        this.stats = { ...this.baseStats };
    
        for (const effect of this.statusEffects) {
          if (effect.modifyStats) {
            this.stats = effect.modifyStats(this.stats);
          }
        }
      }
  }