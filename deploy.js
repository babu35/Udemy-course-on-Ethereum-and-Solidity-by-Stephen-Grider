const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'antenna reward labor cross busy error tail betray clinic patrol letter tragic',
    'https://rinkeby.infura.io/vn9XvG3u2ESceoTypIPx'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    
    console.log('Attemping to deploy from account ', accounts[0]);
    
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({gas: '1000000', from: accounts[0]});
    
    console.log('Contract deployed to ', result.options.address);
};
deploy();

