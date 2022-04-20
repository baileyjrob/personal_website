// These input variables are for testing purposes only

// Object to hold all input varialbes
var inputInfo = {start:"1", end:"1", artist:"ABBA", city:"houston", state:"TX", numPeople:"1"};
var spotifyAccessToken;
var amadeusAccessToken;
var airportCodes = "";
var spotifyPlaylist;

var used_trips = [];
var trip = [];

function getSpotifyToken(){
    var request = new XMLHttpRequest();
    request.open('POST', "https://accounts.spotify.com/api/token",false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Authorization", "Basic " + btoa("71867be6bcab4119bcb732508e2b028a:f3efa7924cae49d0979b4adf0ca0ecd8"));
    request.onload = function () {
        var data = JSON.parse(this.response);
        spotifyAccessToken = data.access_token;
    }
    request.send("grant_type=client_credentials");
    
}

function callSpotify(artist){
    var request = new XMLHttpRequest();
    request.open('GET', "https://api.spotify.com/v1/search?q=" + artist + "&type=artist", false);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Bearer " + spotifyAccessToken);
    request.onload = function () {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            if (data.artists.items.length == 0) {
                sendAlert("Error: Could not find the desired artist. Please enter a valid artist.")
            }
            getArtistPlaylist(data.artists.items[0].id);
        
    }
    request.send();
}

function getArtistPlaylist(id){
    var request = new XMLHttpRequest();
    request.open('GET', "https://api.spotify.com/v1/artists/" + id + "/albums?include_groups=album&limit=3", false);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Bearer " + spotifyAccessToken);
    request.onload = function () {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            console.log(data);
            if (data.items.length == 0) {
                errorFlag = true;
                errorMsg = "Error: Could not find any playlists for this artist. Please enter a valid artist."
                return;
            }
            spotifyPlaylist = data.items[0].external_urls.spotify;

    }
    request.send();
}

function getAmadeusToken(){
    var request = new XMLHttpRequest();
    request.open('POST', "https://test.api.amadeus.com/v1/security/oauth2/token",false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function () {
            var data = JSON.parse(this.response);
            amadeusAccessToken = data.access_token;
    }

    request.send("grant_type=client_credentials&client_id=MhaKzg2rpz36W1OCUGHtKhy82sAyY60p&client_secret=QcMAfDKOvtiwnmGf");
    
}

function callAmadeus(city){
    var request = new XMLHttpRequest();
    request.open('GET', "https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=" + city + "&radius=5&checkInDate=2020-11-11", false);
    request.setRequestHeader("Authorization", "Bearer " + amadeusAccessToken);
    request.onload = function () {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            console.log(data);
        
    }
    request.send();

}
function callAmadeusGetHotel(index){
    var request = new XMLHttpRequest();
    request.open('GET', "https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=" + trip[index].destinationCode + "&radius=50&radiusUnit=MILE&checkInDate=" + trip[index].startEnd[0] +"&roomQuantity=1&checkOutDate=" + trip[index].startEnd[1] + "&adults=" + trip[index].numPeople, false);
    request.setRequestHeader("Authorization", "Bearer " + amadeusAccessToken);
    request.onload = function () {
            // Begin accessing JSON data here
            console.log("https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=" + trip[index].destinationCode + "&radius=50&radiusUnit=MILE&checkInDate=" + trip[index].startEnd[0] +"&checkOutDate=" + trip[index].startEnd[1] + "&adults=" + trip[index].numPeople);
            var data = JSON.parse(this.response);
            console.log(data);

            if(data.data.length == 0){
                trip[index].remove = true;
                return;
            }

            var x = 0;
            while(data.data[x] != null && x < 5){
                trip[index].hotelList.push(data.data[x]);
                console.log(x);
                x++;
            }
            //trip[index].hotelCost = data.data[0].offers[0].price.total;  //Removed COst
    }
    request.send();
}

function callAmadeusGetAir(index){
    var request = new XMLHttpRequest();
    request.open('GET', "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=" + trip[index].originCode + "&destinationLocationCode=" + trip[index].destinationCode + "&departureDate=" + trip[index].startEnd[0] + "&returnDate=" + trip[index].startEnd[1]+ "&adults="+ trip[index].numPeople +"&currencyCode=USD", false);
    request.setRequestHeader("Authorization", "Bearer " + amadeusAccessToken);
    request.onload = function () {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            console.log(data);
            //console.log(data.data[0].itineraries[0].segments)
            if(data.data.length == 0){
                trip[index].remove = true;
                return;
            }

            var x = 0;
            var prevPrice = 0;
            var tot = 0;
            while(data.data[x] != null && tot < 5){
                var flightpath = data.data[x];
                var depart = flightpath.itineraries[0].segments[0].departure.at;
                var arrival = flightpath.itineraries[0].segments[flightpath.itineraries[0].segments.length-1].arrival.at;
                var price = flightpath.price.total;
                var carrierCode = flightpath.itineraries[0].segments[0].carrierCode;
                
                if(price == prevPrice){
                    x++;
                    continue;
                }

                var temp = {departure:depart, arrival:arrival, price:price, carrierCode:carrierCode};
                trip[index].flightData.push(temp);
                prevPrice = price;

                tot++;
                x++;
            }
    }
    request.send();
}

function callTicketmaster(artist) {
    var request = new XMLHttpRequest();
    request.open('GET', "https://app.ticketmaster.com/discovery/v2/events.json?size=5&keyword=" + artist + "&classificationName=Music&apikey=mNpCGTnp19Cuf8pbXkMo1Q2eYUnZSBBT", false);
    request.onload = function () {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            console.log(data);
            if(data._embedded == undefined){
                errorFlag = true;
                errorMsg = "Error: Could not find any concerts. Please enter a different artist."
                return;
            }
            var concerts = data._embedded.events;
            if(concerts == undefined){
                sendAlert("Error: There are no upcoming concerts for this artist. Please enter a different artist.");
                return;
            }
            
            for(var x = 0; x < concerts.length && x < 100; x++){
                
                if(!concerts[x]._embedded.hasOwnProperty('attractions')){
                    console.log("skip")
                    continue;
                }

                trip.push({remove:false, numPeople:"", startEnd:[], concertPrice:"", dateConcert:"", flightData:[],playlist:"",concert:"", city:"",country:"", hotelList:[], destinationCode:"", stateCode:"", airportName:"", originCode:"", selectedHotel:0, selectedFlight:0});

                var index = trip.length-1;
                trip[index].concert = concerts[x].name;
                trip[index].dateConcert = concerts[x].dates.start.localDate;
                trip[index].country = concerts[x]._embedded.venues[0].country.countryCode;
                trip[index].city = concerts[x]._embedded.venues[0].city.name;
                if(trip[index].country == "US"){
                    trip[index].stateCode = concerts[x]._embedded.venues[0].state.stateCode;
                }

                //if concert has no price, set to 0
                if(!concerts[index].hasOwnProperty('priceRanges')){
                    trip[index].concertPrice = 0;
                }
                else{
                    trip[index].concertPrice = concerts[x].priceRanges[0].min;
                }     
                
            }
    }
    request.send();
}


function airportCode(city, state, country){

    var allTextLines = airportCodes.split(/\r\n|\n/);
    var firstCode;
    var firstCodeFlag = false;
    var temp = country.toLowerCase();
    var re = new RegExp("^" + temp + "-","g");

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        
        if(data[7].toLowerCase() == city.toLowerCase()){
            return data[9];
        }

        if(data[6].toLowerCase() ==  country.toLowerCase()+ "-"+ state.toLowerCase() && firstCodeFlag == false){
            firstCode = data[9];
            firstCodeFlag = true;
        }
        else if(data[6].toLowerCase().search(re) != -1 && firstCodeFlag == false){
            firstCode = data[9];
        }
    }
    return firstCode;
}
function sendAlert(msg){
    console.log(msg);
    // This function will be called if there is an error (i.e. no concerts for this artist)

    // Bailey: 
    // Write code that will redirect the user back to the home page

    // Canyon:
    // Make an alert and write the error message to it

}
function calculateDate(beforeDays, afterDays, index) {
    var concertDate = trip[index].dateConcert;
    //var concertDate = "2021-04-08";
    var concertDateSplit = concertDate.split('-');
    concertDateSplit[1] = concertDateSplit[1] - 1;

    var dateObj1 = new Date(concertDateSplit[0], concertDateSplit[1], concertDateSplit[2]);
    var dateObj2 = new Date(concertDateSplit[0], concertDateSplit[1], concertDateSplit[2]);

    dateObj1.setDate(dateObj1.getDate() - parseInt(beforeDays));
    dateObj2.setDate(dateObj2.getDate() + parseInt(afterDays));



    var date1 = dateObj1.getFullYear() + "-";
    var date2 = dateObj2.getFullYear() + "-";
    var date1Month = dateObj1.getMonth() + 1;
    var date2Month = dateObj2.getMonth() + 1;
    if (date1Month < 10) {
        date1 = date1 + "0" + date1Month + "-";
    }
    else {
        date1 = date1 + date1Month + "-";
    }
    if (date2Month < 10) {
        date2 = date2 + "0" + date2Month + "-";
    }
    else {
        date2 = date2 + date2Month + "-";
    }
  

    if (dateObj1.getDate() < 10) {
        date1 = date1 + "0" + dateObj1.getDate();
    }
    else {
        date1 = date1 + dateObj1.getDate();
    }
    if (dateObj2.getDate() < 10) {
        date2 = date2 + "0" + dateObj2.getDate();
    }
    else {
        date2 = date2 + dateObj2.getDate();
    }
    
    var finalDates = [date1,date2];
    trip[index].startEnd = finalDates;
}

function calculateDate(beforeDays, afterDays, index) {
    var concertDate = trip[index].dateConcert;
    //var concertDate = "2021-04-08";
    var concertDateSplit = concertDate.split('-');
    concertDateSplit[1] = concertDateSplit[1] - 1;

    var dateObj1 = new Date(concertDateSplit[0], concertDateSplit[1], concertDateSplit[2]);
    var dateObj2 = new Date(concertDateSplit[0], concertDateSplit[1], concertDateSplit[2]);

    dateObj1.setDate(dateObj1.getDate() - parseInt(beforeDays));
    dateObj2.setDate(dateObj2.getDate() + parseInt(afterDays));



    var date1 = dateObj1.getFullYear() + "-";
    var date2 = dateObj2.getFullYear() + "-";
    var date1Month = dateObj1.getMonth() + 1;
    var date2Month = dateObj2.getMonth() + 1;
    if (date1Month < 10) {
        date1 = date1 + "0" + date1Month + "-";
    }
    else {
        date1 = date1 + date1Month + "-";
    }
    if (date2Month < 10) {
        date2 = date2 + "0" + date2Month + "-";
    }
    else {
        date2 = date2 + date2Month + "-";
    }
  

    if (dateObj1.getDate() < 10) {
        date1 = date1 + "0" + dateObj1.getDate();
    }
    else {
        date1 = date1 + dateObj1.getDate();
    }
    if (dateObj2.getDate() < 10) {
        date2 = date2 + "0" + dateObj2.getDate();
    }
    else {
        date2 = date2 + dateObj2.getDate();
    }
    
    var finalDates = [date1,date2];
    trip[index].startEnd = finalDates;
}

function disable_buttons(accordion_index)
{
    for (var x = 0; x < 5; x++)
    {
        document.getElementById("button" + accordion_index + x).disabled = true;
        document.getElementById("button" + accordion_index + x).innerHTML = "Selected";
    }
}

function load_accordion(accordion_index)
{
    writeOutput("type" + accordion_index + 0, "Concert:");
    writeOutput("type" + accordion_index + 1, "Flight:");
    writeOutput("type" + accordion_index + 2, "Hotel:");

    console.log("Load_accordion() -> trip: " + used_trips[accordion_index] + " Accordion: " + accordion_index);
    writeOutput("description" + accordion_index + 0, trip[used_trips[accordion_index]].concert + " in " + trip[used_trips[accordion_index]].city); 
    writeOutput("description" + accordion_index + 1, flightDiscription(used_trips[accordion_index], trip[used_trips[accordion_index]].selectedFlight));
    writeOutput("description" + accordion_index + 2, trip[used_trips[accordion_index]].hotelList[trip[used_trips[accordion_index]].selectedHotel].hotel.name);

    writeOutput("price" + accordion_index + 0, "$" + trip[used_trips[accordion_index]].concertPrice);
    writeOutput("price" + accordion_index + 1, "$" + trip[used_trips[accordion_index]].flightData[trip[used_trips[accordion_index]].selectedFlight].price);
    writeOutput("price" + accordion_index + 2, "$" + trip[used_trips[accordion_index]].hotelList[trip[used_trips[accordion_index]].selectedHotel].offers[0].price.total);

    var row_obj = document.getElementById(id="row" + accordion_index + 3);
    row_obj.style.display = "none";

    row_obj = document.getElementById(id="row" + accordion_index + 4);
    row_obj.style.display = "none";

    disable_buttons(accordion_index);
}

function flightDiscription(trip_num, flight_index)
{
    var flight_str = ""
    var airline = trip[trip_num].flightData[flight_index].carrierCode
    if (airline == "UA")
        flight_str += "United Airlines, ";
    else if (airline == "DL")
        flight_str += "Delta, ";
    else 
        flight_str += "Airline Code: " + airline + ", ";
    
    
    flight_str += trip[trip_num].flightData[flight_index].departure.substring(11, 16) + " - " + trip[trip_num].flightData[flight_index].arrival.substring(11, 16);
    
    flight_str += " (" + trip[trip_num].originCode + " -> " + trip[trip_num].destinationCode + ")";
    
    return flight_str;
}

// updated 11/22 4:40pm
// Upon pressing the search button, send the input to this function
function callAPIs(inputObj){
    $.ajax({
        async: false,
        type: "GET",
        url: "airport-codes_csv.csv",
        dataType: "text",
        success: function(data) {airportCodes = data;}
    });
    
    

    console.log("Start API calls");
    getAmadeusToken();
    getSpotifyToken();
    callSpotify(inputObj.artist);
    
    var inputCityCode = airportCode(inputObj.city, inputObj.state, "xxx");
    callTicketmaster(inputObj.artist);
    
    var x = 0;
    var trips = 0;

    while (trips < 5 && x < trip.length)
    {
        
        trip[x].numPeople = inputObj.numPeople;
        calculateDate(inputObj.start, inputObj.end, x);
        trip[x].playlist = spotifyPlaylist;
        trip[x].originCode = inputCityCode;
        trip[x].destinationCode = airportCode(trip[x].city,trip[x].stateCode,trip[x].country);
        callAmadeusGetHotel(x);
        callAmadeusGetAir(x);

        if (trip[x].remove == false)
        {
            used_trips.push(x);
            var total_price = 0;

            total_price += parseFloat(trip[x].hotelList[0].offers[0].price.total);
            total_price += parseFloat(trip[x].concertPrice);
            total_price += parseFloat(trip[x].flightData[0].price);

            trip[x].tot_price = total_price.toFixed(2).toString();

            if (trip[x].stateCode == "")
            {
                trip[x].stateCode = trip[x].country;
            }

            trips += 1;
        }
    
        x += 1;    
    }
    console.log("Success!");
    sessionStorage.setItem("trips", JSON.stringify(trip));
    sessionStorage.setItem("used_trips", JSON.stringify(used_trips));
    return trip;
}

// updated 11/22 4:40pm
// main output function, return 0 when completed
// var used_trips = [] and var trip = [] are global variables in the file but could be passed as parameters if needed
function call_to_output()
{
    trip = JSON.parse(sessionStorage.getItem("trips"));
    console.log(trip);
    used_trips = JSON.parse(sessionStorage.getItem("used_trips"));
    console.log(used_trips);
    // hide all accordions
    for (var i = 0; i < 5; i++)
    {
        var accordion_obj = document.getElementById("accordion" + i);
        accordion_obj.style.display = "none";
    }

    for (var acc_num = 0; acc_num < used_trips.length; acc_num++)
    {
        var trip_no = used_trips[acc_num];
        // show accordion
        var accordion_obj = document.getElementById("accordion" + acc_num);
        accordion_obj.style.display = "block";

        load_accordion(acc_num);
        console.log("Trip: " + trip_no + " Accordion: " + acc_num);


        //set trip price and name
        writeOutput("tripName" + acc_num, trip[trip_no].concert + " - " + trip[trip_no].city + ", " + trip[trip_no].stateCode + " - (" + trip[trip_no].dateConcert + ") - ");
        writeOutput("totalPrice" + acc_num, "$" + trip[trip_no].tot_price);
    }
    console.log("Output done!");
    
    return 1;
}

function show_hotels(accordion_index)
{
    // hide last 2 rows
    var row_obj = document.getElementById(id="row" + accordion_index + 3);
    row_obj.style.display = "none";
    row_obj = document.getElementById(id="row" + accordion_index + 4);
    row_obj.style.display = "none";

    disable_buttons(accordion_index);

    for (var x = 0; x < trip[used_trips[accordion_index]].hotelList.length; x++)
    {

        if (x == 3 || x == 4)
        {
            var row_obj = document.getElementById(id="row" + accordion_index + x);
            row_obj.style.display = "table-row";
        }

        if (x != trip[used_trips[accordion_index]].selectedHotel)
        {
            document.getElementById("button" + accordion_index + x).disabled = false;
            document.getElementById("button" + accordion_index + x).innerHTML = "Add to Trip";
        }
        
        writeOutput("type" + accordion_index + x, "Hotel:");

        writeOutput("description" + accordion_index + x, trip[used_trips[accordion_index]].hotelList[x].hotel.name);

        writeOutput("price" + accordion_index + x, "$" + trip[used_trips[accordion_index]].hotelList[x].offers[0].price.total);
    }
    console.log("Finished output!");
    return trip;
}

function show_flights(accordion_index)
{
    // hide last 2 rows
    var row_obj = document.getElementById(id="row" + accordion_index + 3);
    row_obj.style.display = "none";
    row_obj = document.getElementById(id="row" + accordion_index + 4);
    row_obj.style.display = "none";

    disable_buttons(accordion_index);

    for (var x = 0; x < trip[used_trips[accordion_index]].flightData.length; x++)
    {
        if (x == 3 || x == 4)
        {
            var row_obj = document.getElementById(id="row" + accordion_index + x);
            row_obj.style.display = "table-row";
        }

        if (x != trip[used_trips[accordion_index]].selectedFlight)
        {
            document.getElementById("button" + accordion_index + x).disabled = false;
            document.getElementById("button" + accordion_index + x).innerHTML = "Add to Trip";
        }

        writeOutput("type" + accordion_index + x, "Flight:");

        writeOutput("description" + accordion_index + x, flightDiscription(used_trips[accordion_index], x));
        //console.log(flightDiscription(used_trips[accordion_index], x));

        writeOutput("price" + accordion_index + x, "$" + trip[used_trips[accordion_index]].flightData[x].price);
    }
}

function add_to_trip(accordion_index, row_index)
{
    document.getElementById("button" + accordion_index + row_index).innerHTML = "Selected";
    document.getElementById("button" + accordion_index + row_index).disabled = true;

    if (document.getElementById("type" + accordion_index + row_index).innerHTML == "Hotel:")
    {
        var total_price = parseFloat(trip[used_trips[accordion_index]].tot_price);
        document.getElementById("button" + accordion_index + trip[used_trips[accordion_index]].selectedHotel).innerHTML = "Add to Trip";
        document.getElementById("button" + accordion_index + trip[used_trips[accordion_index]].selectedHotel).disabled = false;

        total_price -= parseFloat(trip[used_trips[accordion_index]].hotelList[trip[used_trips[accordion_index]].selectedHotel].offers[0].price.total);
        total_price += parseFloat(trip[used_trips[accordion_index]].hotelList[row_index].offers[0].price.total);

        //console.log(total_price);

        trip[used_trips[accordion_index]].tot_price = total_price.toFixed(2).toString();

        writeOutput("totalPrice" + accordion_index, "$" + trip[used_trips[accordion_index]].tot_price);

        trip[used_trips[accordion_index]].selectedHotel = row_index;
    }

    else if (document.getElementById("type" + accordion_index + row_index).innerHTML == "Flight:")
    {
        var total_price = parseFloat(trip[used_trips[accordion_index]].tot_price);
        document.getElementById("button" + accordion_index + trip[used_trips[accordion_index]].selectedFlight).innerHTML = "Add to Trip";
        document.getElementById("button" + accordion_index + trip[used_trips[accordion_index]].selectedFlight).disabled = false;

        total_price -= parseFloat(trip[used_trips[accordion_index]].flightData[trip[used_trips[accordion_index]].selectedFlight].price);
        total_price += parseFloat(trip[used_trips[accordion_index]].flightData[row_index].price);

        //console.log(total_price);

        trip[used_trips[accordion_index]].tot_price = total_price.toFixed(2).toString();

        writeOutput("totalPrice" + accordion_index, "$" + trip[used_trips[accordion_index]].tot_price);

        trip[used_trips[accordion_index]].selectedFlight = row_index;
    }
}

function spotify_button()
{
    window.open(trip[used_trips[0]].playlist);
}

