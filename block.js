const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

}

class Block {
    constructor(timestamp, transactions, previousHash = '' ){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash () {
        return SHA256(this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.transactions) + 
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        // if difficulty is 2, then hash start with '00......'
        // if difficulty is 4, then hash start with '0000......'
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('BLOCK MINED: ' + this.hash);
    }
}

class Blockchain {
    constructor () {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Once the number of difficulty bigger, the hash calculate time will increasing
        
        // Place to store transactions in between block creation
        this.pendingTransactions = [];
        // How many coins a miner will get as a reward for his/her efforts
        this.miningReward = 100;
    }

    createGenesisBlock () {
        return new Block('01/01/2017', 'Genesis block', '0');
    }

    getLatestBlock () {
        return this.chain[this.chain.length - 1];
    }

    // addBlock (newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    minePendingTransactions (miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log('Block successfully mined!');
        this.chain.push(block);

        // Reset and give miner reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction (transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress (address) {
        let balance = 0;
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid () {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

let deanCoin = new Blockchain();

// console.log('Mining block 1...');
// deanCoin.addBlock(new Block(1, '01/01/2018', { amount: 4 }));
// console.log('Mining block 2...');
// deanCoin.addBlock(new Block(2, '03/01/2018', { amount: 10 }));

// // console.log(JSON.stringify(deanCoin, null, 4));

// console.log('Is block chain valid ? ' + deanCoin.isChainValid()); // true

// deanCoin.chain[1].data = { amount: 100 };

// console.log('Is block chain valid ? ' + deanCoin.isChainValid()); // false

// deanCoin.chain[1].hash = deanCoin.chain[1].calculateHash();

// console.log('Is block chain valid ? ' + deanCoin.isChainValid()); // false

deanCoin.createTransaction(new Transaction('address1', 'address2', 100));
deanCoin.createTransaction(new Transaction('address2', 'address1', 10));

console.log('\n Starting the miner...');
deanCoin.minePendingTransactions('Dean address');
console.log('\nBalance of miner is ', deanCoin.getBalanceOfAddress('Dean address'));

console.log('\n Starting the miner again...');
deanCoin.minePendingTransactions('Dean address');
console.log('\nBalance of miner is ', deanCoin.getBalanceOfAddress('Dean address'));