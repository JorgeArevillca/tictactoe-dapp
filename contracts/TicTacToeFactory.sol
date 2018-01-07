pragma solidity ^0.4.2;

import './TicTacToe.sol';

contract TicTacToeFactory {

  event BroadCastTTTAddress(address TTTGame);

  function newGame() public returns (address) {
    return new TicTacToe(msg.sender);
  }

  function broadcastNewTTTAddress() public {
    BroadCastTTTAddress(msg.sender);
  }

}