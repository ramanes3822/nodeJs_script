var xlsx = require('node-xlsx');
var fs = require('fs');
var moment = require("moment");
var starname='TransactionReport_'+tdxlsfile

var obj = xlsx.parse( __dirname + "/csvFile/");
var rows = [];
var writeStr = "";
var readLine="";
var transactionNumbers="";
var tdxlsfile = moment(todayDate).format("YYYYMMDD");
var todayDate = new Date();

fs.readdir()

