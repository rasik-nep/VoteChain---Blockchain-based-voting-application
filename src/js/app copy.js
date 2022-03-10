// object with several objects


App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  // initialize the app with web3
  init: function() {
    return App.initWeb3();
  },  
  //initisalize web3
  // connects the client side application to the blockchain
  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  //initisalize the contract
  //loads the contact into the front end application so we can interact with it
  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        // App.empty();
       App.updateCounts()
      });
    });
  },


   updateCounts: function(){
		$("#content").hide();
		$("#loader").show();

	App.contracts.Election.deployed().then(function(instance){
		electionInstance = instance;
		return electionInstance.candidatesCount();
	  }).then(function(candidatesCount){
		  for(var i = 1; i <= candidatesCount; i++) {
			  electionInstance.candidates(i).then(function(candidate){
				  
				  var id = candidate[0];
				  var voteCount = candidate[2];
				  var cell = document.getElementById('vc_'+id);
					if(cell != null){
						cell.innerHTML=voteCount;
					}
				});
		 }
	  return electionInstance.voters(App.account);
	  }).then(function(hasVoted){
		  // Do not allow a user to vote
		  if(hasVoted){
			  $('#content').hide();
		  }
	  });
	  
		$("#content").show();
		$("#loader").hide();
  },

  // render the content of application on the page
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    
    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      //get copy of the deplyoed contract
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        //candidates id
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];//fetch cadidates id
          var name = candidate[1];
          var voteCount = candidate[2];

          var canvasElement = document.getElementById('myChart');          
          var config ={
            type: 'bar',
            data: {
                labels: [name],
                datasets: [{
                  label:'Votes',
                  backgroundColor: ['red','blue'],
                  data:[voteCount,0,10]
                }],
              },
            };
            // var myChart = new Chart(canvasElement,config)
            new Chart(canvasElement,config);
          });
      }
      return electionInstance.voters(App.account);
      }).then(function(hasVoted) {
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
    });
  },
    
};

// initialize the app when the window loads
$(function() {
  $(window).load(function() {
    App.init();
  });
})