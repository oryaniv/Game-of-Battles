import { StatusEffectType, StatusEffectHook, StatusEffectAlignment, StatusEffect, getStatusEffect, getResultsForStatusEffectHook } from '@/logic/StatusEffect';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Combatant } from '@/logic/Combatant';
import { Team } from '@/logic/Team';
import { Position } from '@/logic/Position';
import { DamageType } from '@/logic/Damage';
import { getStandardActionResult } from '@/logic/attackResult';
import { Militia } from '@/logic/Combatants/Militia';

describe('StatusEffect basic tests', () => {
  let mockCombatant: Combatant;
  
  beforeEach(() => {
    const team = new Team('Test Team', 1);
    mockCombatant = new Militia('Test Fighter', { x: 0, y: 0 } as Position, team);
  });

  it('should define correct status effect types', () => {
    expect(StatusEffectType.DEFENDING).toBe(0);
    expect(StatusEffectType.BLOCKING_STANCE).toBe(1);
    expect(StatusEffectType.ARCANE_CHANNELING).toBe(2);
    expect(StatusEffectType.FOCUS_AIM).toBe(3);
    expect(StatusEffectType.FORTIFIED).toBe(4);
    expect(StatusEffectType.IMMOBILIZED).toBe(5);
    expect(StatusEffectType.REGENERATING).toBe(6);
    expect(StatusEffectType.FROZEN).toBe(7);
  });

  it('should define correct status effect hooks', () => {
    expect(StatusEffectHook.OnApply).toBe('OnApply');
    expect(StatusEffectHook.OnRemove).toBe('OnRemove');
    expect(StatusEffectHook.OnTurnStart).toBe('OnTurnStart');
    expect(StatusEffectHook.OnTurnEnd).toBe('OnTurnEnd');
    expect(StatusEffectHook.OnBeingAttacked).toBe('OnBeingAttacked');
    expect(StatusEffectHook.OnDamageTaken).toBe('OnDamageTaken');
    expect(StatusEffectHook.OnAfterCalculateDamage).toBe('OnAfterCalculateDamage');
    expect(StatusEffectHook.OnAdjacentEnemyEnter).toBe('OnAdjacentEnemyEnter');
    expect(StatusEffectHook.OnKnockOut).toBe('OnKnockOut');
    expect(StatusEffectHook.OnAttacking).toBe('OnAttacking');
    expect(StatusEffectHook.OnAfterAttacking).toBe('OnAfterAttacking');
    expect(StatusEffectHook.OnDefending).toBe('OnDefending');
    expect(StatusEffectHook.OnSkillUsed).toBe('OnSkillUsed');
    expect(StatusEffectHook.OnMoving).toBe('OnMoving');
  });

  it('should define correct status effect alignments', () => {
    expect(StatusEffectAlignment.Positive).toBe(0);
    expect(StatusEffectAlignment.Negative).toBe(1);
    expect(StatusEffectAlignment.Neutral).toBe(2);
    expect(StatusEffectAlignment.Permanent).toBe(3);
  });

  it('should get status effect from table', () => {
    const effect = getStatusEffect(StatusEffectType.BLOCKING_STANCE);
    expect(effect).toBeDefined();
    expect(effect?.name).toBe(StatusEffectType.BLOCKING_STANCE);
  });

  it('should return undefined for non-existent status effect', () => {
    const effect = getStatusEffect(StatusEffectType.DEFENDING);
    expect(effect).toBeUndefined();
  });

  it('should get results for status effect hook', () => {
    const mockEffect: StatusEffect = {
      name: StatusEffectType.BLOCKING_STANCE,
      description: 'Blocking Stance',
      applicationHooks: {
        [StatusEffectHook.OnBeingAttacked]: jest.fn().mockReturnValue(getStandardActionResult())
      },
      alignment: StatusEffectAlignment.Positive
    };

    jest.spyOn(mockCombatant, 'getStatusEffectsOfHook').mockReturnValue([mockEffect]);

    const results = getResultsForStatusEffectHook(
      mockCombatant, 
      StatusEffectHook.OnBeingAttacked,
      undefined,
      { amount: 10, type: DamageType.Slash }
    );

    expect(results).toHaveLength(1);
    expect(mockCombatant.getStatusEffectsOfHook).toHaveBeenCalledWith(StatusEffectHook.OnBeingAttacked);
  });
});


