
var http = require('http');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
var nodemailer = require("nodemailer");
var config = require("./config/config.json");
var MongoClient = require('mongodb').MongoClient;
var fs=require('fs');
var url = "mongodb://superAdmin:admin123@10.90.0.52:27017/admin";///********newupdate */
var smtpTransport = nodemailer.createTransport(config.email.smtp);
var csvexp = require('csv-export');

var date1= new Date("2018-12-17T16:00:00.00Z"); var date2= new Date("2018-12-20T16:00:00.00Z");

MongoClient.connect(url,{useNewUrlParser:true},function(err,db){

    var dbo=db.db("OCSServer");
    dbo.collection("subscriptiontransactions").aggregate([
        {$match:{tranxTime:{$gt:date1,$lt:date2}}},
        {$match:{paymentStatus: "Successful",addOnsQtpSkuType:{$nin:['Rewards']}} },
        //{$match:{msisdn:{$in:['60169759085']}}},
        {$unwind:'$addOnsQtpTransaction'},
        {$unwind:'$addOnsQtpTransaction.payload'},
        {$match:{"addOnsQtpTransaction.payload.FeeAmount":{$nin:['0','0.00']}}},
        {$project: {
                _id: 0,
                msisdn: 1,
                Amount   : "$addOnsQtpTransaction.payload.FeeAmount"
            } }
        ]);

});

