import {
  ValidateMap,
  RuleArrayType,
  RuleReferenceType,
  RuleReferenceTupleType,
  ValidateMapCompact,
} from './validateMap';
import { isValidateMap } from './isValidateMap';
import { isRuleArray } from '../rule/isRuleArray';
import { isRuleTuple } from '../rule/isRuleTuple';
import { isRuleMap } from '../rule/isRuleMap';
import { isRuleReference, isRuleReferenceTuple } from '../rule';
import { zipValidateMapCompact } from './zipValidateMapCompact';

export function getValidateMapCompact(globalMap: ValidateMap<any>): ValidateMapCompact {
  const _getRules = (
    parentKeys: (string | symbol | number)[],
    currentKey: string | symbol | number,
    map: ValidateMap<any>,
  ): ValidateMapCompact => {
    if (!map || !isValidateMap(map)) return [];
    if (isRuleArray(map)) return [[[...parentKeys, currentKey], map]];
    if (isRuleTuple(map)) {
      const [rules, mapChild] = map;
      return [[[...parentKeys, currentKey], rules], ..._getRules(parentKeys, currentKey, mapChild)];
    }
    if (isRuleMap(map)) {
      return Object.entries(map).reduce<
        [(string | symbol | number)[], RuleArrayType | RuleReferenceType | RuleReferenceTupleType][]
      >((out, [key, value]) => {
        if (isRuleReference(value)) {
          return [...out, [[...parentKeys, currentKey, key], value]];
        } else if (isRuleReferenceTuple(value)) {
          const [map, ref] = value;
          return [
            ...out,
            [
              [...parentKeys, currentKey, key],
              [map, ref],
            ],
          ];
        } else if (isValidateMap(value)) {
          return [...out, ..._getRules([...parentKeys, currentKey], key, value)];
        }
        return out;
      }, []);
    }
    return [];
  };
  return zipValidateMapCompact(_getRules([], null, globalMap));
}
