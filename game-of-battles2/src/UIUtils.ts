import { DamageType } from "./logic/Damage";
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


  export const getStatusEffectIcon = (effectType: StatusEffectType): string => {
    return statusEffectIcons[effectType] || ""; // Default to "?" if not found
  };

  const statusEffectIcons: { [key in StatusEffectType]?: string } = {
    [StatusEffectType.BLOCKING_STANCE]: require("./assets/statusIcons/BLOCKING_STANCE.svg"),
    [StatusEffectType.ARCANE_CHANNELING]: require("./assets/statusIcons/ARCANE_CHANNELING.svg"),
    [StatusEffectType.FOCUS_AIM]: require("./assets/statusIcons/FOCUS_AIM.svg"),
    [StatusEffectType.FORTIFIED]: require("./assets/statusIcons/FORTIFIED.svg"),
    [StatusEffectType.IMMOBILIZED]: require("./assets/statusIcons/IMMOBILIZED.svg"),
    [StatusEffectType.FROZEN]: require("./assets/statusIcons/FROZEN.svg"),
    [StatusEffectType.POISONED]: require("./assets/statusIcons/POISONED.svg"),
    // [StatusEffectType.STRENGTH_BOOST]: require("./assets/statusIcons/STRENGTH_BOOST.svg"),
    // [StatusEffectType.MOBILITY_BOOST]: require("./assets/statusIcons/MOBILITY_BOOST.svg"),
    // [StatusEffectType.ENCOURAGED]: require("./assets/statusIcons/ENCOURAGED.svg"),
    // [StatusEffectType.RALLIED]: require("./assets/statusIcons/RALLIED.svg"),
    // [StatusEffectType.STRENGTH_DOWNGRADE]: require("./assets/statusIcons/STRENGTH_DOWNGRADE.svg"),
    // [StatusEffectType.LUCK_DOWNGRADE]: require("./assets/statusIcons/LUCK_DOWNGRADE.svg"),
  }

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
        return require('./assets/Crush.svg');
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