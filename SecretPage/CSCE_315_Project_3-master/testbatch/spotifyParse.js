const { ConsoleWriter } = require('istanbul-lib-report');
const { run } = require('jest');
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: '71867be6bcab4119bcb732508e2b028a',
  clientSecret: 'f3efa7924cae49d0979b4adf0ca0ecd8',
});

function test(){
  spotifyApi.getArtistAlbums('3MZsBdqDrRTJihTHQrO6Dq').then(
  function(data) {
    console.log('Artist albums', data.body);
  },
  function(err) {
    console.error(err);
  }
);
}

function test2(){
  spotifyApi.searchArtists('Joji')
  .then(function(data) {

    console.log(data);
    var obj = data.body.artists;
    
    var obj1 = obj["items"];

    for(var i =0; i < obj1.length; i++){
      var obj2 = obj1[i];
      var obj3 = obj2["name"];
      var obj4 = obj2["popularity"];
      console.log(obj3 + " " + obj4);
      
    }
    
  }, function(err) {
    console.error(err);
  });
}
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    //test();
    test2();
  },
  function(err) {
    console.log(
      'Something went wrong when retrieving an access token',
      err.message
    );
  }
);
