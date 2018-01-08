pragma solidity ^0.4.2;

import './TicTacToe.sol';

contract TicTacToeFactory {

  event BroadCastTTTAddress(address TTTGame);

  function newGame() public returns (address) {
    address newGame = new TicTacToe(msg.sender);
    BroadCastTTTAddress(newGame);
    return newGame;
  }
}