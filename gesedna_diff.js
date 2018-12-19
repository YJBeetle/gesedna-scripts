#!/usr/bin/env node --max-old-space-size=8192
console.log('# gesedna diff')

fileA = process.argv[2];
fileB = process.argv[3];

if (!(fileA && fileB)) {
    console.log('# 参数错误，用法： gesedna_diff.js <File A> <File B>')
    return 1;
}

const readline = require('readline');
const fs = require('fs');

let A = [];
let B = [];

new Promise((resolve, reject) => {
    const rlA = readline.createInterface({
        input: fs.createReadStream(fileA)
    });
    rlA.on('line', (line) => {
        if (line[0] != '#') {
            let rsid = line.match("^rs\\d+");
            let genotype = line.match("..$");
            if (rsid && genotype)
                A[rsid[0].slice(2) | 0] = genotype[0];
        }
    });
    rlA.on('close', (line) => {
        console.log("# A读取完毕！");
        resolve();
    });
}).then(() => {
    return new Promise((resolve, reject) => {
        const rlB = readline.createInterface({
            input: fs.createReadStream(fileB)
        });
        rlB.on('line', (line) => {
            if (line[0] != '#') {
                let rsid = line.match("^rs\\d+");
                let genotype = line.match("..$");
                if (rsid && genotype)
                    B[rsid[0].slice(2) | 0] = genotype[0];
            }
        });
        rlB.on('close', (line) => {
            console.log("# B读取完毕！");
            resolve();
        });
    })
}).then(() => {
    console.log("# 开始对比");

    console.log("# rsid FileA FileB");

    let allKey = [];
    for (const key in A) {
        allKey[key] = true;
    }
    for (const key in B) {
        allKey[key] = true;
    }

    let diff = [];
    for (const key in allKey) {
        let valueA = A[key];
        let valueB = B[key];

        if (valueA && valueB && valueA != '--' && valueB != '--' && valueA != valueB && valueA != valueB[1] + valueB[0]) {
            // if (valueA && valueA != '--') valueA = '**';
            // if (valueB && valueB != '--') valueB = '**';

            diff[key] = [valueA, valueB];

            console.log('rs' + key, valueA, valueB);
        }
    }
})

