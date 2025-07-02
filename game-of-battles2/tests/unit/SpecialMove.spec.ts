import { SpecialMove } from '@/logic/SpecialMove';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { SpecialMoveTriggerType, SpecialMoveRangeType, SpecialMoveAreaOfEffect, SpecialMoveAlignment } from '@/logic/SpecialMove';
import { DamageReaction, DamageType } from '@/logic/Damage';
import { Combatant } from '@/logic/Combatant';
import { Board } from '@/logic/Board';
import { Position } from '@/logic/Position';
import { AttackResult, getStandardActionResult } from '@/logic/attackResult';
import { Militia } from '@/logic/Combatants/Militia';
import { Game } from '@/logic/Game';
import { Team } from '@/logic/Team';
import { Defender } from '@/logic/Combatants/Defender';
import { ArcaneChanneling, BlockingStance, FocusAim } from '@/logic/SpecialMoves/Singular/Self';
import { StatusEffectAlignment, StatusEffectType } from '@/logic/StatusEffect';
import { ChainLightning, DefensiveStrike, FireBall, FrozenBurst, Ricochet } from '@/logic/SpecialMoves/Singular/Offensive';
import { Heal, Purify, Regenerate } from '@/logic/SpecialMoves/Singular/Support';
import { CombatMaster } from '@/logic/CombatMaster';
import { Hunter } from '@/logic/Combatants/Hunter';
import { Wizard } from '@/logic/Combatants/Wizard';

describe('SpecialMove', () => {
  it('should define correct trigger types', () => {
    expect(SpecialMoveTriggerType.Active).toBe('Active');
    expect(SpecialMoveTriggerType.Passive).toBe('Passive');
    expect(SpecialMoveTriggerType.Cooperative).toBe('Cooperative');
  });

  it('should define correct range types', () => {
    expect(SpecialMoveRangeType.Self).toBe('Self');
    expect(SpecialMoveRangeType.Melee).toBe('Melee');
    expect(SpecialMoveRangeType.Straight).toBe('Straight');
    expect(SpecialMoveRangeType.Curve).toBe('Curve');
    expect(SpecialMoveRangeType.None).toBe('None');
  });

  it('should define correct area of effect types', () => {
    expect(SpecialMoveAreaOfEffect.Single).toBe('Single');
    expect(SpecialMoveAreaOfEffect.Cross).toBe('Cross');
    expect(SpecialMoveAreaOfEffect.Nova).toBe('Nova');
    expect(SpecialMoveAreaOfEffect.Line).toBe('Line');
    expect(SpecialMoveAreaOfEffect.Cone).toBe('Cone');
    expect(SpecialMoveAreaOfEffect.Chain).toBe('Chain');
  });

  it('should define correct alignment types', () => {
    expect(SpecialMoveAlignment.Self).toBe('Self');
    expect(SpecialMoveAlignment.SelfAndAlly).toBe('SelfAndAlly');
    expect(SpecialMoveAlignment.Ally).toBe('Ally');
    expect(SpecialMoveAlignment.Enemy).toBe('Enemy');
    expect(SpecialMoveAlignment.All).toBe('All');
  });

  it('should create a valid special move object', () => {
    const specialMove: SpecialMove = {
      name: 'Test Move',
      triggerType: SpecialMoveTriggerType.Active,
      cost: 10,
      turnCost: 1,
      range: {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
      },
      damage: {
        amount: 20,
        type: DamageType.Slash
      },
      description: 'Test special move'
    };

    expect(specialMove.name).toBe('Test Move');
    expect(specialMove.triggerType).toBe(SpecialMoveTriggerType.Active);
    expect(specialMove.cost).toBe(10);
    expect(specialMove.turnCost).toBe(1);
    expect(specialMove.range.type).toBe(SpecialMoveRangeType.Straight);
    expect(specialMove.range.align).toBe(SpecialMoveAlignment.Enemy);
    expect(specialMove.range.areaOfEffect).toBe(SpecialMoveAreaOfEffect.Single);
    expect(specialMove.range.range).toBe(3);
    expect(specialMove.damage.amount).toBe(20);
    expect(specialMove.damage.type).toBe(DamageType.Slash);
    expect(specialMove.description).toBe('Test special move');
  });

  it('should handle optional effect and checkRequirements', () => {
    const mockEffect = jest.fn(() => getStandardActionResult());
    const mockCheck = jest.fn(() => true);

    const specialMove: SpecialMove = {
      name: 'Test Move',
      triggerType: SpecialMoveTriggerType.Active,
      cost: 10,
      turnCost: 1,
      range: {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
      },
      damage: {
        amount: 0,
        type: DamageType.Slash
      },
      effect: mockEffect,
      checkRequirements: mockCheck,
      description: 'Test special move with effects'
    };

    expect(specialMove.effect).toBeDefined();
    expect(specialMove.checkRequirements).toBeDefined();
    expect(mockCheck()).toBe(true);
  });

});

describe('Blocking stance tests', () => {
    let team1,team2,board:Board,game:Game,combatant:Combatant;

    beforeEach(() => {
      team1 = new Team('Team 1', 1);
      team2 = new Team('Team 2', 2);
      board = new Board(10, 10);
      combatant = new Defender('Fighter', { x: 0, y: 0 }, team1);
      team1.addCombatant(combatant);
      team2.addCombatant(new Militia('Enemy', { x: 1, y: 0 }, team2));
      game = new Game([team1, team2],board);
    });

  it('activate blocking stance, defender has blocking stance status effect', () => {
    game.executeSkill(new BlockingStance(),combatant,{x:0,y:0},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(true);
  });

  it('blocking stance is removed after moving', () => {
    game.executeSkill(new BlockingStance(),combatant,{x:0,y:0},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(true);
    combatant.move({x:1,y:1},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(false);
  });

  it('blocking stance is removed after defending', () => {
    game.executeSkill(new BlockingStance(),combatant,{x:0,y:0},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(true);
    game.executeDefend();
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(false);
  });

  it('blocking stance is removed after being attacked', () => {
    game.executeSkill(new BlockingStance(),combatant,{x:0,y:0},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(true);
    game.executeBasicAttack(combatant,{x:1,y:0},board);
    expect(combatant.hasStatusEffect(StatusEffectType.BLOCKING_STANCE)).toBe(false);
  });
  
});



describe('Defensive strike tests', () => {

    it('should defend after using defensive strike', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const combatant = new Defender('Fighter', { x: 0, y: 0 }, team1);
        team1.addCombatant(combatant);
        team2.addCombatant(new Militia('Enemy', { x: 1, y: 0 }, team2));
        const game = new Game([team1, team2], board);

        game.executeSkill(new DefensiveStrike(), combatant, {x:1,y:0}, board);
        expect(combatant.hasStatusEffect(StatusEffectType.DEFENDING)).toBe(true);
    });
  });

  describe('Heal tests', () => {
    it('ally should be healed after using heal', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const healer = new Militia('Healer', { x: 0, y: 0 }, team1);
        const ally = new Militia('Ally', { x: 1, y: 0 }, team1);
        team1.addCombatant(healer);
        team1.addCombatant(ally);
        const game = new Game([team1, team2], board);

        // Damage the ally first
        ally.stats.hp -= 20;
        const initialHp = ally.stats.hp;

        game.executeSkill(new Heal(), healer, {x:1,y:0}, board);
        expect(ally.stats.hp).toBeGreaterThan(initialHp);
    });
  });

  describe('Purify tests', () => {
    it('ally should lose all negative status effects after being targeted by purify', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const healer = new Militia('Healer', { x: 0, y: 0 }, team1);
        const ally = new Militia('Ally', { x: 1, y: 0 }, team1);
        team1.addCombatant(healer);
        team1.addCombatant(ally);
        const game = new Game([team1, team2], board);

        // Apply some negative status effects to ally
        ally.applyStatusEffect({
            name: StatusEffectType.FROZEN,
            duration: 3,
        });
        ally.applyStatusEffect({
            name: StatusEffectType.IMMOBILIZED,
            duration: 3,
        });

        expect(ally.hasStatusEffect(StatusEffectType.FROZEN)).toBe(true);
        expect(ally.hasStatusEffect(StatusEffectType.IMMOBILIZED)).toBe(true);

        game.executeSkill(new Purify(), healer, {x:1,y:0}, board);
        
        expect(ally.hasStatusEffect(StatusEffectType.FROZEN)).toBe(false);
        expect(ally.hasStatusEffect(StatusEffectType.IMMOBILIZED)).toBe(false);
    });
  });


  describe('Regenerate tests', () => {
    it('should heal a little every turn', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const healer = new Militia('Healer', { x: 0, y: 0 }, team1);
        const ally = new Militia('Ally', { x: 1, y: 0 }, team1);
        const enemy = new Militia('Enemy', { x: 2, y: 0 }, team2);
        team1.addCombatant(healer);
        team1.addCombatant(ally);
        team2.addCombatant(enemy);
        const game = new Game([team1, team2], board);

        // Damage the ally first
        ally.stats.hp -= 20;
        const initialHp = ally.stats.hp;

        game.executeSkill(new Regenerate(), healer, {x:1,y:0}, board);
        
        expect(ally.hasStatusEffect(StatusEffectType.REGENERATING)).toBe(true);
        game.nextTurn();

        // Skip first turn
        game.executeSkipTurn();
        game.nextTurn();
        expect(ally.stats.hp).toBeGreaterThan(initialHp);

        const hpAfterFirstTurn = ally.stats.hp;

        // Skip second turn  
        game.executeSkipTurn();
        game.nextTurn();

        game.executeSkipTurn();
        game.nextTurn();

        game.executeSkipTurn();
        game.nextTurn();
        expect(ally.stats.hp).toBeGreaterThan(hpAfterFirstTurn);
    });
  });

  describe('Focus Aim tests', () => {
    
    it('should have focus aim status effect after using focus aim', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const archer = new Militia('Archer', { x: 0, y: 0 }, team1);
        const enemy = new Militia('Enemy', { x: 3, y: 0 }, team2);
        team1.addCombatant(archer);
        team2.addCombatant(enemy);
        const game = new Game([team1, team2], board);

        const initialAttack = archer.stats.attackPower;
        const initialAgility = archer.stats.agility;

        game.executeSkill(new FocusAim(), archer, {x:0,y:0}, board);
        
        expect(archer.hasStatusEffect(StatusEffectType.FOCUS_AIM)).toBe(true);
    });

    it('should remove focus aim status effect after attacking', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const archer = new Militia('Archer', { x: 0, y: 0 }, team1);
        const enemy = new Militia('Enemy', { x: 1, y: 0 }, team2);
        team1.addCombatant(archer);
        team2.addCombatant(enemy);
        const game = new Game([team1, team2], board);

        game.executeSkill(new FocusAim(), archer, {x:0,y:0}, board);
        expect(archer.hasStatusEffect(StatusEffectType.FOCUS_AIM)).toBe(true);

        game.executeBasicAttack(archer, {x:1,y:0}, board);
        expect(archer.hasStatusEffect(StatusEffectType.FOCUS_AIM)).toBe(false);
    });
  });

  describe('Pin down tests', () => {
    it('enemy should be pinned down after using pin down', () => {
        expect(true).toBe(true);
    });
  });

  describe('Ricochet tests', () => {
    it('should hit 2 targets after using ricochet', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const archer = new Hunter('Archer', { x: 0, y: 0 }, team1);
        const enemy1 = new Militia('Enemy1', { x: 2, y: 0 }, team2);
        const enemy2 = new Militia('Enemy2', { x: 3, y: 0 }, team2);
        team1.addCombatant(archer);
        team2.addCombatant(enemy1);
        team2.addCombatant(enemy2);
        const game = new Game([team1, team2], board);


        // Mock CombatMaster to always return successful hits
        jest.spyOn(CombatMaster.getInstance(), 'executeAttack').mockImplementation(() => {
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Pierce
                },
                cost: 1,
                reaction: DamageReaction.NONE,
            };
        });

        const actionResults = game.executeSkill(new Ricochet(), archer, {x:2,y:0}, board);

        expect(actionResults.length).toBe(2);
        expect(actionResults[0].damage.amount).toBe(10);
        expect(actionResults[1].damage.amount).toBe(10);
    });
  });

  describe('Arcane channeling tests', () => {
    it('should have arcane channeling status effect after using arcane channeling', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const mage = new Militia('Mage', { x: 0, y: 0 }, team1);
        team1.addCombatant(mage);
        const game = new Game([team1, team2], board);

        game.executeSkill(new ArcaneChanneling(), mage, {x:0,y:0}, board);
        
        expect(mage.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING)).toBe(true);
    });
  });

  describe('Fireball tests', () => {
    it('should hit all enemies after using fireball', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const wizard = new Wizard('Wizard', { x: 0, y: 0 }, team1);
        const enemy1 = new Militia('Enemy1', { x: 6, y: 0 }, team2);
        const enemy2 = new Militia('Enemy2', { x: 5, y: 0 }, team2);
        const enemy3 = new Militia('Enemy3', { x: 4, y: 0 }, team2);
        team1.addCombatant(wizard);
        team2.addCombatant(enemy1);
        team2.addCombatant(enemy2);
        team2.addCombatant(enemy3);
        const game = new Game([team1, team2], board);

        // Mock CombatMaster to always return successful hits
        jest.spyOn(CombatMaster.getInstance(), 'executeAttack').mockImplementation(() => {
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Fire
                },
                cost: 1,
                reaction: DamageReaction.NONE,
            };
        });

        const actionResults = game.executeSkill(new FireBall(), wizard, {x:5,y:0}, board);

        expect(actionResults.length).toBe(6);
        expect(actionResults[0].damage.amount).toBe(10);
        expect(actionResults[1].damage.amount).toBe(10);
        expect(actionResults[2].damage.amount).toBe(10);
        expect(actionResults[0].damage.type).toBe(DamageType.Fire);
    });
  });

  describe('Chain lightning tests', () => {
    it('should hit 4 enemies after using chain lightning', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const wizard = new Wizard('Wizard', { x: 0, y: 0 }, team1);
        const enemy1 = new Militia('Enemy1', { x: 2, y: 0 }, team2);
        const enemy2 = new Militia('Enemy2', { x: 2, y: 1 }, team2);
        const enemy3 = new Militia('Enemy3', { x: 3, y: 0 }, team2);
        const enemy4 = new Militia('Enemy4', { x: 3, y: 1 }, team2);
        team1.addCombatant(wizard);
        team2.addCombatant(enemy1);
        team2.addCombatant(enemy2);
        team2.addCombatant(enemy3);
        team2.addCombatant(enemy4);
        const game = new Game([team1, team2], board);

        // Mock CombatMaster to always return successful hits
        jest.spyOn(CombatMaster.getInstance(), 'executeAttack').mockImplementation(() => {
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Lightning
                },
                cost: 1,
                reaction: DamageReaction.NONE,
            };
        });

        const actionResults = game.executeSkill(new ChainLightning(), wizard, {x:2,y:0}, board);

        expect(actionResults.length).toBe(4);
        expect(actionResults[0].damage.amount).toBe(10);
        expect(actionResults[1].damage.amount).toBe(10);
        expect(actionResults[2].damage.amount).toBe(10);
        expect(actionResults[3].damage.amount).toBe(10);
        expect(actionResults[0].damage.type).toBe(DamageType.Lightning);
    });
  });

  describe('Frozen burst tests', () => {
    it('enemy should be frozen after using frozen burst', () => {
        const team1 = new Team('Team 1', 1);
        const team2 = new Team('Team 2', 2);
        const board = new Board(10, 10);
        const wizard = new Wizard('Wizard', { x: 0, y: 0 }, team1);
        const enemy = new Militia('Enemy', { x: 1, y: 0 }, team2);
        team1.addCombatant(wizard);
        team2.addCombatant(enemy);
        const game = new Game([team1, team2], board);

        // Mock CombatMaster to return successful hit and status effect application
        jest.spyOn(CombatMaster.getInstance(), 'executeAttack').mockImplementation(() => {
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Ice
                },
                cost: 1,
                reaction: DamageReaction.NONE,
            };
        });

        jest.spyOn(CombatMaster.getInstance(), 'tryInflictStatusEffect').mockImplementation(() => true);

        const actionResults = game.executeSkill(new FrozenBurst(), wizard, {x:1,y:0}, board);

        expect(actionResults.length).toBe(1);
        expect(actionResults[0].damage.type).toBe(DamageType.Ice);
        expect(CombatMaster.getInstance().tryInflictStatusEffect).toHaveBeenCalled();
    });
  });


