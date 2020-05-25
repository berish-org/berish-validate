import { ValidateMap, RuleArrayType } from './validateMap';
import { isValidateMap } from './isValidateMap';
import { isRuleArray } from '../rule/isRuleArray';
import { isRuleTuple } from '../rule/isRuleTuple';
import { isRuleMap } from '../rule/isRuleMap';

export function getRulesFromMap(map: ValidateMap<any>): [(string | symbol | number)[], RuleArrayType][] {
  const _getRules = (
    parentKeys: (string | symbol | number)[],
    currentKey: string | symbol | number,
    map: ValidateMap<any>,
  ): [(string | symbol | number)[], RuleArrayType][] => {
    if (!map || !isValidateMap(map)) return [];
    if (isRuleArray(map)) return [[[...parentKeys, currentKey], map]];
    if (isRuleTuple(map)) {
      const main: [(string | symbol | number)[], RuleArrayType] = [[...parentKeys, currentKey], map[0]];
      const child = _getRules(parentKeys, currentKey, map[1]);
      return [main, ...child];
    }
    if (isRuleMap(map)) {
      return Object.entries(map).reduce<[(string | symbol | number)[], RuleArrayType][]>(
        (out, [key, value]) => [...out, ..._getRules([...parentKeys, currentKey], key, value)],
        [],
      );
    }
    return [];
  };
  return (
    _getRules([], null, map)
      // Объединяем по одинаковым ключам
      .reduce<[(string | symbol | number)[], RuleArrayType][]>((out, tuple, index, array) => {
        // Избавляемся от пустых правил
        if (tuple[1].length <= 0) return out;
        // Ищем одинаковые tuple по идентичному пути
        const equalKeysTuples = array
          .filter(m => m !== tuple)
          .filter(m => m[0].length === tuple[0].length && m[0].every((key, i) => tuple[0][i] === key));
        // Если одинаковых нет, то отдаем в привычном порядке
        if (equalKeysTuples.length <= 0) return [...out, tuple];
        const rules = equalKeysTuples.reduce<RuleArrayType>((out, m) => [...out, ...m[1]], []);
        const data: [(string | symbol | number)[], RuleArrayType][] = [...out, [tuple[0], rules]];
        equalKeysTuples.filter(m => m !== tuple).forEach(m => (m[1] = []));
        return data;
      }, [])
      // Избавляемся от пустых правил
      // .filter(tuple => tuple[1].length > 0)
      // Избавляемся от null, если не в родительском элементе, а в детях
      .map<[(string | symbol | number)[], RuleArrayType]>(tuple =>
        tuple[0].length === 1 && tuple[0][0] === null
          ? [[], tuple[1]]
          : tuple[0].length > 1 && tuple[0][0] === null
          ? [tuple[0].filter((m, i) => i > 0), tuple[1]]
          : tuple,
      )
  );
}
