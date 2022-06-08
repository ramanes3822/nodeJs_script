var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://superAdmin:admin123@10.90.0.52:27017/admin";
//var url = "mongodb://superAdmin:admin123@mongodb-mdg:27017,mongodb-mdg-2:27017/OCSServer?replicaSet=prd-rs01"
var csvexp = require('csv-export');
var fs = require('fs');
var nodemailer = require("nodemailer");

//===================================

var results = [];
var resultsToken=[];
var date1 = new Date("2018-10-05T16:00:00.00Z"); var date2 = new Date("2018-11-18T16:00:00.00Z");

//=======================================================
var  month_name  =  function (dt) {
    mlist  =  [
        "Jan",  "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug",  "Sep",  "Oct",  "Nov",  "Dec"
    ]
    return  mlist[dt.getMonth()]
};

var myFileName = "./" + date1.getDate() + "_" + (month_name(date1)) + "_" + date2.getDate() + "_" + (month_name(date2)) + date1.getFullYear() + ".zip";
var datename = date1.getDate() + "_" + (month_name(date1)) + "_" + date2.getDate() + "_" + (month_name(date2)) + date1.getFullYear();

//=======================================================



var msisdnlist = fs.readFileSync('./12097_12099/msisdntest.csv').toString().split(',')
var msisdnquery = { $in: msisdnlist }

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("OCSServer");
    console.log("connected to db");
    console.log(msisdnlist);

    dbo.collection("subscriptiontransactions").aggregate([
        { $match: { tranxTime: { $gte: date1, $lt: date2 }, addOnsQtpSkuType: { $nin: ['Rewards'] }, paymentStatus: 'Successful', msisdn: msisdnquery } }
    ]).forEach(function (doc) {
    
        var msisdn = doc.msisdn;
        var paytype =doc.payType;
        
        var payload0 = doc.addOnsQtpTransaction[0].payload[0];
        var feeAmount = payload0.FeeAmount;
        var offerType = payload0.AddOnType;
        var offerName = payload0.OfferName;

    
        var payload1 = doc.addOnsQtpTransaction[0].payload[1];
        var feeAmount1 = 0;
        var offerType1 = 'null';
        var offerName1 = 'null';

        if (payload1 != null) {
            feeAmount1 = payload1.FeeAmount;
            offerType1 = payload1.AddOnType;
            offerName1 = payload1.OfferName;
        }

        if (typeof feeAmount !== 'number' && typeof feeAmount === 'string') {
            feeAmount = parseFloat(feeAmount);
        }

        if (typeof feeAmount1 !== 'number' && typeof feeAmount1 === 'string') {
            feeAmount1 = parseFloat(feeAmount1);
        }
       

        var offerNameAll = offerName+" & "+ offerName1;
        var offerTypeAll = offerType+" & "+ offerType1;
        var totalAmount = (feeAmount + feeAmount1);


        pdate = doc.tranxTime
        pdate.setHours(pdate.getHours() + 8)
        var FrontDate = pdate.toISOString().slice(0, 10)
        var BackDate = pdate.toISOString().slice(11, 16)
        var fullDate = FrontDate + " " + BackDate

        offerNameAll = offerNameAll.replace(/[,]/g,'');
        offerTypeAll = offerTypeAll.replace(/(undefined)/g,'Default');
        offerTypeAll = offerTypeAll.replace(/( & null)/g,'');
        offerNameAll = offerNameAll.replace(/( & null)/g,'');

        
        if (totalAmount >= 3){
           var tokenEarned = (totalAmount/3).toFixed(0);
        }else tokenEarned = 0;

        results.push({
            'msisdn': msisdn,
            'paytype':paytype,
            'offerType': offerTypeAll,
            'offerName': offerNameAll,
            'TAmount': totalAmount,
            'offerDate': fullDate,
            'Token Earned':tokenEarned
        });

//========================================================== */

function getSum(total, num) {
    return total + num;
}

console.log(totalAmount.reduce(getSum));
console.log(results);
        /*csvexp.export(results, function (buffer) {
            fs.writeFileSync(myFileName, buffer)
        });*/


    });

});




