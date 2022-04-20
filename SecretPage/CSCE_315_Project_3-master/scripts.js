var inputInfo = {start:"1", end:"1", artist:"ABBA", city:"houston", state:"TX", numPeople:"1"};

function beginSearch(){
  console.log("Verifying #Confirm found: " + ($('#Confirm') != null));
  $('#Confirm').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Loading...').addClass('disabled');
  sessionStorage.setItem("AuthValue", document.getElementById("Author").value);
  sessionStorage.setItem("LocVal", document.getElementById("Location").value);
  sessionStorage.setItem("StaVal", document.getElementById("State").value);
  setTimeout(executeSearch, 50);
  //location.href = "loader.html";
}

function writeError(errorMessage){
  //This is a horrifying monstrosity, but it was the only way I could think to recreate an alert every time a new error appears
  $('#ErrorPlaceholder').html(
    "<div id=\"ErrorMessage\" class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">" + 
      "<div id=\"ErrorMessageText\">" +
        "<strong>Error:</strong>" + errorMessage +
      "</div>" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" + 
        "<span aria-hidden=\"true\">&times;</span>" +
      "</button>" +
    "</div>"
  ); 
  //$('#ErrorMessage').css("display","block");
  return;
}

function executeSearch(){
  inputInfo.artist = sessionStorage.getItem("AuthValue");
  inputInfo.city = sessionStorage.getItem("LocVal");
  inputInfo.state = sessionStorage.getItem("StaVal");
  var trip = callAPIs(inputInfo);
  if(typeof trip === 'string'){
    if(trip.substring(0,5) == "Error"){
      console.log(trip);
      $('#Confirm').html('Search').removeClass('disabled');
      writeError(trip.substring(6));
      return;
    }
  }
  console.log("Back to scripts!");
  for(var i = 0; i < trip.length; i++){
    console.log(trip[i]);
  }
  sessionStorage.setItem("trips", JSON.stringify(trip));
  $('#Confirm').html('Search').removeClass('disabled');
  location.href = "output.html";
}

function writeOutput(element_id, str_update)
{
  console.log("Writing to " + element_id);
  document.getElementById(element_id).innerHTML = str_update; 
}

function finishSearch(){
  var trip = JSON.parse(sessionStorage.getItem("trips"));
  for(var x = 0; x < trip.length; x++){
    var tot_price = 0;
    writeOutput("hotelName" + x, trip[x].hotelName);
    writeOutput("hotelPrice" + x, "$" + trip[x].hotelCost);
    writeOutput("concertName" + x, trip[x].concert + " in " + trip[x].city);
    writeOutput("concertPrice" + x, "$" + trip[x].concertPrice);
    tot_price += parseFloat(trip[x].hotelCost);
    tot_price += parseFloat(trip[x].concertPrice);
    console.log(trip[x]);
    if (trip[x].flightData.length != 0)
    {
      writeOutput("flightPrice" + x, "$" + trip[x].flightCost)
      writeOutput("flightInfo" + x, "Flight number: " + trip[x].flightData[0][0].aircraft.code)
      tot_price += parseFloat(trip[x].flightCost);
    }
    writeOutput("totalPrice" + x, "$" + tot_price.toFixed(2));
  }
}

/*var myVar;

        function myFunction() {
        myVar = setTimeout(showPage, 3000);
        }

        function showPage() {
        document.getElementById("loader").style.display = "none";
        document.getElementById("myDiv").style.display = "block";
        }*/







/*function hideSearchAreaDisplay(){
  console.log("hiding!");
  document.getElementById("user_input").hidden = true;
  document.getElementById("Author").hidden = true;
  document.getElementById("Location").hidden = true;
  document.getElementById("Confirm").hidden = true;
  setDisplayOf("user_input", "none");
  setDisplayOf("Author", "none");
  setDisplayOf("Location", "none");
  setDisplayOf("Confirm", "none");
}

function showSearchAreaDisplay(){
  console.log("Showing!");
  document.getElementById("user_input").hidden = false;
  document.getElementById("Author").hidden = false;
  document.getElementById("Location").hidden = false;
  document.getElementById("Confirm").hidden = false;
  setDisplayOf("user_input", "block");
  setDisplayOf("Author", "inline-block");
  setDisplayOf("Location", "inline-block");
  setDisplayOf("Confirm", "inline-block");
}

function setDisplayOf(object, displayType) {document.getElementById(object).style.display = displayType;}*/