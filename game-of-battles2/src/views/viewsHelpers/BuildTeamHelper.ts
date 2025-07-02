import { getCombatantByType } from "@/boardSetups";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { Team } from "@/logic/Team";

export const premadeTeams = [
    [
        CombatantType.StandardBearer,
        CombatantType.Defender,
        CombatantType.Hunter,
        CombatantType.Wizard,
        CombatantType.Healer,
    ],
    [
        CombatantType.Vanguard,
        CombatantType.Pikeman,
        CombatantType.FistWeaver,
        CombatantType.Witch,
        CombatantType.Rogue,
    ],
    [
        CombatantType.Wizard,
        CombatantType.Artificer,
        CombatantType.Defender,
        CombatantType.Hunter,
        CombatantType.Fool,
    ],
    [
        CombatantType.StandardBearer,
        CombatantType.Defender,
        CombatantType.Vanguard,
        CombatantType.Pikeman,
        CombatantType.Wizard,
    ],
    [
        CombatantType.FistWeaver,
        CombatantType.Witch,
        CombatantType.Fool,
        CombatantType.Rogue,
        CombatantType.Healer,
    ]
]

export function combatantsWithDescriptions(team: Team) {
    return [
        {
            id: 1,
            name: CombatantType.StandardBearer.toString(),
            description: 'a noble warrior who is most effective at empowering his allies.',
            role: 'Support',
            easeOfUse: 'Moderate',
            pros: 'Great buffs, good defense and health, good synergy with most other combatant types',
            cons: 'Next to No offensive skills',
            combatantType: CombatantType.StandardBearer,
            combatantReference: getCombatantByType(CombatantType.StandardBearer, team)
        },
        {
            id: 2,
            name: CombatantType.Defender.toString(),
            description: 'A heavily armored warrior, perfect as a tank and a protector of others',
            role: 'Tank',
            easeOfUse: 'Easy',
            pros: 'High defense and health. Has great skills for protecting others',
            cons: 'Low damage and luck',
            combatantType: CombatantType.Defender,
            combatantReference: getCombatantByType(CombatantType.Defender, team)
        },
        {
            id: 3,
            name: CombatantType.Wizard.toString(),
            description: 'A powerful elemental damage dealer, both single and AOE',
            role: 'Magic DPS',
            easeOfUse: 'Moderate',
            pros: 'High damage, can deal deal several damage types, great utility',
            cons: 'Low health and weak against most physical attacks',
            combatantType: CombatantType.Wizard,
            combatantReference: getCombatantByType(CombatantType.Wizard, team)
        },
        {
            id: 4,
            name: CombatantType.Hunter.toString(),
            description: 'A Ranged fighter, able to deal great damage from afar.',
            role: 'Ranged DPS',
            easeOfUse: 'Easy',
            pros: 'High damage, good status affliction skills, longest range of all combatants',
            cons: 'Vulnerable in close range, most attacks require a clear path to the target',
            combatantType: CombatantType.Hunter,
            combatantReference: getCombatantByType(CombatantType.Hunter, team)
        },
        {
            id: 5,
            name: CombatantType.Fool.toString(),
            description: 'A jester whose unpredictable antics disorient foes. Provides unique crowd.',
            role: 'Crowd control',
            easeOfUse: 'Moderate/Hard',
            pros: 'Has many unique crowd control abilities, capable of stopping even an entire team',
            cons: 'No effective damage output',
            combatantType: CombatantType.Fool,
            combatantReference: getCombatantByType(CombatantType.Fool, team)
        },
        {
            id: 6,
            name: CombatantType.Artificer.toString(),
            description: 'An eccentric inventor able to deploy many useful machinations and aid his allies with mechanical upgrades.',
            role: 'Support / Field control',
            easeOfUse: 'Hard',
            pros: 'Can build and create mechanical allies, while backing them with buffs and elemental attacks',
            cons: 'Low damage, costly skills deplete stamina fast',
            combatantType: CombatantType.Artificer,
            combatantReference: getCombatantByType(CombatantType.Artificer, team)
        },
        {
            id: 7,
            name: CombatantType.Pikeman.toString(),
            description: 'An unyielding elite warrior capable of inflicting great damage and apply afflictions.',
            role: 'Melee DPS/Disruption',
            easeOfUse: 'Easy',
            pros: 'Double melee range, many offenisve techniques that disrupt enemy plans',
            cons: 'Weak to Crush damage',
            combatantType: CombatantType.Pikeman,
            combatantReference: getCombatantByType(CombatantType.Pikeman, team)
        },
        {
            id: 8,
            name: CombatantType.Healer.toString(),
            description: 'A divine healer protecting allies with graceful mercy. Crucial for team survival.',
            role: 'Support/Healing',
            easeOfUse: 'Easy/Moderate',
            pros: 'Strong healing abilities, useful support skills',
            cons: 'Low initiative, Offensive ability is very limited',
            combatantType: CombatantType.Healer,
            combatantReference: getCombatantByType(CombatantType.Healer, team)
        },
        {
            id: 9,
            name: CombatantType.FistWeaver.toString(),
            description: 'A martial artist weaving magic into her strikes. Fast and versatile.',
            role: 'Melee DPS',
            easeOfUse: 'Moderate',
            pros: 'Fast movement, high agility and luck, useful self buff skills',
            cons: 'Offensive skills require careful planning to be most effective',
            combatantType: CombatantType.FistWeaver,
            combatantReference: getCombatantByType(CombatantType.FistWeaver, team)
        },
        {
            id: 10,
            name: CombatantType.Witch.toString(),
            description: 'a dark conjurer wielding forbidden elemental power. Devastating long-range spells.',
            role: 'Debuffs',
            easeOfUse: 'Hard',
            pros: 'A myriad of debuff skills that further enhance her attacks',
            cons: 'Very dependent on hers and her team\'s debuff game',
            combatantType: CombatantType.Witch,
            combatantReference: getCombatantByType(CombatantType.Witch, team)
        },
        {
            id: 11,
            name: CombatantType.Vanguard.toString(),
            description: 'A savage warrior who charges into enemy lines, dealing damage left and right',
            role: 'Melee DPS',
            easeOfUse: 'Easy',
            pros: 'Ridiculously high damage, very fast movement and high health',
            cons: 'Low defence, low agility, reckless use leads to a quick death',
            combatantType: CombatantType.Vanguard,
            combatantReference: getCombatantByType(CombatantType.Vanguard, team)
        },
        {
            id: 12,
            name: CombatantType.Rogue.toString(),
            description: 'A sneaky killer who\'s at her best hunting her prey from the shadows.',
            role: 'Single target DPS/Stealth',
            easeOfUse: 'Hard',
            pros: 'Deadly single target damage, cloaking ability, damage multipliers',
            cons: 'Vulnerable, no AOE attacks',
            combatantType: CombatantType.Rogue,
            combatantReference: getCombatantByType(CombatantType.Rogue, team)
        }
    // {id: 2, name: CombatantType.Wizard.toString(), description: 'a powerful elemental damage dealer. Valuable, yet very fragile', role: 'Magic DPS', pros: 'High damage, can deal great damage from afar', cons: 'Very fragile, can be easily killed', combatantType: CombatantType.Wizard, combatantReference: getCombatantByType(CombatantType.Wizard, team) },
    // {id: 3, name: CombatantType.Hunter.toString(), description: 'a Ranged fighter, able to deal great damage from afar.', role: 'Ranged DPS', pros: 'High damage, can deal great damage from afar', cons: 'Very fragile, can be easily killed', combatantType: CombatantType.Hunter, combatantReference: getCombatantByType(CombatantType.Hunter, team) },
    // {id: 4, name: CombatantType.Fool.toString(), description: 'a jester whose unpredictable antics disorient foes. Provides unique crowd control and debuffs.', role: 'Support', pros: 'Can provide unique crowd control and debuffs', cons: 'Low damage, can be easily killed', combatantType: CombatantType.Fool, combatantReference: getCombatantByType(CombatantType.Fool, team) },
    // {id: 5, name: CombatantType.Artificer.toString(), description: 'an eccentric inventor unleashing surprising contraptions. Excels in setting traps and area denial.', role: 'Support', pros: 'Can provide unique crowd control and debuffs', cons: 'Low damage, can be easily killed', combatantType: CombatantType.Artificer, combatantReference: getCombatantByType(CombatantType.Artificer, team) },
    // {id: 6, name: CombatantType.Pikeman.toString(), description: 'a disciplined guard wielding a formidable pike. Excellent against charging enemies.', role: 'Tank', pros: 'High defense, can protect others', cons: 'Low damage, can be easily killed', combatantType: CombatantType.Pikeman, combatantReference: getCombatantByType(CombatantType.Pikeman, team) },
    // {id: 7, name: CombatantType.Healer.toString(), description: 'a divine healer protecting allies with sacred light. Crucial for team sustain.', role: 'Support', pros: 'Can provide unique crowd control and debuffs', cons: 'Low damage, can be easily killed', combatantType: CombatantType.Healer, combatantReference: getCombatantByType(CombatantType.Healer, team) },
    // {id: 8, name: CombatantType.FistWeaver.toString(), description: 'a martial artist weaving magic into her strikes. Versatile combatant with support skills.', role: 'Support', pros: 'Can provide unique crowd control and debuffs', cons: 'Low damage, can be easily killed', combatantType: CombatantType.FistWeaver, combatantReference: getCombatantByType(CombatantType.FistWeaver, team) },
    // {id: 9, name: CombatantType.Witch.toString(), description: 'a dark conjurer wielding forbidden elemental power. Devastating long-range spells.', role: 'Magic DPS', pros: 'High damage, can deal great damage from afar', cons: 'Very fragile, can be easily killed', combatantType: CombatantType.Witch, combatantReference: getCombatantByType(CombatantType.Witch, team) },
    // {id: 10, name: CombatantType.Vanguard.toString() , description: 'a disciplined guard wielding a formidable pike. Excellent against charging enemies.', role: 'Tank', pros: 'High defense, can protect others', cons: 'Low damage, can be easily killed', combatantType: CombatantType.Vanguard, combatantReference: getCombatantByType(CombatantType.Vanguard, team) },
    // {id: 11, name: CombatantType.Rogue.toString() , description: 'a stealthy scout striking from the shadows. Master of reconnaissance and precision shots.', role: 'Ranged DPS', pros: 'High damage, can deal great damage from afar', cons: 'Very fragile, can be easily killed', combatantType: CombatantType.Rogue, combatantReference: getCombatantByType(CombatantType.Rogue, team) },
    // {id: 12, name: CombatantType.StandardBearer.toString(), description: 'a disciplined guard wielding a formidable pike. Excellent against charging enemies.', role: 'Tank', pros: 'High defense, can protect others', cons: 'Low damage, can be easily killed', combatantType: CombatantType.StandardBearer, combatantReference: getCombatantByType(CombatantType.StandardBearer, team) },
 ]; 
}