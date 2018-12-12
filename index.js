var http= require('http');
var https= require('https');
var url= require('url');
var fs=require('fs');
var StringDecoder=require('string_decoder').StringDecoder;
var config=require('./config');
var httpServer=http.createServer(function(req,res){
 unifiedServer(req,res);
});
//Here is where we start the server
httpServer.listen(config.httpPort,function(){
  console.log("listening on port "+config.httpPort+" now. In "+config.envName+" mode.");
});
//instantiate the https createServer.
//
var httpsServerOptions={
  'key': fs.readFileSync('./https/key.pem'),
  'cert':fs.readFileSync('./https/cert.pem')
};
var httpsServer=https.createServer(httpsServerOptions,function(req,res){
 unifiedServer(req,res);
});
// start the https server
httpsServer.listen(config.httpsPort,function(){
  console.log("listening on port "+config.httpsPort+" now. In "+config.envName+" mode.");
});
// Al the server logic for both the http and https
var unifiedServer=function(req,res){
  //creates an object with the info of the url
  // control for favicon
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    console.log('favicon requested');
    return;
  }
  var parsedUrl=url.parse(req.url,true);
  var path=parsedUrl.pathname;
  var trimmedPath=path.replace(/^\/+|\/+$/g,'');
  //Get the query string as an object
  var queryStringObject=parsedUrl.query;
  console.log(queryStringObject);
  //get the HTTP Method
  var method=req.method.toLowerCase();
  console.log(method);
  //Get the headers
  var headers=req.headers;
  //Get the payloads
  var decoder=new StringDecoder('utf-8');
  var buffer='';
  req.on('data',function(data){
    buffer+=decoder.write(data);
  });
  req.on('end',function(){
    buffer+=decoder.end();
    //Choose the handler this request should go
    var chosenHandler=typeof(router[trimmedPath])!=='undefined'? router[trimmedPath]:handlers.notFound;
    //Construct the data object to send to the handlers
    var data={
      'trimmedPath':trimmedPath,
      'queryStringObject':queryStringObject,
      'method':method,
      'headers': headers,
      'payload':buffer
    };
    //route the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){
      //user the status code called back by the handler or default
      statusCode=typeof(statusCode)=='number'?statusCode : 200;
      //use the payloads calledback by the handler or default
      payload=typeof(payload)=='object'?payload:{};
      //conver the payload to a string so the user can see it
      var payloadString=JSON.stringify(payload);
      //return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response',statusCode,payloadString);
    });
  });
};
//Define the handlers
var handlers={};
handlers.ping=function(data,callback){
  callback(200);
}
//not found handler
handlers.notFound=function(data,callback){
  callback(404);
};
//Define a request router
var router={
  'ping':handlers.ping
}
