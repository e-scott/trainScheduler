
// Initialize Firebase
var config = {
		apiKey: "AIzaSyDtrACtI46tHEsbrEdwn0O0Xsjie0eEpWo",
		authDomain: "project-train-a8655.firebaseapp.com",
		databaseURL: "https://project-train-a8655.firebaseio.com",
		projectId: "project-train-a8655",
		storageBucket: "project-train-a8655.appspot.com",
		messagingSenderId: "1091203361283"
	  };
	  firebase.initializeApp(config);
  
  var database = firebase.database(); 
  
  function displayMsg(msg) {
	console.log("display error message");
	console.log(msg);
	$("#msg2user").text(msg);
  }
  
  //=================================================================/
  
  var D = false;
  //Start a Timer for Updating the Time until Next Train Arrival
  var interval;
  var updateTimer = 60;
  
  var trainList = [];
  
  //  Button for adding Trains
  $("#add-train-btn").on("click", function (event) {
	event.preventDefault();
  
	// Grabs user input
	var trainName = $("#train-name-input").val().trim();
	var trainDestination = $("#destination-input").val().trim();
	var firstTrainTime = moment($("#first-train-time-input").val().trim(), "hh:mm").format("X");
	var trainFrequency = $("#frequency-input").val().trim();
  
	// Creates local "temporary" object for holding train data
	var newTrain = {
	  trainName: trainName,
	  trainDestination: trainDestination,
	  firstTrainTime: firstTrainTime,
	  trainFrequency: trainFrequency
	};
  
	// Uploads train data to the database
	database.ref().push(newTrain);
  
	// Logs everything to console
	if (D) console.log(newTrain.trainName);
	if (D) console.log(newTrain.trainDestination);
	if (D) console.log(newTrain.firstTrainTime);
	if (D) console.log(newTrain.trainFrequency);
  
	
	alert("Train successfully added");
  
	// Clears all of the text-boxes
	$("#train-name-input").val("");
	$("#destination-input").val("");
	$("#first-train-time-input").val("");
	$("#frequency-input").val("");
  });
  
  
  // Firebase event for adding train to the database and a row in the html when a user adds an entry 
  database.ref().on("child_added", function (childSnapshot) {
  
	if (D) console.log(childSnapshot.val());
  
	// Store everything into a variable.
	if (D) console.log("KEY: " + childSnapshot.key);
	var trainName = childSnapshot.val().trainName;
	var trainDestination = childSnapshot.val().trainDestination;
	var firstTrainTime = childSnapshot.val().firstTrainTime;
	var trainFrequency = childSnapshot.val().trainFrequency;
	var trainKey = childSnapshot.key;
  
	var newTrain = {
	  trainName: trainName,
	  trainDestination: trainDestination,
	  firstTrainTime: firstTrainTime,
	  trainFrequency: trainFrequency,
	  trainKey: trainKey
	};
  
	
	trainList.push(newTrain);
  
	// train Info
	if (D) console.log(trainName);
	if (D) console.log(trainDestination);
	if (D) console.log(firstTrainTime);
	if (D) console.log(trainFrequency);
  
	renderTrainRow(newTrain, trainList.length);
  
	clearInterval(interval);
	interval = setInterval(updateCountdown, 1000);
	// If any errors are experienced, log them to console.
  }, function (errorObject) {
	console.log(`The read failed: ${errorObject.code}`);
  });
  
 
  
  $("#train-table").on("click", ".close", function (event) {
	if (confirm("Do you really want to delete?")) {
	  var key = $(this).attr("data-id");
	  if (D) console.log("delete " + key);
	  database.ref(key).remove();
	}
  });
  
  
  //=============================================================//
  // A Train is being deleted from Firebase
  // Also delete the row
  // As well as the object from the array
  //=============================================================//
  database.ref().on("child_removed", function (childSnapshot) {
	console.log("on child remove");
	console.log(childSnapshot.key);
  
	// Remove the row from the table
	$("#" + childSnapshot.key).remove();
  
	// Remove the data from the array
	var trainI = findObjectIndexByKey(trainList, 'trainKey', childSnapshot.key);
	trainList.slice(trainI, 1);
  }, function (errorObject) {
	console.log("The remove failed: " + errorObject.code);
  });
  
  
  function findObjectIndexByKey(array, key, value) {
	for (var i = 0; i < array.length; i++) {
	  if (array[i][key] === value) {
		return array[i];
	  }
	}
	return null;
  }
  function updateTrainArr() {
	console.log("update Train Arr");
  }
  
  function renderTrainSchedule() {
	$("#train-table > tbody").empty(); // empties out the html
	console.log("renderTrainSchedule");
	// render our trains to the page
	for (var i = 0; i < trainList.length; i++) {
	  console.log(trainList[i]);
	  renderTrainRow(trainList[i], i);
	}
  }
  
  function renderTrainRow(train, i) {
	  
	// First Time (pushed back 1 year to make sure it comes before current time)
	var firstTimeConverted = moment(train.firstTrainTime, "hh:mm").subtract(1, "years");
	if (D) console.log(firstTimeConverted);
  
	// Current Time
	var currentTime = moment();
	if (D) console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
  
	// Difference between the times
	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
	if (D) console.log(`DIFFERENCE IN TIME: ${diffTime}`);
	// Time apart (remainder)
	var tRemainder = diffTime % train.trainFrequency;
	if (D) console.log(tRemainder);
  
	// Minute Until Train
	var tMinutesTillTrain = train.trainFrequency - tRemainder;
	if (D) console.log(`MINUTES TILL TRAIN: ${tMinutesTillTrain}`);
  
	// Next Train
	var nextTrain = moment().add(tMinutesTillTrain, "minutes");
	if (D) console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
	var nextArrival = moment().diff(moment(train.firstTrainTime, "X"), "months");
	if (D) console.log(nextArrival);
  
	// Create the new row
	var newRow = $(`<tr id=' ${train.trainKey}'>`).append(
	  $("<td>").text(train.trainName).addClass("name"),
	  $("<td>").text(train.trainDestination).addClass("destination"),
	  $("<td>").text(train.trainFrequency).addClass('frequency'),
	  $("<td>").text(moment(nextTrain).format("hh:mm")).addClass("nextTrain"),
	  $("<td>").text(tMinutesTillTrain).addClass("minutesTil"),
	  $("<td class='delete'>").html(`<button type='button' data-id='${train.trainKey}' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>`)
	);
  
  
	// Append the new row to the table
	$("#train-table > tbody").append(newRow);
  }
  
  
  function updateCountdown() {
	updateTimer--;
	if (updateTimer <= 0) {
	  updateTilTimes();
	}
  };
  
  //=============================================================================//
  function updateTilTimes() {
	if (D) console.log("updateTilTimes - Update Arrival Times and reset timer");
	renderTrainSchedule();
	updateTimer = 60;
	clearInterval(interval);
	interval = setInterval(updateCountdown, 1000);
  }