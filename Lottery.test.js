const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    // déploie le contrat sur le réseau ganache
    accounts = await web3.eth.getAccounts();
    
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {

    it('deploys a contract', () => {
        // vérifie que Lottery a bien une adrèsse <=> a bien été déployé
       assert.ok(lottery.options.address) ;
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players= await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]); // on vérifie que la 1ère adresse dans players est bien accounts[0]
        assert.equal(1, players.length); // on vérifie qu'un seul joueur a été enregistré
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players= await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]); // on vérifie que la 1ère adresse dans players est bien accounts[0]
        assert.equal(accounts[1], players[1]); 
        assert.equal(accounts[2], players[2]); 
        assert.equal(3, players.length); // on vérifie que 3 joueurs ont été enregistrés
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200 // wei
            });  
        } catch(err) {
            return assert(err);
        }
        assert(false);
    });  
    
    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({from: accounts[0] });
        } catch(err) {
            console.log('branch : catch err');
            return assert(err);
        }
        console.log('after exit : try catch');
        assert(false);
    });  

    it('sends money to the winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether'));

        const players= await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.equal(0, players.length)
    });

});
