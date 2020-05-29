import LINQ from '@berish/linq';
import {
  ValidateMapCompact,
  RuleArrayType,
  RuleReferenceType,
  RuleReferenceTupleType,
  ValidateMapCompactItem,
} from './validateMap';
import { isRuleReference, isRuleReferenceTuple, isRuleArray } from '../rule';

export function zipValidateMapCompact(validateMapCompact: ValidateMapCompact): ValidateMapCompact {
  const groupByKeys: [
    (string | number | symbol)[],
    (RuleArrayType | RuleReferenceType | RuleReferenceTupleType)[],
  ][] = LINQ.from(validateMapCompact)
    .groupBy(
      m => m[0],
      (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((m, i) => b[i] === m),
    )
    .select<[(string | number | symbol)[], (RuleArrayType | RuleReferenceType | RuleReferenceTupleType)[]]>(m => [
      m[0],
      m[1].select(k => k[1]).toArray(),
    ])
    .toArray();
  return groupByKeys.map<ValidateMapCompactItem>(m => {
    const keys = m[0];
    const values = m[1];
    const rules: RuleArrayType = [];
    let ref: RuleReferenceType = null;

    // Объединяем по одинаковым ключамы
    for (const value of values) {
      if (isRuleReference(value)) ref = value;
      else if (isRuleReferenceTuple(value)) {
        rules.push(...value[0]);
        ref = value[1];
      } else if (isRuleArray(value)) rules.push(...value);
    }
    // Избавляемся от null в ключах как родительский элемент
    const keysWithoutNull =
      keys.length === 1 && keys[0] === null
        ? []
        : keys.length > 1 && keys[0] === null
        ? keys.filter((m, i) => i > 0)
        : keys;
    if (!ref) return [keysWithoutNull, rules];
    if (rules.length <= 0) return [keysWithoutNull, ref];
    return [keysWithoutNull, [rules, ref]];
  });
}

// return validateMapCompact.reduce<ValidateMapCompact>(
//     (out, tuple, index, array) => {
//       const keys = tuple[0];
//       const value = tuple[1];
//       // Если это референс, то отдаем как есть
//       if (isRuleReference(value)) return [...out, [keys, value]];
//       // Если это рефернсе tuple, то отдаем как есть
//       if (isRuleReferenceTuple(value)) {
//         const [rules, ref] = value;
//         // Избавляемся от рефа-tuple без правил
//         if (rules.length <= 0) return [...out, [keys, ref]];
//         return [...out, [keys, [rules, ref]]];
//       }
//       // Далее логика обработки правил

//       // Избавляемся от пустых правил
//       if (value.length <= 0) return out;
//       // Ищем одинаковые tuple по идентичному пути
//       const equalKeysTuples = array
//         .filter(m => m !== tuple)
//         .filter(m => m[0].length === keys.length && m[0].every((key, i) => keys[i] === key)) as [
//         (string | symbol | number)[],
//         RuleArrayType,
//       ][];
//       // Если одинаковых нет, то отдаем в привычном порядке
//       if (equalKeysTuples.length <= 0) return [...out, [keys, refOrRules]];

//       const rules = equalKeysTuples.reduce<RuleArrayType>((out, m) => [...out, ...m[1]], []);
//       const data: [(string | symbol | number)[], RuleArrayType | RuleReferenceType][] = [...out, [tuple[0], rules]];
//       equalKeysTuples.filter(m => m !== tuple).forEach(m => (m[1] = []));
//       return data;
//     },
//     [],
//   )
//   // Избавляемся от пустых правил
//   // .filter(tuple => tuple[1].length > 0)
//   // Избавляемся от null, если не в родительском элементе, а в детях
//   .map<ValidateMapCompact>(tuple => {
//     return tuple[0].length === 1 && tuple[0][0] === null
//       ? [[], tuple[1]]
//       : tuple[0].length > 1 && tuple[0][0] === null
//       ? [tuple[0].filter((m, i) => i > 0), tuple[1]]
//       : tuple;
//   })
//   );
