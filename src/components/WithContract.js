import React, { Component } from 'react'
import { getContract, setupContract, getAccounts } from 'api'

/**
 * Higher-Order Component to add Contract Information to a Component. This Component will add the following props:
 * 
 * contracts: Classes of Contracts (Constructor)
 * instances: Instances that were loaded, always the deployed version, additional instances can be loaded at runtime
 * deployed: Instances of contracts that were deployed to the current network
 * 
 * @param {*} contractNameOrNames 
 * @param {*} options 
 */
const WithContract = (contractNameOrNames, options = {}) => (Child) => {
  return class extends Component {
    constructor(props) {
      super(props)

      this.contracts = {}
      this.instances = {}
      this.deployed = {}

      this.state = {
        hasLoaded: false,
      }
    }

    /**
     * Loads a Truffle Contract Class
     * 
     * @param {*} contractName 
     */
    async loadContract(contractName) {
      if (!this.contracts[contractName]) {
        console.log(`Loading Contract: ${contractName}`)
        this.contracts[contractName] = await getContract(contractName)
        const deployedInstance = await this.contracts[contractName].deployed()

        if (!this.instances[contractName]) {
          this.instances[contractName] = {}
        }

        if (!this.deployed[contractName]) {
          this.deployed[contractName] = {}
        }

        this.deployed[contractName] = deployedInstance
        this.instances[contractName][deployedInstance.address] = deployedInstance
      }
    }

    /**
     * Load the instance of a Truffle Contract at a certain address
     * 
     * @param {*} contractName 
     * @param {*} address 
     */
    async loadInstance(contractName, address) {
      if (!this.instances[contractName] || !this.instances[contractName][address]) {
        console.log(`Loading Contract Instance: ${contractName}@${address}`)
        await this.loadContract(contractName)

        const contract = await this.contracts[contractName].at(address)
        this.instances[contractName][address] = contract
      }

      return this.instances[contractName][address]
    }

    /**
     * Load the deployed instance of a Truffle Contract
     * 
     * @param {*} contractName 
     */
    async loadDeployed(contractName) {
      if (!this.deployed[contractName]) {
        console.log(`Loading deployed Contract: ${contractName}`)
        const contract = await this.contracts[contractName].deployed()

        this.deployed[contractName] = contract
        this.instances[contract.address] = contract
      }
      return this.deployed[contractName][address]
    }

    async componentDidMount() {
      // load contracts from contractNamesOrNames (array or string)
      if (typeof contractNameOrNames === 'object') {
        this.contracts = {}
        this.instances = {}
        const promises = contractNameOrNames.map(async (contractName) => await this.loadContract(contractName))

        await Promise.all(promises)

      } else {
        await this.loadContract(contractNameOrNames)
      }

      // load additional instances of contracts from prop function
      if (typeof options.loadInstances === 'function') {
        const contractNamesAndAddreses = options.loadInstances(this.props)
        const promises = Promise.all(Object.keys(contractNamesAndAddreses).map(async (contractName) =>
          Promise.all(contractNamesAndAddreses[contractName].map(async (address) =>
            await this.loadInstance(contractName, address)
          ))
        ))

        await promises
      }

      this.setState({
        hasLoaded: true
      })

    }
    render() {
      if (!this.state.hasLoaded) {
        return <span>Loading...</span>
      }

      const props = {
        ...this.props,
        getAccounts
      }

      props.contracts = { ...this.contracts }
      props.instances = { ...this.instances }
      props.deployed = { ...this.deployed }

      return <Child {...props}  />
    }
  }
}

export default WithContract