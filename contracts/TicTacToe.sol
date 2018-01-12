pragma solidity ^0.4.2;

/// @title TicTacToe Game Contract
contract TicTacToe {
  address public opponent;
  address public challenger;
  uint32 public gameField = uint32(0);

  ///@dev mapping of user address to deposit balance
  ///@dev depositBalances[0x123123123] = 1000000
  mapping (address => uint ) public depositBalances; 


  address public winner;
  address public currentPlayer;
  uint8 public turnCount = 1;
  ///@dev save time of users' turn
  uint public timeAtLastTurn = now;

  uint32 ODD = 0x55555;
  uint32 EVEN = 0xAAAAA;

  ///@dev HTop, HMiddle, HBottom, VLeft, VMiddle, VRight, DTL, DTR
  uint32[] winningConditions = [0x3F, 0xFC0, 0xFC000, 0x30C3, 0xC30C, 0x30C30, 0x30303, 0x3330];

  ///@dev EVENTS
  event GameHasOpponent(address opponent);
  event GameHasChallenger(address challenger);
  event MoveMade(uint32 field);

  ///@dev CONSTRUCTOR
  function TicTacToe(address _owner) public {
    challenger = _owner;

    GameHasChallenger(challenger);
  }

  /// @dev Joins the game as msg.sender and start the game
  function joinAndStartGame() public {
    require(msg.sender != challenger);
    require(opponent == 0);

    opponent = msg.sender;
    currentPlayer = opponent;

    GameHasOpponent(opponent);
  }

  /// @dev Sets the position on the field as msg.sender
  function playerMove (uint8 x, uint8 y) public {
    ///@dev Game is not tied
    require(turnCount <= 9);
    ///@dev Game has no winner yet
    require(winner == 0);
    ///@dev Opponent is set
    require(opponent != 0);
    ///@dev msg.sender is currentPlayer
    require(msg.sender == address(currentPlayer));

    ///@dev Determine Playerindex
    uint8 player = currentPlayer == challenger ? 1 : 2;

    ///@dev Position calculation from 2d to 1d, + offset for player (zero based)
    uint8 position = (x % 3) + (y * 3);

    ///@dev Determine if cell is occupied
    bool isOccupied = (gameField >> (position * 2) & 0x3) > 0;
  
    ///@dev Cell can not be occupied already (by either player)
    require(!isOccupied);

    gameField = gameField | uint32(1) << (position * 2 + (player - 1));

    uint32 playerMask = currentPlayer == challenger ? ODD : EVEN;
    for (uint8 winningIndex = 0; winningIndex < 8; winningIndex++) {
      bool win = (gameField & playerMask & winningConditions[winningIndex]) == (playerMask & winningConditions[winningIndex]);

      if (win) {
        winner = currentPlayer;
        break;
      }
    }

    currentPlayer = currentPlayer == challenger ? opponent: challenger;
    turnCount++;

    timeAtLastTurn = now;
    MoveMade(gameField);
  }

  ///@dev Can be triggered after 1H without activity
  function lateTurnCancelGameReturnDeposit() public {
    ///@dev if time is less than an hour, revert
    ///@dev 1000000<now> - 800000<timeAtLastTurn> > 3600 
    require(opponent != 0);
    require(now - timeAtLastTurn > 1 hours);
    require(msg.sender != currentPlayer);

    ///@dev Set the turnCount to 10 to disable the game
    turnCount = 10;

    uint amount = depositBalances[currentPlayer];

    depositBalances[currentPlayer] = 0;
    currentPlayer.transfer(amount);
  }
}