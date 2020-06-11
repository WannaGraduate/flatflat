const fs = require('fs');

const files = fs.readdirSync('./src');
const groups = JSON.parse(fs.readFileSync('./file-tag-system.json')).groups;

function selectRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generate(weights) {
    let current = 'App.page.js';
    const seq = ['App.page.js'];

    for (let i = 0; i < 30000; i++) {
        const splitted = current.split('.').slice(0, -1);
        let weight = 0;
        const arr = [];
        splitted.forEach((s) => {
            const entries = Object.entries(groups).find(([key, value]) =>
                value.tags.find((t) => t === s),
            );
            if (!entries) {
                return;
            }
            weight += weights[entries[0]];
            arr.push([s, weight]);
        });
        if (arr.length === 0) {
            current = selectRandom(files);
            seq.push(current);
            continue;
        }
        const rand = Math.random() * weight;
        const tag = arr.find((x) => rand < x[1])[0];
        const candidate = files.filter(
            (f) =>
                f
                    .split('.')
                    .slice(0, -1)
                    .find((x) => x === tag) && f !== current,
        );
        if (candidate.length === 0) {
            current = selectRandom(files);
        } else {
            current = selectRandom(candidate);
        }
        seq.push(current);
    }

    return seq;
}

function evaluate(seq, query) {
    let weight = 0;
    for (let i = 0; i < seq.length - 1; i++) {
        const prev = seq[i].split('.').slice(0, -1);
        const next = seq[i + 1].split('.').slice(0, -1);

        let filtered = [...files];
        for (let q of query) {
            const tags = groups[q].tags;
            const p = tags.find((t) => prev.find((x) => x === t));
            const n = tags.find((t) => next.find((x) => x === t));
            if (p !== n) {
                break;
            }
            filtered = filtered.filter((arr) =>
                arr
                    .split('.')
                    .slice(0, -1)
                    .find((x) => x === p),
            );
        }
        weight += filtered.length;
    }
    return weight;
}

const result = Array.from({ length: 20 }, (_, k) => ({
    react: k,
    entity: 90 - k,
    test: 3,
    style: 2,
}))
    .map(generate)
    .map((seq) =>
        [
            ['react', 'entity'],
            ['entity', 'react'],
            ['react'],
            ['entity'],
            [],
        ].map((query) => evaluate(seq, query)),
    );

console.log(result);
