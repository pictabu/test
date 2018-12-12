/***
*Create and export configuration variables
**/

//container for all the environments
var environments={};
//staging object (default) environment
environments.staging={
  'httpPort':3000,
  'httpsPort':3001,
  'envName':'staging'
};

//Production environment
environments.production={
  'httpPort':5000,
  'httpsPort':5001,
  'envName':'production'
};
//Determine which environment was passesas a commandline argument
var currentEnvironment=typeof(process.env.NODE_ENV)=='string'?process.env.NODE_ENV.toLowerCase(): '';
//check the current environment if one of the evironments abofe, if not, default to staging
var environmentToExport= typeof(environments[currentEnvironment])=='object'?environments[currentEnvironment]:environments.staging;

//export the module
module.exports=environmentToExport;
