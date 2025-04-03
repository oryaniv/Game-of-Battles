
// export class  implements SpecialMove {
//     name: string = "XXX";
//     triggerType = SpecialMoveTriggerType.Active;
//     cost: number = 5;
//     turnCost: number = 1;
//     range: SpecialMoveRange = {
//         type: SpecialMoveRangeType.Melee,
//         align: SpecialMoveAlignment.Enemy,
//         areaOfEffect: SpecialMoveAreaOfEffect.Single,
//         range: 1
//     };
//     damage: Damage = {
//         amount: 20,
//         type: DamageType.Slash
//     };
//     effect = (invoker: Combatant, target: Position, board: Board) => {
//         const result = CombatMaster.getInstance().executeAttack(invoker, target, board);
//         invoker.defend();
//         return result;
//     };
//     checkRequirements = undefined
//     description = ``
    
// }