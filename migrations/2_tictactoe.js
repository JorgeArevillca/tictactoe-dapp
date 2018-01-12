var TicTacToe = artifacts.require("TicTacToe");
var TicTacToeFactory = artifacts.require("TicTacToeFactory");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(TicTacToe, accounts[0]);
  deployer.deploy(TicTacToeFactory)
};