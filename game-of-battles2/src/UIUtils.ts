import { DamageReaction, DamageType } from "./logic/Damage";
import { getStatusEffect, StatusEffect, StatusEffectApplication, StatusEffectType } from "./logic/StatusEffect";

export const getActionDescription = (action: string) => {
    switch (action) {
        case 'move':
            return 'Move to a new position';
        case 'attack':
            return 'Basic attack against an enemy';
        case 'skill':
            return "Use a special skill";
        case 'coop':
            return "Use a co-op skill with your allies";
        case 'defend':
            return 'Defend from incoming attacks';
        case 'skip':
            return 'Skip current combatant\'s turn';
        case 'undo':
            return 'Undo your last movement';
        case 'cancel':
            return 'Cancel current choice';
        case 'examine':
            return 'Examine a combatant';
        default:
            return '';
    }
}

export const getStatusEffectDescription = (statusEffect: StatusEffectApplication) => {
    return getStatusEffect(statusEffect.name)?.description || '';
}

export const getLetterForStatusEffect = (effectType: StatusEffectType): string => {
    return statusEffectLetters[effectType] || "?"; // Default to "?" if not found
};

export const getShortDamageReactionText = (reaction: DamageReaction): string => {
    switch (reaction) {
        case DamageReaction.NONE:
            return "None";
        case DamageReaction.WEAKNESS:
            return "Weak";
        case DamageReaction.RESISTANCE:
            return "Resist";
        case DamageReaction.IMMUNITY:
            return "Void";
    }
}


const statusEffectLetters: { [key in StatusEffectType]?: string } = {
    [StatusEffectType.BLOCKING_STANCE]: "B",
    [StatusEffectType.ARCANE_CHANNELING]: "H",
    [StatusEffectType.FOCUS_AIM]: "A",
    [StatusEffectType.IMMOBILIZED]: "Z",
    [StatusEffectType.FORTIFIED]: "O",
    [StatusEffectType.FROZEN]: "F",
    [StatusEffectType.REGENERATING]: "R",
    [StatusEffectType.STRENGTH_BOOST]: "S",
    [StatusEffectType.MOBILITY_BOOST]: "M",
    [StatusEffectType.ENCOURAGED]: "E",
    [StatusEffectType.RALLIED]: "L",
    [StatusEffectType.STRENGTH_DOWNGRADE]: "SD",
    [StatusEffectType.LUCK_DOWNGRADE]: "LD",
    [StatusEffectType.SLOW]: "SW",
    [StatusEffectType.POISONED]: "P",
    [StatusEffectType.BLEEDING]: "BL",
    [StatusEffectType.TAUNTED]: "TA",
    [StatusEffectType.STUPEFIED]: "ST",
    [StatusEffectType.NAUSEATED]: "NA",
    [StatusEffectType.MESMERIZED]: "ME",
    [StatusEffectType.MESMERIZING]: "ME",
    [StatusEffectType.STAGGERED]: "SG",
    [StatusEffectType.DEFENSE_DOWNGRADE]: "DD",
    [StatusEffectType.CLOAKED]: "CL",
    [StatusEffectType.MARKED_FOR_PAIN]: "MR1",
    [StatusEffectType.MARKED_FOR_EXECUTION]: "MR2",
    [StatusEffectType.MARKED_FOR_OBLIVION]: "MR3",
    [StatusEffectType.FULL_METAL_JACKET]: "FMJ",
    [StatusEffectType.PANICKED]: "PN",
    [StatusEffectType.CHARMED]: "CHM",
    [StatusEffectType.CIRCUS_DIABOLIQUE]: "CQ",
    [StatusEffectType.NIGHTMARE_LOCKED]: "NQ",
    [StatusEffectType.FORBIDDEN_AFFLICTION]: "FA",
    [StatusEffectType.DIVINE_RETRIBUTION]: "DR",
    [StatusEffectType.SANCTUARY]: "SC",
    [StatusEffectType.IDAI_NO_HADOU]: "INH",
    [StatusEffectType.PLAGUED]: "PLG",
    [StatusEffectType.BURNING]: "BRN",
    [StatusEffectType.FRENZY]: "FZ",
    [StatusEffectType.ARCANE_OVERCHARGE]: "AO",
    [StatusEffectType.ARCANE_BARRIER]: "AB",
    [StatusEffectType.ARCANE_CONDUIT]: "ACO",
    [StatusEffectType.GUARDIAN_PROTECTED]: "GP",
    [StatusEffectType.GUARDIAN]: "G",
    [StatusEffectType.SHIELD_WALL_PROTECTED]: "SWP",
    [StatusEffectType.SHIELD_WALL]: "SW",
    [StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED]: "ASP",
    [StatusEffectType.ARCANE_SHIELD_WALL]: "ASW",
    [StatusEffectType.DIAMOND_HOOKED]: "DH",
    [StatusEffectType.DIAMOND_HOOKED_HOLDING]: "DHH",
    [StatusEffectType.INGENIOUS_UPGRADE]: "IU",
    [StatusEffectType.SLEEPING]: "SL",
    // ... add mappings for other status effect types
  };

  export const getStatUiName = (statName: string) => {
    switch (statName) {
      case 'hp':
        return 'HP';
      case 'attackPower':
        return 'Attack';
      case 'defensePower':
        return 'Defense';
      case 'agility':
        return 'Agility';
      case 'stamina':
        return 'Stamina';
      case 'movementSpeed':
        return 'Movement';
      case 'initiative':
        return 'Initiative';
      case 'range':
        return 'Range';
      case 'luck':
        return 'Luck';
    }
  }

  export const getStatusScale = (statName: string) => {
    switch (statName) {
      case 'hp':
        return 150;
      case 'attackPower':
        return 120;
      case 'defensePower':
        return 120;
      case 'agility':
        return 20;
      case 'stamina':
        return 80;
      case 'movementSpeed':
        return 8;
      case 'initiative':
        return 10;
      case 'range':
        return 10;
      case 'luck':
        return 20;
    }
  }

  export const getDamageSvg = (type: DamageType): string => {
    switch (type) {
      case DamageType.Slash:
        return require('./assets/Slash.svg');
      case DamageType.Crush:
        return require('./assets/crush.png');
      case DamageType.Pierce:
        return require('./assets/Pierce.svg');
      case DamageType.Fire:
        return require('./assets/Flame.svg');
      case DamageType.Ice:
        return require('./assets/Ice.svg');
      case DamageType.Lightning:
        return require('./assets/Thunder.svg');
      case DamageType.Blight:
        return require('./assets/Skull.svg');
      case DamageType.Holy:
        return require('./assets/Sun.svg');
      case DamageType.Dark:
        return require('./assets/Pentagram.svg');
      case DamageType.Healing:
        return require('./assets/Healing.svg');
      case DamageType.Unstoppable:
        return require('./assets/Unstoppable.svg');
      // ... other cases
      default:
        return require('./assets/Empty.svg'); // Or a default SVG path
    }
};

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function statusNameToText(statusName: StatusEffectType): string {
  switch (statusName) {
    case 0:
      return "Blocking Stance";
    case 1:
      return "Arcane Channeling";
    case 2:
      return "Focus Aim";
    case 3:
      return "Fortified";
    case 4:
      return "Immobilized";
    case 5:
      return "Regenerating";
    case 6:
      return "Frozen";
    case 7:
      return "Poisoned";
    case 8:
      return "Strength Boost";
    case 9:
      return "Mobility Boost";
    case 10:
      return "Encouraged";
    case 11:
      return "Rallied";
    case 12:
      return "Strength Downgrade";
    case 13:
      return "Inspiring Killer";
    case 14:
      return "Luck Downgrade";
    case 15:
      return "Slow";
    case 16:
      return "Energy Absorb";
    case 17:
      return "Bleeding";
    case 18:
      return "Taunted";
    case 19:
      return "Fool's Luck";
    case 20:
      return "Mesmerizing";
    case 21:
      return "Mesmerized";
    case 22:
      return "Nauseated";
    case 23:
      return "Stupefied";
    case 24:
      return "Staggered";
    case 25:
      return "First Strike";
    case 26:
      return "Defense Downgrade";
    case 27:
      return "Idai No Hadou";
    case 28:
      return "Riposte";
    case 29:
      return "Struck First";
    case 30:
      return "Marching Defense";
    case 31:
      return "Cloaked";
    case 32:
      return "Sadist";
    case 33:
      return "Marked for Pain";
    case 34:
      return "Marked for Execution";
    case 35:
      return "Marked for Oblivion";
    case 36:
      return "Mark detonate";
    case 37:
      return "Full Metal Jacket";
    case 38:
      return "Going Off";
    case 39:
      return "Defending";
    case 40:
      return "Divine Miracle";
    case 41:  
      return "Life Drinker";
    case 42:
      return "Panicked";
    case 43:
      return "Diamond Supremacy";
    case 44:  
      return "Charmed";
    case 45:
      return "Circus Diabolique";
    case 46:
      return "Nightmare Locked";
    case 47:  
      return "Last Stand Used";
    case 48:
      return "Shield Wall";
    case 49:
      return "Shield Wall Protected";
    case 50:  
      return "Arcane Shield Wall";
    case 51:
      return "Arcane Shield Wall Protected";
    case 52:
      return "Frenzy";
    case 53:
      return "Forbidden Affliction";
    case 54:  
      return "Sanctuary";
    case 55:
      return "Divine Retribution";
    case 56:
      return "Decoy";
    case 57:
      return "Surprise Boom";
    case 58:
      return "Plagued";
    case 59:
      return "Burning";
    case 60:
      return "Arcane Overcharge";
    case 61:
      return "Arcane Barrier";
    case 62:
      return "Arcane Conduit";
    case 63:
      return "Guardian";
    case 64:
      return "Guardian Protected";
    case 65:
      return "Diamond Hooked";
    case 66:
      return "Diamond Hooked Holding";
    case 67:
      return "Troll Regeneration";
    case 68:
      return "Ingenious Upgrade";
    case 69:
      return "Reload";
    case 70:
      return "Sleeping";
    case 71:
      return "Physical Damage Reproduction";
    case 72:
      return "Weave Eating";
    default:
      return "";
    }
}

export function requireStatusEffectSvg(effectType: StatusEffectType): string {
  switch (effectType) {
    case StatusEffectType.ARCANE_CHANNELING:
      return require('./assets/statusIcons/ARCANE_CHANNELING.svg');
    case StatusEffectType.FOCUS_AIM:
      return require('./assets/statusIcons/FOCUS_AIM.svg');
    case StatusEffectType.BLOCKING_STANCE:
      return require('./assets/statusIcons/BLOCKING_STANCE.svg');
    case StatusEffectType.FORTIFIED:
      return require('./assets/statusIcons/FORTIFIED.svg');
    case StatusEffectType.REGENERATING:
      return require('./assets/statusIcons/REGENERATING.svg');
    case StatusEffectType.IMMOBILIZED:
      return require('./assets/statusIcons/IMMOBILIZED.svg');
    case StatusEffectType.FROZEN:
      return require('./assets/statusIcons/FROZEN.svg');
    case StatusEffectType.POISONED:
      return require('./assets/statusIcons/POISONED.svg');
    case StatusEffectType.MOBILITY_BOOST:
      return require('./assets/statusIcons/MOBILITY_BOOST.svg');
    case StatusEffectType.STRENGTH_BOOST:
      return require('./assets/statusIcons/STRENGTH_BOOST.svg');
    case StatusEffectType.ENCOURAGED:
      return require('./assets/statusIcons/ENCOURAGED.svg');
    case StatusEffectType.RALLIED:
      return require('./assets/statusIcons/RALLIED.svg');
    case StatusEffectType.STRENGTH_DOWNGRADE:
      return require('./assets/statusIcons/STRENGTH_DOWNGRADE.svg');
    case StatusEffectType.BLEEDING:
      return require('./assets/statusIcons/BLEEDING.svg');
    case StatusEffectType.LUCK_DOWNGRADE:
      return require('./assets/statusIcons/LUCK_DOWNGRADE.svg');
    case StatusEffectType.SLOW:
      return require('./assets/statusIcons/SLOW.svg');
    case StatusEffectType.INSPIRING_KILLER:
      return require('./assets/statusIcons/INSPIRING_KILLER.svg');
    case StatusEffectType.FOOLS_LUCK:
      return require('./assets/statusIcons/FOOLS_LUCK.svg');
    case StatusEffectType.TAUNTED:
      return require('./assets/statusIcons/TAUNTED.svg');
    case StatusEffectType.MESMERIZING:
      return require('./assets/statusIcons/MESMERIZING.svg');
    case StatusEffectType.MESMERIZED:
      return require('./assets/statusIcons/MESMERIZED.svg');
    case StatusEffectType.NAUSEATED:
      return require('./assets/statusIcons/NAUSEATED.svg');
    case StatusEffectType.STUPEFIED:
      return require('./assets/statusIcons/STUPEFIED.svg');
    case StatusEffectType.STAGGERED:
      return require('./assets/statusIcons/STAGGERED.svg');
    case StatusEffectType.FIRST_STRIKE:
      return require('./assets/statusIcons/FIRST_STRIKE.svg');
    case StatusEffectType.DEFENSE_DOWNGRADE:
      return require('./assets/statusIcons/DEFENSE_DOWNGRADE.svg');
    case StatusEffectType.IDAI_NO_HADOU:
      return require('./assets/statusIcons/IDAI_NO_HADOU.svg');
    case StatusEffectType.CLOAKED:
      return require('./assets/statusIcons/CLOAKED.svg');
    case StatusEffectType.FULL_METAL_JACKET:
      return require('./assets/statusIcons/FULL_METAL_JACKET.svg');
    case StatusEffectType.DIVINE_MIRACLE:
      return require('./assets/statusIcons/DIVINE_MIRACLE.svg');
    case StatusEffectType.PANICKED:
      return require('./assets/statusIcons/PANIC.svg');
    case StatusEffectType.PLAGUED:
      return require('./assets/statusIcons/PLAGUED.svg');
    case StatusEffectType.BURNING:
      return require('./assets/statusIcons/BURNING.svg');
    case StatusEffectType.LIFE_DRINKER:
      return require('./assets/statusIcons/LIFE_DRINKER.svg');
    case StatusEffectType.CHARMED:
      return require('./assets/statusIcons/CHARMED.svg');
    case StatusEffectType.ARCANE_OVERCHARGE:
      return require('./assets/statusIcons/ARCANE_OVERCHARGE.svg');
    case StatusEffectType.ARCANE_BARRIER:
      return require('./assets/statusIcons/ARCANE_BARRIER.svg');
    case StatusEffectType.ARCANE_CONDUIT:
      return require('./assets/statusIcons/ARCANE_CONDUIT.svg');
    case StatusEffectType.DIVINE_RETRIBUTION:
      return require('./assets/statusIcons/DIVINE_RETRIBUTION.svg');
    case StatusEffectType.SANCTUARY:
      return require('./assets/statusIcons/SANCTUARY.svg');
    case StatusEffectType.SLEEPING:
      return require('./assets/statusIcons/SLEEPING.svg');
    case StatusEffectType.RELOAD:
      return require('./assets/statusIcons/RELOAD.svg');
    case StatusEffectType.INGENIOUS_UPGRADE:
      return require('./assets/statusIcons/INGENIOUS_UPGRADE.svg');
    case StatusEffectType.CIRCUS_DIABOLIQUE:
      return require('./assets/statusIcons/CIRCUS_DIABOLIQUE.svg');
    case StatusEffectType.NIGHTMARE_LOCKED:
      return require('./assets/statusIcons/NIGHTMARE_LOCKED.svg');
    case StatusEffectType.DIAMOND_HOOKED:
      return require('./assets/statusIcons/DIAMOND_HOOKED.svg');
    case StatusEffectType.DIAMOND_HOOKED_HOLDING:
      return require('./assets/statusIcons/DIAMOND_HOOKED_HOLDING.svg');
    case StatusEffectType.TROLL_REGENERATION:
      return require('./assets/CombatantModels/Troll.png');
    case StatusEffectType.GOING_OFF:
      return require('./assets/statusIcons/GOING_OFF.svg');
    case StatusEffectType.SURPRISE_BOOM:
      return require('./assets/statusIcons/SURPRISE_BOOM.svg');
    case StatusEffectType.RIPOSTE:
      return require('./assets/statusIcons/RIPOSTE.svg');
    case StatusEffectType.DECOY:
      return require('./assets/statusIcons/DECOY.svg');
    case StatusEffectType.MARKED_FOR_PAIN:
      return require('./assets/statusIcons/MARKED_FOR_PAIN.svg');
    case StatusEffectType.MARKED_FOR_EXECUTION:
      return require('./assets/statusIcons/MARKED_FOR_EXECUTION.svg');
    case StatusEffectType.MARKED_FOR_OBLIVION:
      return require('./assets/statusIcons/MARKED_FOR_OBLIVION.svg');
    case StatusEffectType.DEFENDING:
      return require('./assets/statusIcons/DEFENDING.svg');
    case StatusEffectType.FORBIDDEN_AFFLICTION:
      return require('./assets/statusIcons/FORBIDDEN_AFFLICTION.svg');
    case StatusEffectType.MARCHING_DEFENSE:
      return require('./assets/statusIcons/MARCHING_DEFENSE.svg');
    case StatusEffectType.GUARDIAN:
      return require('./assets/statusIcons/GUARDIAN.svg');
    case StatusEffectType.GUARDIAN_PROTECTED:
      return require('./assets/statusIcons/GUARDIAN_PROTECTED.svg');
    case StatusEffectType.SHIELD_WALL:
      return require('./assets/statusIcons/SHIELD_WALL.svg');
    case StatusEffectType.SHIELD_WALL_PROTECTED:
      return require('./assets/statusIcons/SHIELD_WALL_PROTECTED.svg');
    case StatusEffectType.SADIST:
      return require('./assets/statusIcons/SADIST.svg');
    case StatusEffectType.ARCANE_SHIELD_WALL:
      return require('./assets/statusIcons/ARCANE_SHIELD_WALL.svg');
    case StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED:
      return require('./assets/statusIcons/ARCANE_SHIELD_WALL_PROTECTED.svg');
    case StatusEffectType.PHYS_DUPLICATE:
      return require('./assets/CombatantModels/OozeGolem.png');
    case StatusEffectType.WEAVE_EATING:
      return require('./assets/CombatantModels/WeaveEater.png');
    default:
      return '';
  }
}


export function getSkillEffectIcon(skillName: string) {
  switch(skillName) {
    case 'Flame':
    case 'Fireball':
    case 'Flame Cannon':
    case 'Dragon\'s Breath':
    case 'Dragon Fire Ball':
    case 'Flame Thrower':
    case 'Brimstone Rain':
      return require('./assets/statusIcons/BURNING.svg');
    case 'Icicle':
    case 'Ice Cannon':
    case 'Frozen Burst':
    case 'Cold Edge':
      return require('./assets/statusIcons/FROZEN.svg');
    case 'Lightning Bolt':
    case 'Thunder Dome':
    case 'Chain Lightning':
    case "Sky Sovereign's Wrath":
    case 'Shocking Gauntlet':
    case 'Lightning Kicks':
      return require('./assets/statusIcons/LIGHTNING.svg');
    case 'Rampage':
    case 'Defensive Strike':
    case 'Feral Swing':
    case 'Unstoppable Charge':
    case 'Sneak Attack':
    case 'Claws':
    case 'Twin Spin':
    case 'Karithra\'s Boon':
    case 'Whirlwind Attack':
      return require('./assets/statusIcons/SLASH.svg');
    case 'Wind Run Assault"':
    case 'Titanic Fist':
    case 'Troll Kick':
    case 'Crush':
    case 'Mind Lash':
    case 'Haft Strike':
    case 'Sharpenal Shell':
    case 'Shield Bash':
    case 'Strike as One':
      return require('./assets/Crush2.png');
    case 'Pin Down':
    case 'Ricochet':
    case 'Skewer':
    case 'Gaping Stab':
    case 'Horns':
    case 'Arc Shot':
    case 'Scorpion Bolt':
    case 'Rain of Arrows':
    case 'Harpoon':
    case 'Snipe Shot':
      return require('./assets/statusIcons/PIERCE.svg');
    case 'Toxic Arrow':
    case 'Viper\'s Kiss':
    case 'Venomous Spit':
    case 'Goo Spit':
    case 'Plague Arrow':
      return require('./assets/statusIcons/POISONED.svg');
    case 'Sacred Flame':
    case 'Angelic Touch':
    case 'Queen\'s Wrath, Mother\'s Love':
    case 'Moon Beam':
      return require('./assets/statusIcons/HOLY.svg');
    case 'Grasp of Zirash':
    case 'Hunger of Zirash':
    case 'Forbidden Art':
      return require('./assets/statusIcons/DARK.svg');
    case 'Heal':
    case 'Regenerate':
    case 'Purify':
    case 'Rain of Grace':
    case 'Reinforce Construct':
    case 'Meditate':
    case 'Blood Rite':
      return require('./assets/statusIcons/REGENERATING.svg');
    case 'Arcane Channeling':
      return require('./assets/statusIcons/ARCANE_CHANNELING.svg');
    case 'Shield Breaker': 
      return require('./assets/statusIcons/DEFENSE_DOWNGRADE.svg');
    case 'Focus Aim':
      return require('./assets/statusIcons/FOCUS_AIM.svg');
    case 'Full Metal Jacket':
      return require('./assets/statusIcons/FULL_METAL_JACKET.svg');
    case 'Divine Retribution':
      return require('./assets/statusIcons/DIVINE_RETRIBUTION.svg');
    case 'Sanctuary':
      return require('./assets/statusIcons/SANCTUARY.svg');
    case 'Arcane Conduit':
      return require('./assets/statusIcons/ARCANE_CONDUIT.svg');
    case 'Guardian':
      return require('./assets/statusIcons/GUARDIAN.svg');
    case 'Shield Wall':
      return require('./assets/statusIcons/SHIELD_WALL.svg');
    case 'Arcane Shield Wall':
      return require('./assets/statusIcons/ARCANE_SHIELD_WALL.svg');
    case 'Arcane Overcharge':
      return require('./assets/statusIcons/ARCANE_OVERCHARGE.svg');
    case 'Arcane Barrier':
      return require('./assets/statusIcons/ARCANE_BARRIER.svg');
    case 'Deploy Ballista Turret':
      return require('./assets/Ballista.svg');
    case 'Build Walls':
      return require('./assets/Wall.svg');
    case 'Deploy Boom Gremlin':
      return require('./assets/Bomb.svg');
    case 'Build Death Tower':
      return require('./assets/Babel.svg');
    case 'Ingenious Upgrade':
      return require('./assets/statusIcons/INGENIOUS_UPGRADE.svg');
    case 'Idai no Hadou':
      return require('./assets/statusIcons/IDAI_NO_HADOU.svg');
    case 'Rally to the Banner':
      return require('./assets/statusIcons/RALLIED.svg');
    case 'Call of Strength':
      return require('./assets/statusIcons/STRENGTH_BOOST.svg');
    case 'Call of Vigor':
      return require('./assets/statusIcons/MOBILITY_BOOST.svg');
    case 'Encourage':
      return require('./assets/statusIcons/ENCOURAGED.svg');
    case 'Shadow Step':
      return require('./assets/statusIcons/CLOAKED.svg');
    case 'Assassin\'s Mark':
      return require('./assets/statusIcons/MARKED_FOR_EXECUTION.svg');
    case 'Sleeping Dart':
      return require('./assets/statusIcons/SLEEPING.svg');
    case 'Frenzy':
      return require('./assets/statusIcons/FRENZY.svg');
    case 'Hell Scream':
      return require('./assets/statusIcons/PANIC.svg');
    case 'Yo Mama!':
      return require('./assets/statusIcons/TAUNTED.svg');
    case 'Stupidest Crap Ever':
    case 'Stand Up Comedy Gone Wrong':
      return require('./assets/statusIcons/STUPEFIED.svg');
    case 'Smellitt':
      return require('./assets/statusIcons/NAUSEATED.svg');
    case 'Lookey Here':
      return require('./assets/statusIcons/MESMERIZING.svg');
    case 'Circus Diabolique':
      return require('./assets/statusIcons/CIRCUS_DIABOLIQUE.svg');
    case 'Blow a Kiss':
      return require('./assets/statusIcons/CHARMED.svg');
    case 'Nasty Nasty Dolly':
      return require('./assets/statusIcons/FOOLS_LUCK.svg');
    default:
      return '';
  }

}
