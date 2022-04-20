var Amadeus = require('amadeus');
var jsonFile;
var amadeus = new Amadeus({
  clientId: 'MhaKzg2rpz36W1OCUGHtKhy82sAyY60p',
  clientSecret: 'QcMAfDKOvtiwnmGf'
});
amadeus.shopping.hotelOffers.get({
    cityCode:'IAH',
    checkInDate:'2020-10-27',
    roomQuantity:1,
    adults:2,
    radius:5
}).then(function(response){
  //console.log(response.data);
  jsonFile = response;
  if(jsonFile != null){
    hotelList(jsonFile.data);
  }
}).catch(function(responseError){
  console.log(responseError.code);
});

function hotelList(inJSON){
  console.log("Here");
  console.log(inJSON.length);
  for (var i = 0; i < inJSON.length; i++){
    var arrObj = inJSON[i];
    var hotelInfo = arrObj["hotel"];
    var offerInfo = arrObj["offers"];

    console.log(hotelInfo["name"]);
    for(var j = 0; j < offerInfo.length; j++){
      var offerObj = offerInfo[j];
      var priceObj = offerObj["price"];
      var totalObj = priceObj["total"];
      console.log("\t Price : " + totalObj);
    }
  }
}

