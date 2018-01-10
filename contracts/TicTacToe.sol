pragma solidity ^0.4.2;

/// @title TicTacToe Game Contract
contract TicTacToe {
  address public opponent;
  address public challenger;

  ///@dev mapping of user address to deposit balance
  ///@dev depositBalances[0x123123123] = 1000000
  mapping (address => uint ) public depositBalances; 

  enum FieldStates { None, Owner, Opponent }
  FieldStates constant DEFAULT_STATE = FieldStates.None;

  FieldStates[9] public field;

  bool public hasStarted;
  bool public hasFinished;
  address public winner;
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

    hasStarted = true;
    GameStarted(true);
  }

  function playerMove (uint x, uint y) public returns (uint) {
    require(msg.sender == address(currentTurn));
    require(!hasFinished);

    uint position = (x % 3) + y * 3;

    if (address(currentTurn) == address(opponent)) {
      field[position] = FieldStates.Opponent;

      if (didWin(FieldStates.Opponent)) {
        hasFinished = true;
        winner = currentTurn;
      } else {
        currentTurn = address(challenger);
      }
    } else {
      field[position] = FieldStates.Owner;
      
      if (didWin(FieldStates.Owner)) {
        hasFinished = true;
        winner = currentTurn;
      } else {
        currentTurn = address(opponent);
      }
    }

    if (didTie()) {
        hasFinished = true;
    }

    ///@dev save last users finished move time
    timeAtLastTurn = now;

    return position;
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

  function didWin(FieldStates goal) public returns (bool) {
    bool horizontalTop = field[0] == goal && field[1] == goal && field[2] == goal;
    bool horizontalMiddle = field[3] == goal && field[4] == goal && field[5] == goal;
    bool horizontalBottom =field[6] == goal && field[7] == goal && field[8] == goal;
    bool verticalLeft = field[0] == goal && field[3] == goal && field[6] == goal;
    bool verticalMiddle = field[1] == goal && field[4] == goal && field[7] == goal;
    bool verticalBottom = field[2] == goal && field[5] == goal && field[8] == goal;
    
    bool diagonalTopLeft = field[0] == goal && field[4] == goal && field[8] == goal;
    bool diagonalTopRight = field[2] == goal && field[4] == goal && field[6] == goal;

    return horizontalTop || horizontalMiddle || horizontalBottom || verticalLeft || verticalMiddle || verticalBottom || diagonalTopLeft || diagonalTopRight;
  }

  function didTie() public returns (bool) {
    for(uint256 position = 0; position < 9; position++) {
      if (field[position] == FieldStates.None) {
        return false;
      }
    }

    return true;
  }
}