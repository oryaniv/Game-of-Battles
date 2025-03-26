import { Damage, Resistance } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { StatusEffect, StatusEffectHook, StatusEffectType } from "./StatusEffect";
import { Team } from "./Team";
import { AttackResult } from "./attackResult";

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
    public statusEffects: StatusEffect[] = [];

    startTurn(): void {
        if(this.isDefending()) {
            this.removeStatusEffect(StatusEffectType.DEFENDING);
        }
        this.stats.hp === this.baseStats.hp;
    }

    abstract basicAttack(): Damage
  
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
  
    move(newPosition: Position, board: Board) {
        board.removeCombatant(this);
        board.placeCombatant(this, newPosition);
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
  
    takeDamage(damageAmount: number): void {
      this.stats.hp -= damageAmount;
  
      if (this.stats.hp < 0) this.stats.hp = 0;
    }
  
    // calculateAttackResult(position: Position, board: Board): AttackResult {
    //     const target = board.getCombatantAtPosition(position);
    //     if(!target) return AttackResult.NotFound;

    //     const attackResult = this.calculateAttackRoll(target);
    //     if(attackResult === AttackResult.Hit || attackResult === AttackResult.CriticalHit){
    //         const damage = this.basicAttack();
    //         return target.takeDamage(damage);
    //     }   
    //     return attackResult;
    // }
  
    // calculateAttackRoll(target: Combatant): AttackResult {
    //   const hitRoll = ((this.stats.agility - target.stats.agility) * 0.01) + Math.floor(Math.random() * 100) + 1;

    //   if(hitRoll < 5) {
    //     return AttackResult.Fumble;
    //   }
    //   else if (hitRoll < 20) {
    //     return AttackResult.Miss;
    //   } else if (hitRoll > 90) {
    //     return AttackResult.CriticalHit;
    //   } else {
    //     return AttackResult.Hit;
    //   }
    // }

    
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