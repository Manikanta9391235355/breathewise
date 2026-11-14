import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

queries = [
    ('How much milk is left?', 'en-IN'),
    ('How much came through UPI?', 'en-IN'),
    ('What sold most last month?', 'en-IN'),
    ('పాల స్టాక్ ఎంత ఉంది?', 'te-IN'),
    ('యూపీఐ ద్వారా ఎంత వచ్చింది?', 'te-IN'),
    ('గత నెలలో అత్యధికంగా ఏమి అమ్ముడైంది?', 'te-IN')
]

for q, loc in queries:
    r = requests.post('http://127.0.0.1:8000/api/ask', json={'merchant_id': 'M01', 'locale': loc, 'question': q})
    res = r.json()
    print(f'Query: "{q}" ({loc}) -> Intent: {res.get("intent")}')
    print(f'Answer: {res.get("answer_text")}')
    print('---')
