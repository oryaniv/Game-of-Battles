import { Damage } from "./Damage";
import { Board } from "./Board";
import { DamageType } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";

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
      public stats: CombatantStats,
      public position: Position,
      public weaknesses: DamageType[],
      public resistances: DamageType[],
      public specialMoves: SpecialMove[]
    ) {}
  
    abstract basicAttack(target: Combatant): Damage;
  
    useSpecialMove(target: Combatant, moveName: string): Damage | null {
      const move = this.specialMoves.find((m) => m.name === moveName);
      if (!move) return null;
  
      if (this.stats.stamina < move.cost) {
        console.log("Not enough stamina!");
        return null;
      }
  
      this.stats.stamina -= move.cost;
  
      let damage = move.damage;
  
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
      return this.stats.defensePower / 2;
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
  }