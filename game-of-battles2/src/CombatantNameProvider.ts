
import { Combatant } from "./logic/Combatant";
import { CombatantType } from "./logic/Combatants/CombatantType";

const dragonNames = [
    "Smaug", "Fafnir", "Tiamat", "Bahamut", "Nidhogg",
    "Ryu", "Falkor", "Alduin", "Glaurung", "Draco"
];

const trollNames = [
    "Grendel", "Gryla", "Thrym", "Ulik", "Grom",
    "Grukk", "Thokk", "Surtr", "Hrungnir", "Geirrod"
];

const defenderNames = [
    "Hector", "Achilles", "Galahad", "Beowulf", "Sigurd",
    "Roland", "Thor", "Ajax", "Aragorn", "Ares"
];

const hunterNames = [
    "Artemis", "Orion", "Diana", "Nimrod", "Skadi",
    "Legolas", "Robin", "Atalanta", "Actaeon", "Mielikki"
];

const healerNames = [
    "Raphael", "Hygeia", "Eir", "Brigid", "Iaso",
    "Airmed", "Ix Chel", "Panacea", "Asclepius", "Imhotep"
];

const wizardNames = [
    "Merlin", "Gandalf", "Circe", "Medea", "Prospero",
    "Ged", "Pug", "Elminster", "Raistlin", "Rincewind"
];

const standardBearerNames = [
    "Joan", "Wallace", "Jeanne", "Arminius", "Boudica",
    "Saladin", "Jan Žižka", "Skanderbeg", "Leonidas", "Vercingetorix"
];

const witchNames = [
    "Baba Yaga", "Morgana", "Circe", "Hecate", "Elphaba",
    "Jadis", "Morrigan", "Serafina", "Granny", "Maleficent"
];

const foolNames = [
    "Puck", "Till", "Nasreddin", "Yorick", "Feste",
    "Cicero", "Rigoletto", "Touchstone", "Arlecchino", "Triboulet"
];

const pikemanNames = [
    "William", "Vlad", "Hector", "Lu Bu", "Zhang Fei",
    "Guan Yu", "Zhao Yun", "Ma Chao", "Leonidas", "Tell"
];

const vanguardNames = [
    "Conan", "Hannibal", "Drogo", "Genghis", "Attila",
    "Ragnar", "Rollo", "Scipio", "Boromir", "Bruenor"
];

const rogueNames = [
    "Robin", "Lupin", "Carmen", "Garrett", "Altaïr",
    "Ezio", "Corvo", "Bilbo", "Locke", "Gray"
];

const artificerNames = [
    "Daedalus", "Leonardo", "Imhotep", "Tesla", "Edison",
    "Ada", "Brunel", "Zhuge", "Archimedes", "Hephaestus"
];

const fistWeaverNames = [
    "Bruce", "Ip Man", "Paul.P", "Jin", "Liu.K",
    "Oyama", "Rama", "Chuck.N", "Jigoro", "Ryu"
];

export function getRandomNameForCombatantType(type: CombatantType): string {
    let names: string[];
    
    switch(type) {
        case CombatantType.Dragon:
            names = dragonNames;
            break;
        case CombatantType.Troll:
            names = trollNames;
            break;
        case CombatantType.Defender:
            names = defenderNames;
            break;
        case CombatantType.Hunter:
            names = hunterNames;
            break;
        case CombatantType.Healer:
            names = healerNames;
            break;
        case CombatantType.Wizard:
            names = wizardNames;
            break;
        case CombatantType.StandardBearer:
            names = standardBearerNames;
            break;
        case CombatantType.Witch:
            names = witchNames;
            break;
        case CombatantType.Fool:
            names = foolNames;
            break;
        case CombatantType.Pikeman:
            names = pikemanNames;
            break;
        case CombatantType.Vanguard:
            names = vanguardNames;
            break;
        case CombatantType.Rogue:
            names = rogueNames;
            break;
        case CombatantType.Artificer:
            names = artificerNames;
            break;
        case CombatantType.FistWeaver:
            names = fistWeaverNames;
            break;
        default:
            return "Unknown";
    }

    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

export function getNewCombatant(type: CombatantType, existingCombatantNames: string[]): string {
    const name = getRandomNameForCombatantType(type);
    if(existingCombatantNames.includes(name)) {
        return getNewCombatant(type, existingCombatantNames);
    }
    return name;
}

