pragma solidity ^0.4.2;

import './TicTacToeFactory.sol';

/// @title TicTacToe Game Contract
contract TicTacToe {
  address public opponent;
  address public challenger;

  ///@dev mapping of user address to deposit balance
  ///@dev depositBalances[0x123123123] = 1000000
  mapping (address => uint ) public depositBalances; 

  enum FieldStates { None, Owner, Opponent }
  FieldStates constant DEFAULT_STATE = FieldStates.None;

  FieldStates[8] field;

  address public currentTurn;
  ///@dev save time of users' turn
  uint public timeAtLastTurn = now;

  ///@dev EVENTS
  event GameStarted(bool started);
  event GameHasChallenger(bool started, address challenger);

  ///@dev CONSTRUCTOR
  function TicTacToe(address _owner) public {
    challenger = _owner;

    GameHasChallenger(true, challenger);
  }

  function joinAndStartGame() public {
    require(msg.sender != challenger);
    require(opponent == 0);

    opponent = msg.sender;

    bool boolOutcome = randomBool();

    if (boolOutcome) 
      currentTurn = msg.sender;
    else
      currentTurn = opponent;

    GameStarted(true);
  }

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
    ///@dev if time is less than an hour, revert
    ///@dev 1000000<now> - 800000<timeAtLastTurn> > 3600 
    require(now - timeAtLastTurn > 1 hours);
    require(msg.sender != currentTurn);

    uint amount = depositBalances[currentTurn];

    depositBalances[currentTurn] = 0;
    currentTurn.transfer(amount);
  }

  function randomBool() constant public returns (bool) {
    uint256 r1 = uint256(block.blockhash(block.number-1));
    uint256 r2 = uint256(block.blockhash(block.number-2));

    uint256 result;
    assembly {
        result := xor(r1, r2)
    }

    return result % 2 == 0;
  }
}