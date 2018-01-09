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

      this.refresh = this.refresh.bind(this)

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
      try {
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
      } catch (e) {
        console.warn(`Could not load Contract: ${contractName}`)
        if (typeof options.onError === 'function') {
          options.onError(e, this.props)
        }
        throw e
      }
    }

    /**
     * Load the instance of a Truffle Contract at a certain address
     * 
     * @param {*} contractName 
     * @param {*} address 
     */
    async loadInstance(contractName, address) {
      try {
        if(!this.contracts[contractName] || !this.instances[contractName][address]) {
          console.log(`Loading Contract Instance: ${contractName}@${address}`)
          await this.loadContract(contractName)
  
          // need to wrap the .at function because it's not a simple promise
          const contract = await (new Promise((resolve, reject) => {
            this.contracts[contractName].at(address).then((inst) => {
              console.log(inst)
              resolve(inst)
            }, reject).catch((err) => {
              reject(err)
            })
          }))
          this.instances[contractName][address] = contract  
        }

        return this.instances[contractName][address] 
      } catch (e) {
        console.warn(`Could not load Contract Instance: ${contractName}@${address}`)
        if (typeof options.onError === 'function') {
          options.onError(e, this.props)
        }
        throw e
      }
    }

    /**
     * Load the deployed instance of a Truffle Contract
     * 
     * @param {*} contractName 
     */
    async loadDeployed(contractName) {
      try {
        if (!this.deployed[contractName]) {
          console.log(`Loading deployed Contract: ${contractName}`)
          const contract = await this.contracts[contractName].deployed()
  
          this.deployed[contractName] = contract
          this.instances[contract.address] = contract
        }
        return this.deployed[contractName][address]
      } catch (e) {
        console.warn(`Could not load deployed Contract: ${contractName}`)
        if (typeof options.onError === 'function') {
          options.onError(e, this.props)
        }
        throw e
      }
    }

    async fetchContractsFromProps() {
      // load contracts from contractNamesOrNames (array or string)
      if (typeof contractNameOrNames === 'object') {
        this.contracts = {}
        this.instances = {}
        const promises = contractNameOrNames.map(async (contractName) => await this.loadContract(contractName))

        await Promise.all(promises)

      } else {
        await this.loadContract(contractNameOrNames)
      }

      console.log(options)
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

      // map contract instances to props
      if (typeof options.mapContractInstancesToProps === 'function') {
        let instanceMappingProps = {}

        const mappingPromises = Promise.all(Object.keys(this.instances).map((contractName) =>
          Promise.all(Object.keys(this.instances[contractName]).map(async (address) => {
            const changes = await options.mapContractInstancesToProps(contractName, this.instances[contractName][address], this.props)
            console.log(changes)
            if (changes && Object.keys(changes).length) {
              instanceMappingProps = Object.assign(instanceMappingProps, changes)
            }
          }))
        ))

        await mappingPromises
        this.instanceMappingProps = instanceMappingProps
      }

      this.accounts = await getAccounts()
    }

    async componentDidMount() {
      try {
        await this.fetchContractsFromProps()

        this.setState({
          hasLoaded: true
        })
      } catch (e) {
        // errored, don't interact with state, let userspace handle
      }
    }

    async refresh() {
      console.log("refreshing")
      await this.fetchContractsFromProps()
      this.forceUpdate()
    }

    render() {
      if (!this.state.hasLoaded) {
        return <span>Loading...</span>
      }

      console.log("rerendering")

      const props = {
        accounts: this.accounts,
        refresh: this.refresh,
        ...this.props,
        ...this.instanceMappingProps,
      }

      props.contracts = { ...this.contracts }
      props.instances = { ...this.instances }
      props.deployed = { ...this.deployed }

      return <Child {...props}  />
    }
  }
}

export default WithContract