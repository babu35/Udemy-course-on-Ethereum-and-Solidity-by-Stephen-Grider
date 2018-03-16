pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        // ajoute un joueur, si il/elle a versé au moins 0,01 ether
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players)); //pseudo générateur aléatoire
    }
    
    function pickWinner() public {
        require(msg.sender == manager); // seul le manager peut executer cette fonction
        uint index = random() % players.length;
        players[index].transfer(this.balance); // envoie le solde de ce contrat à l'adresse indiquée
        players = new address[](0); //réinitialise players, avec 0 élément
    }
    
    function getPlayers() public view returns (address[]) {
        // renvoie la liste des joueurs (leur adrèsse)
        return players;   
    }
     
}