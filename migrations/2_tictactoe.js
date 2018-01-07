var TicTacToe = artifacts.require("TicTacToe");
var TicTacToeFactory = artifacts.require("TicTacToeFactory");

module.exports = function(deployer) {
  deployer.deploy(TicTacToe);
  deployer.deploy(TicTacToeFactory)
};