import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap'
import Token from '../abis/Token.json'
import dBank from '../abis/dBank.json'
import Landlord from '../abis/Landlord.json'
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      
      tokenAddress: null,
      account: '',
      balance: 0,
      
      dBankAddress: null,
      dbank: null,

      landlordAddress: null,
      landlord: null,
    }
  }

  async componentWillMount() {
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    //check if MetaMask exists
    if (typeof window.ethereum !== 'undefined') {
      // ask metamask to confirm using this dapp
      window.ethereum.enable()
      
      //assign to values to variables: web3, netId, accounts
      const web3 = new Web3(window.ethereum) // window.ethereum is from metamask
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()

      //check if account is detected, then load balance&setStates, elsepush alert
      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({ account: accounts[0], balance: balance, web3: web3 })
      } else {
        alert("pls login in metamask")
        window.location.reload()
      }

      //in try block load contracts
      try {
        // const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const tokenAddress = Token.networks[netId].address
        const dBankAddress = dBank.networks[netId].address
        const dbank = new web3.eth.Contract(dBank.abi, dBankAddress)
        const landlordAddress = Landlord.networks[netId].address
        const landlord = new web3.eth.Contract(Landlord.abi, landlordAddress)
        this.setState({
          tokenAddress: tokenAddress,
          dBankAddress: dBankAddress,
          dbank: dbank,
          landlordAddress: landlordAddress,
          landlord: landlord,
        })
      } catch (error) {
        console.log(error)
        alert("contracts not deployed to current network")
      }

    } else {
      //if MetaMask not exists push alert
      alert("pls install metamask")
    }
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(typeof this.state.dbank !== 'undefined') {
      //in try block call dBank deposit();
      try {
        await this.state.dbank.methods.deposit().send({
          value: amount,
          from: this.state.account
        })
        window.location.reload()
      } catch (error) {
        console.log("deposit error: ", error)
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault()
    //check if this.state.dbank is ok
    if(typeof this.state.dbank !== 'undefined') {
      //in try block call dBank  withdraw();
      try {
        await this.state.dbank.methods.withdraw().send({
          from: this.state.account
        })
      } catch (error) {
        console.log("deposit error: ", error)
      }
      window.location.reload()
    }
  }

  async exchange(amount) {
    if(typeof this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.exchange().send({
          value: amount,
          from: this.state.account
        })
        window.location.reload()
      } catch (error) {
        console.log("exchange error: ", error)
      }
    }
  }

  async drain(e) {
    e.preventDefault()
    if(typeof this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.drain().send({
          from: this.state.account
        })
      } catch (error) {
        console.log("drain error: ", error)
      }
      window.location.reload()
    }
  }

  async claimLand(requestedX, requestedY, offer) {
    if(typeof this.state.landlord !== 'undefined') {
      try {
        await this.state.landlord.methods.claimLand(requestedX, requestedY).send({
          value: offer,
          from: this.state.account
        })
        window.location.reload()
      } catch (error) {
        console.log("claim land error:", error)
      }
    }
  }

  async seizeLand(requestedX, requestedY, offer) {
    if(typeof this.state.landlord !== 'undefined') {
      try {
        await this.state.landlord.methods.seizeLand(requestedX, requestedY).send({
          value: offer,
          from: this.state.account
        })
        window.location.reload()
      } catch (error) {
        console.log("seize land error:", error)
      }
    }
  }

  async getLandCoords(id) {
    return this.state.landlord.methods.lands(id).call()
  }

  async getLandPrice(id) {
    let land = await this.getLandCoords(id)
    let landHash = await this.state.landlord.methods.landHash(land.x, land.y).call()
    return this.state.landlord.methods.landPrices(landHash).call()
  }

  async getLandInfo(id) {
    let coords, price
    try {
      coords = await this.getLandCoords(id)
      price = await this.getLandPrice(id)
    } catch {
      alert("invalid land id")
    }
    return {...coords, price: Web3.utils.fromWei(price.toString(), "ether")}
  }

  async getOwnedLands() {
    let myLandIds = await this.state.landlord.methods.getLandsByOwner(this.state.account).call()
    let myLands = []
    for (let i = 0; i < myLandIds.length; i++) {
      let myLand = await this.getLandInfo(myLandIds[i])
      myLands.push(myLand)
    }
    return myLands
  }

  async getAllLands() {
    let ids = await this.state.landlord.methods.getAllLandIds().call()
    let lands = []
    for (let i = 0; i < ids.length; i++) {
      let land = await this.getLandInfo(ids[i])
      lands.push(land)
    }
    return lands
  }

  putLandInfo(lands, elementId) {
    var resultDiv = document.getElementById(elementId)
    resultDiv.innerHTML = ""
  
    if (!Array.isArray(lands)) {
      lands = [lands]
    }

    if (lands.length === 0) {
      let p = document.createElement("p")
      let pContent = document.createTextNode("empty")
      p.appendChild(pContent)
      resultDiv.append(p)
      return
    }

    lands.forEach(land => {
      let p = document.createElement("p")
      let pContent = document.createTextNode(
        "land coords are (" + land.x + ", " + land.y + ") " +
        "with a price of " + land.price + " eth"
      )
      p.appendChild(pContent)

      resultDiv.append(p)
    });
  }

  render() {
    return (
      <div className='text-monospace'>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>hey there, this is ur address</h1>
          <h2>{this.state.account}</h2>
          <br></br>

          <h3>eth balance: {Web3.utils.fromWei(this.state.balance.toString(), 'ether')} ETH</h3>
          <br></br>
          
          <h3>dbank app</h3>
          <div className="row">
            <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">

                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <p>how much u wanna deposit</p><br></br>
                    <p>minimum is 0.01 ETH</p><br></br>
                    <p>only 1 deposit at a time</p><br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18
                      this.deposit(amount)
                    }}>
                      <input
                        id="depositAmount"
                        step="0.01"
                        type="number"
                        required
                        ref={(input) => {this.depositAmount = input}}
                      />
                      <button type="submit" class="btn btn-primary">deposit</button>
                    </form>
                  </div>
                </Tab>

                <Tab eventKey="withdraw" title="Withdraw">
                  <div>
                    <p>withdraw all ur money with interest</p>
                    <button type="submit" class="btn btn-primary"
                      onClick={(e) => this.withdraw(e)}
                    >
                      withdraw all
                    </button>
                  </div>
                </Tab>

                <Tab eventKey="exchange" title="Exchange">
                  <div>
                    <p>how much u wanna exchange</p><br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.exchangeAmount.value
                      amount = amount * 10**18
                      this.exchange(amount)
                    }}>
                      <input
                        type="number"
                        required
                        ref={(input) => {this.exchangeAmount = input}}
                      />
                      <button type="submit" class="btn btn-primary">exchange</button>
                    </form>
                  </div>
                </Tab>

                <Tab eventKey="drainbank" title="Drain Bank Balance">
                  <button type="submit" class="btn btn-primary"
                    onClick={(e) => this.drain(e)}
                  >
                    drain
                  </button>
                </Tab>

              </Tabs>
            </div>
          </div>

          <br></br><br></br><br></br><br></br>

          <h3>landlord app</h3>
          <div className="row">
            <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example2">
                <Tab eventKey="claimland" title="Claim Land">
                  <div>
                    <p>input x and y and claim it fo yoself</p>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let x = this.landX.value
                      let y = this.landY.value
                      let offer = this.offer.value * 10**18
                      this.claimLand(x, y, offer)
                    }}>
                      <input
                        type="number"
                        id="landx"
                        placeholder="x coord"
                        ref={(input) => {this.landX = input}}
                      />
                      <input
                        type="number"
                        id="landy"
                        placeholder="y coord"
                        ref={(input) => {this.landY = input}}
                      />
                      <input
                        id="offer"
                        placeholder="price offering"
                        ref={(input) => {this.offer = input}}
                      />
                      <button type="submit" class="btn btn-primary">claim land</button>
                    </form>
                  </div>
                </Tab>

                <Tab eventKey="seizeland" title="Seize Land">
                  <div>
                    <p>input x and y and seize it from someone by paying more</p>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let x = this.landX2.value
                      let y = this.landY2.value
                      let offer = this.offer2.value * 10**18
                      this.seizeLand(x, y, offer)
                    }}>
                      <input
                        type="number"
                        id="landx2"
                        placeholder="x coord"
                        ref={(input) => {this.landX2 = input}}
                      />
                      <input
                        type="number"
                        id="landy2"
                        placeholder="y coord"
                        ref={(input) => {this.landY2 = input}}
                      />
                      <input
                        type="number"
                        id="offer2"
                        placeholder="price offering"
                        ref={(input) => {this.offer2 = input}}
                      />
                      <button type="submit" class="btn btn-primary">seize land</button>
                    </form>
                  </div>
                </Tab>

                <Tab eventKey="viewland" title="View Land">
                  <input
                    type="number"
                    id="landid"
                    placeholder="land id"
                    ref={(input) => {this.landid = input}}
                  />
                  <button type="submit" class="btn btn-primary"
                    onClick={() => {
                      var resultDiv = document.getElementById("viewedland")
                      resultDiv.innerHTML = ""
                    
                      this.getLandInfo(this.landid.value)
                      .then((land) => {
                        this.putLandInfo(land, "viewedland")
                      })
                    }}
                  >
                    view land by id
                  </button>
                  <div id="viewedland"></div>
                </Tab>

                <Tab eventKey="viewmylands" title="View My Lands">
                  <button type="submit" class="btn btn-primary"
                    onClick={() => {
                      this.getOwnedLands()
                      .then((land) => {
                        this.putLandInfo(land, "mylands")
                      })
                    }}
                  >
                    view mine
                  </button>
                  <div id="mylands"></div>
                </Tab>

                <Tab eventKey="viewallland" title="View All Owned Lands">
                  <button type="submit" class="btn btn-primary"
                    onClick={() => {
                      this.getAllLands()
                      .then((land) => {
                        this.putLandInfo(land, "alllands")
                      })
                    }}
                  >
                    view all
                  </button>
                  <div id="alllands"></div>
                </Tab>
              </Tabs>
            </div>
          </div>
          
          <br></br><br></br><br></br><br></br>
          <hr></hr>
          <div className="row">
              token is located at {this.state.tokenAddress}
              <br></br>
              dbank is located at {this.state.dBankAddress}
              <br></br>
              landlord is located at {this.state.landlordAddress}
          </div>
        </div>
      </div>
    );
  }
}

export default App;