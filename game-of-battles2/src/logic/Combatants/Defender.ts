import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";

export class Defender extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 150,
          attackPower: 10,
          defensePower: 30,
          stamina: 30,
          initiative: 5,
          movementSpeed: 2,
          range: 1,
          agility: 10,
          luck: 5,
        },
        position,
        [DamageType.Fire, DamageType.Lightning],
        [DamageType.Slash, DamageType.Pierce],
        [
          {
            name: "Defensive Strike",
            cost: 5,
            range: 1,
            damage: { amount: 15, type: DamageType.Slash },
            effect: (target: Combatant) => {
              console.log(`${this.name} used Defensive Strike on ${target.name}!`);
              this.defend();
            },
          },
          {
            name: "Blocking Stance",
            cost: 3,
            range: 0,
            damage: { amount: 0, type: DamageType.Unstoppable },
            effect: (combatant: Combatant) => {
              combatant.applyStatusEffect({
                name: StatusEffectType.BLOCKING_STANCE,
                duration: Infinity,
                hooks: {
                  [StatusEffectHook.OnApply]: (combatant: Combatant) => combatant.defend(),
                  [StatusEffectHook.OnCalculateDamage]: (combatant: Combatant, damage: Damage) => {
                    if ([DamageType.Slash, DamageType.Pierce, DamageType.Crush].includes(damage.type) && Math.random() < 0.5) {
                      console.log(`${combatant.name} blocked the attack!`);
                      // Here you would also increase the AP cost of the attack, but we'll leave that for later.
                    }
                    return damage;
                  },
                  [StatusEffectHook.OnActionAttempt]: (combatant: Combatant, actionType:string) => {
                      if (actionType === "move" || actionType === "attack"){
                          combatant.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
                      }
                      return false;
                  }
                },
              });
            },
          },
          {
            name: "Sentinel",
            cost: 3,
            range: 0,
            damage: { amount: 0, type: DamageType.Unstoppable },
            effect: (combatant: Combatant) => {
              combatant.applyStatusEffect({
                name: StatusEffectType.SENTINEL,
                duration: Infinity,
                hooks: {
                  [StatusEffectHook.OnActionAttempt]: (combatant, actionType:string) => {
                      if (actionType === "move" || actionType === "attack"){
                          combatant.removeStatusEffect(StatusEffectType.SENTINEL);
                      }
                      return false;
                  },
                  [StatusEffectHook.OnAdjacentEnemyEnter]: (combatant:Combatant, enemy:Combatant, board:Board) => {
                      if(board.getAdjacentCombatants(combatant, 1).includes(enemy)){
                          combatant.basicAttack(enemy);
                      }
                  }
                },
              });
            },
          },
        ], team
      );
      this.lastStandTriggered = false;
    }
    private lastStandTriggered: boolean;
  
    basicAttack(target: Combatant): Damage {
      return { amount: this.stats.attackPower, type: DamageType.Slash };
    }
  
    takeDamage(damage: Damage): void {
      super.takeDamage(damage);
  
      if (this.stats.hp <= 0 && !this.lastStandTriggered) {
          this.stats.hp = 1;
          this.lastStandTriggered = true;
          console.log(`${this.name} triggered Last Stand!`);
      }
    }
  
    move(newPosition: Position, board: Board): boolean {
        const marchingDefense = this.statusEffects.find(effect => effect.name === StatusEffectType.DEFENDING);
        if(marchingDefense){
            if(board.isValidMove(this.position, newPosition, this.stats.movementSpeed)){
                this.position = newPosition;
                this.removeStatusEffect(StatusEffectType.DEFENDING);
                return true;
            }
        }
        return super.move(newPosition, board);
    }
  
    defend(): number {
      return super.defend();
    }   
  }