pragma solidity ^0.4.2;

/// @title TicTacToe Game Contract
contract TicTacToe {
  address public opponent;
  address public challenger = msg.sender;

  ///@dev mapping of user address to deposit balance
  ///@dev depositBalances[0x123123123] = 1000000
  mapping (address => uint ) public depositBalances; 

  enum FieldStates { None, Owner, Opponent }
  FieldStates constant DEFAULT_STATE = FieldStates.None;

  FieldStates[8] field;

  address public currentTurn;
  uint public timeBetweenTurns = now;

  function playerMove (uint x, uint y) public {
    require(msg.sender == address(currentTurn));

    uint position = (x % 3) + y;

    if (address(currentTurn) == address(opponent)) {
      field[position] = FieldStates.Opponent;
      currentTurn = address(challenger);
    } else {
      field[position] = FieldStates.Owner;
      currentTurn = address(opponent);
    }

    timeBetweenTurns = now;
  }
}