pragma solidity ^0.4.2;

import './TicTacToe.sol';

contract TicTacToeFactory {

  mapping (address => address) tttGame;

  event BroadCastTTTAddress(address TTTGame);

  function newGame() public returns (address) {
    tttGame[msg.sender] = new TicTacToe(msg.sender);
    BroadCastTTTAddress(msg.sender);
  }
}