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
  ///@dev save time of users' turn
  uint public timeAtLastTurn = now;

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
    ///@dev save last users finished move time
    timeAtLastTurn = now;
  }

  function lateTurnCancelGameReturnDeposit() public {
    ///@dev if time is greater than an hour, end game
    ///@dev 1000000<now> - 800000<timeAtLastTurn> > 3600 
    require(now - timeBetweenTurns > 1 hours)

    
  }
}