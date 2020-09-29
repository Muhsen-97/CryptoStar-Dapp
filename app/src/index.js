import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("star-name").value;
    const id = document.getElementById("starid").value;
    await createStar(name, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starId = document.getElementById("lookid").value;
    try{
      const name = await lookUptokenIdToStarInfo(starId).call({ from: this.account });
      App.setStatus("The star name for this ID is: " + name + ".");
    } catch (e) {
      console.log(`Error: ${e}`);
    }

  },

  exchangeStars: async function () {
    const { exchangeStars } = this.meta.methods;
    const starId1 = document.getElementById("exchange-starid1").value,
          starId2 = document.getElementById("exchange-starid2").value;
    try{
      await exchangeStars(starId1, starId2).send({ from: this.account });
      App.setStatus("Stars have been exchanged successfully!");
    } catch (e) {
      console.log(`Error: ${e}`);
    }
    
  },

  transferStar: async function() {
    const { transferStar } = this.meta.methods;
    const address = document.getElementById("transfer-address").value;
    const starId = document.getElementById("transfer-starid").value;
    try {
      await transferStar(address, starId).send({ from: this.account });
      App.setStatus(`Star with Id ${starId} has been transferred to address ${address} successfully!`);
    } catch(e) {
        console.log(`Error: ${e}`);
    }
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});