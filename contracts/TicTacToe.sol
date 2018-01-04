pragma solidity ^0.4.2;

/// @title TicTacToe Game Contract
contract TicTacToe {
  address public opponent;
  address public challenger = msg.sender;

  enum FieldStates { None, Owner, Opponent }
  FieldStates constant DEFAULT_STATE = FieldStates.None;

  FieldStates[2][] field;

  address public currentTurn;

  function set (uint x, uint y) public {
    require(msg.sender == address(currentTurn));

    if (address(currentTurn) == address(opponent)) {
      field[x][y] = FieldStates.Opponent;
      currentTurn = address(challenger);
    } else {
      field[x][y] = FieldStates.Owner;
      currentTurn = address(opponent);
    }
    
  }
}