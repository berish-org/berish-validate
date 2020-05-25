export interface IRuleFlag {
  unique: symbol;
  isRuleFlag: true;
  description?: string;
}

export function createRuleFlag(description?: string): IRuleFlag {
  return Object.freeze({ unique: Symbol(description), isRuleFlag: true, description });
}
