
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
    "Hector", "Yoav", "Lancelot", "Beowulf", "Richard",
    "Roland", "Mandor", "C.Rogers", "Boromir", "Stannis"
];

const hunterNames = [
    "Haldir", "Orion", "Tanis", "Drizzt", "Oliver",
    "Legolas", "Robin", "Meldinon", "Artemis", "Zevran"
];

const healerNames = [
    "Goldmoon", "Beatrice", "Galadriel", "Brigid", "Io",
    "Abigail", "Alina", "Panacea", "Phoenix", "Marriane"
];

const wizardNames = [
    "Merlin", "Gandalf", "Saruman", "Gale", "Irenicus",
    "Ged", "Feloron", "Elminster", "Raistlin", "Rincewind"
];

const standardBearerNames = [
    "Joan", "Wallace", "Ned", "Arminius", "Maxiums",
    "Saladin", "Aradas", "David", "Hannibal", "Caesar"
];

const witchNames = [
    "Ethel", "Lohse", "Circe", "Hecate", "Elphaba",
    "Jadis", "Morrigan", "Serafina", "Flemeth", "Jezebel"
];

const foolNames = [
    "Carmen", "Harley", "Joker", "Saul.G", "Zifnab",
    "Mystique", "Simkin", "Hisoka", "Pippin", "Arkana"
];

const pikemanNames = [
    "William", "Vlad", "Alexander", "Lu Bu", "Zhang Fei",
    "Chulainn", "Zhao", "Ma Chao", "Leonidas", "Setanta"
];

const vanguardNames = [
    "Conan", "Cloud", "Robert", "Genghis", "Guts",
    "Ragnar", "Aragorn", "Ajax", "Samson", "Caramon"
];

const rogueNames = [
    "Sebille", "Taki", "Katarina", "Mileena", "Antalis",
    "Orchid", "Sadira", "Natasha", "Aria", "Nina"
];

const artificerNames = [
    "Roark", "LD.Vinci", "Sokka", "Tesla", "Isaac",
    "Tony.S", "Q", "Midas", "W.White", "MacGyver"
];

const fistWeaverNames = [
    "Christie", "Elena", "Kira", "Ororo", "Kali",
    "Niraty", "Ambessa", "T'kari", "Yang", "Maya"
];

const twinBladesNames = [
    "Hansel", "Gretel"
];

const gorillaNames = [
    "Goro"
];

const militiaNames = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
     "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const oozeGolemNames = [
    "Goo", "Slime", "Blasto", "Gloop", "Gooey", "Brrb", "Blort", "Zorg", "Zbabab", "Nrrugh",
    "aooey", "booey", "cooey", "dooey", "eooey", "fooey", "gooey", "hooey", "iooey", "jooey"
];

const weaveEaterNames = [
    "??", "!?", 
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
        case CombatantType.TwinBlades:
            names = twinBladesNames;
            break;
        case CombatantType.Gorilla:
            names = gorillaNames;
            break;
        case CombatantType.Militia:
            names = militiaNames;
            break;
        case CombatantType.OozeGolem:
            names = oozeGolemNames;
            break;
        case CombatantType.WeaveEater:
            names = weaveEaterNames;
            break;
        default:
            return "Unknown";
    }

    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

export function getNewCombatantName(type: CombatantType, existingCombatantNames: string[]): string {
    const name = getRandomNameForCombatantType(type);
    if(existingCombatantNames.includes(name)) {
        return getNewCombatantName(type, existingCombatantNames);
    }
    return name;
}

