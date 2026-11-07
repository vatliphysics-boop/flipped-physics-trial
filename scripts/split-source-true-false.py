"""Make four-statement questions without inventing, duplicating or dropping source items."""
from copy import deepcopy
import re


def split_true_false(bank):
    published = []
    pools = {}
    pending = []
    for q in bank:
        if q['kind'] != 'true_false' or len(q['statements']) == 4:
            published.append(deepcopy(q))
            continue
        # Only independent statements with a generic instruction may be combined.
        # A numerical stem or source figure must remain attached to its own group.
        generic = q['prompt'] in {
            'Trong mỗi phát biểu sau, em hãy chọn đúng hoặc sai.',
            'Đánh dấu (x) vào các cột đúng hoặc sai tương ứng với các nội dung trong bảng dưới đây.',
        } and not q.get('figure')
        key = ('topic', q['topic']) if generic else ('question', q['id'])
        pool = pools.setdefault(key, [])
        reasons = dict(re.findall(r'(?:^|;\s*)([a-z])\)\s*([^;]+)', q.get('explanation', '')))
        for index, statement in enumerate(q['statements']):
            item = deepcopy(statement)
            reason = reasons.get(chr(97 + index))
            if reason:
                item['explanation'] = reason.rstrip('.') + '.'
            pool.append((q, index, item))

    for key, pool in pools.items():
        for offset in range(0, len(pool), 4):
            group = pool[offset:offset + 4]
            if len(group) < 4:
                pending.extend({'questionId': q['id'], 'topic': q['topic'],
                                'source': deepcopy(q['source']), 'statementIndex': i,
                                'statement': item, 'reason': 'Chưa ghép đủ bốn ý cùng chủ đề.'}
                               for q, i, item in group)
                continue
            base = deepcopy(group[0][0])
            base['id'] = f"{base['id']}-tf-{offset // 4 + 1}"
            base['statements'] = [item for _, _, item in group]
            parts = []
            for q, i, _ in group:
                if not parts or parts[-1]['questionId'] != q['id']:
                    parts.append({'questionId': q['id'], **deepcopy(q['source']), 'statementIndexes': []})
                parts[-1]['statementIndexes'].append(i)
            base['source']['parts'] = parts
            base['explanation'] = '\n'.join(
                f"{chr(97 + i)}) {item.get('explanation') or ('Đúng.' if item['answer'] else 'Sai.')}"
                for i, (_, _, item) in enumerate(group))
            base.setdefault('notes', []).append('Tách/ghép thành bốn ý cùng chủ đề; lưu vị trí từng ý để đối chiếu nội bộ.')
            published.append(base)
    return published, pending
