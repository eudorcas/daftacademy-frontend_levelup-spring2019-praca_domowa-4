import 'babel-polyfill';

async function promiseAll(promises) {
    const resultsArr = [];
    for (const pr of promises) {
        resultsArr.push(await pr);
    }
    return resultsArr;
}

function promiseRace(promises) {
    const race = async (pr) => {
        return new Promise((resolve, reject) => {
            let result = null;
            pr.forEach(async p => {
                try {
                    result = await p;
                    resolve(result);
                }
                catch (error){
                    reject(error)
                }
            })
            return result;

        })
    }
    return race(promises);
}


// Kod testowy.

promiseAll([]).then(result => {
    console.log('To powinien być []:', JSON.stringify(result));
});

promiseAll([futureSuccess(1), futureSuccess(2), futureSuccess(3)]).then(result => {
    console.log('To powinien być [1, 2, 3]:', result);
});

promiseAll([futureSuccess(1), Promise.reject('X'), futureSuccess(3)])
    .then(() => {
        console.log('WAT?! Nie powinno nas tu być..');
    })
    .catch(error => {
        if (error !== 'X') {
            console.log('Coś poszło nie tak..:', error);
        }
        console.log('To powinien być X:', error);
    });

promiseRace([1, 2, 3]).then(result => {
    console.log('This should be 1:', result);
});

const now = performance.now();
promiseRace([delayedSuccess(1, 300), delayedSuccess(2, 200), delayedSuccess(3, 100)]).then(result => {
    const after = performance.now();
    const diff = after - now;
    if (diff < 100) {
        throw 'Za szybko!'
    }
    if (diff >= 200) {
        throw 'Za wolno!'
    }
    console.log('To powinno być 3:', result);
});

promiseRace([futureSuccess(1), Promise.reject('X'), futureSuccess(3)])
    .then(() => {
        console.log('WAT?! Nie powinno nas tu być..');
    })
    .catch(error => {
        if (error !== 'X') {
            console.log('Coś poszło nie tak..:', error);
        }
        console.log('To powinien być X:', error);
    });

function futureSuccess(val) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(val), Math.random() * 500);
    });
};

function delayedSuccess(val, time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(val), time);
    });
};
