import React, { Component } from 'react'
import { getContract, setupContract, getAccounts } from 'api'

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
        this.instances[deployedInstance.address] = deployedInstance
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
        console.log(`Loading Instance Contract: ${contractName}@${address}`)
        await this.loadContract(contractName)

        const contract = await this.contracts[contractName].at(address)
        this.instances[address] = contract
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
      return this.instadeployednces[contractName][address]
    }

    async componentDidMount() {
      // load contracts from contractNamesOrNames (array or string)
      if (typeof contractNameOrNames === 'object') {
        this.contracts = {}
        this.instances = {}
        const promises = contractNameOrNames.map(async (contractName) => this.loadContract(contractName))

        await Promise.all(promises)

      } else {
        this.contracts = {
          [contractNameOrNames]: await getContract(contractNameOrNames)
        }
        this.instances = {
          [contractNameOrNames]: await this.contracts[contractNameOrNames].deployed()
        }
      }

      // load additional instances of contracts from prop function
      if (typeof options.loadInstances === 'function') {
        const contractNamesAndAddreses = options.loadInstances(this.props)
        const promises = Promise.all(Object.keys(contractNamesAndAddreses).map(async (contractName) =>
          contractNamesAndAddreses[contractName].map(async (address) =>
            this.loadInstance(contractName, address)
          )
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

      return <Child {...props}  />
    }
  }
}

export default WithContract