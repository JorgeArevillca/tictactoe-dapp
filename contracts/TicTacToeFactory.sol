pragma solidity ^0.4.2;

import './TicTacToe.sol';

contract TicTacToeFactory {

  function newGame() public returns (address) {
    return new TicTacToe(msg.sender);
  }

}