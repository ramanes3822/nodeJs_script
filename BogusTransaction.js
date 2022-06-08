var http = require('http');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
var config = require("./config/config.json");
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var url = "mongodb://superAdmin:admin123@10.90.0.52:27017/admin";///********newupdate */
//var url = "mongodb://nodejs_app:encrypt@10.90.0.53:27017,10.90.0.52:27017/admin?replicaSet=prd-rs01"

//============================================================================
// var createCsvWriter = require('csv-writer').createObjectCsvWriter;
// var nodemailer = require("nodemailer");
// var config = require("./config/config.json");
// var MongoClient = require('mongodb').MongoClient;
// var fs=require('fs');
// var smtpTransport = nodemailer.createTransport(config.email.smtp);
//=============================================================================
var results = [];
var date1 = new Date("2018-12-05T16:00:00.00Z"); var date2 = new Date("2018-12-06T16:00:00.00Z");

var sDate = new Date();
var shour = sDate.setHours(0);
var smin = sDate.setMinutes(0);
var ssec = sDate.setSeconds(0);
var smillis = sDate.setMilliseconds(0);
//var date1=new Date(smillis);
//var date2=new Date(new Date().getTime());
//var date2 = new Date(new Date().getTime() - (1 * 9 * 60 * 60 * 1000))
//var date1 = new Date(date2.getTime() - (1 * 24 * 60 * 60 * 1000))
console.log("from " + date1);
console.log("until " + date2);
var month_name = function (dt) {
  mlist = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  return mlist[dt.getMonth()]
};

var myFilenamenew = "BogusTransaction";
var myFileName = "BogusTransaction_" + date1.getDate() + "" + (month_name(date1)) + "" + date1.getFullYear() + ".csv";
var datename = date1.getDate() + "_" + (month_name(date1)) + "_" + date2.getDate() + "_" + (month_name(date2)) + date1.getFullYear();

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  var dbo = db.db('OCSServer');
  console.log("connected");

  dbo.collection('paymenttransactions').aggregate([
    { $match: { transactionDate: { $gt: date1, $lt: date2 } } },
    { $match: { statusDesc: { $in: ['Approved', 'Approved_By_iPay88'] }, authCode: '', payType: 'prepaid' } },
    { $sort: { transactionDate: -1 } }
  ]).toArray(function (err, docs) {
    if (err) {
      // error occured
      console.log('error occured', err);
      return;
    }

    console.log('start for loop');
    for (var index = 0; index < docs.length; index++) {
      var doc = docs[index];
      var dt = doc.csgTransaction.transactionDate;
      if (doc.csgTransaction == null) {
        continue;
      }

      dt.setHours(dt.getHours() + 8);
      var FrontDate = dt.toISOString().slice(0, 10);
      var BackDate = dt.toISOString().slice(11, 16);
      var fullDate = FrontDate + " " + BackDate;
      var newAmount = parseFloat(doc.amount);
      newAmount = newAmount > 1000;
      var tempItem = {
        reference: doc.refNo,
        Amount: doc.amount,
        //Namount:newAmount,
        Description: doc.prodDesc,
        UName: doc.userName,
        Email: doc.userEmail,
        Ucontact: doc.userContact,
        Tmsisdn: doc.targetMsisdn,
        csgQry: doc.csgRequeryCount,
        status: doc.statusDesc,
        ptime: fullDate
      };
      results.push(tempItem);
    }
    console.log('finish for loop');
    console.log(results.length);

    // write to csv
    var csvWriterCCReload = createCsvWriter({
      path: config.output.filepath + myFileName,
      header: [
        { id: 'reference', title: 'RefNo' },
        { id: 'Amount', title: 'Amount' },
        { id: 'NAmount', title: 'Amont > 100' },//*************** */
        { id: 'Description', title: 'Description' },
        { id: 'UName', title: 'UserName' },
        { id: 'Email', title: 'UserEmail' },
        { id: 'Ucontact', title: 'UserContact' },
        { id: 'Tmsisdn', title: 'targetMsisdn' },
        { id: 'csgQry', title: 'csgqryCount' },
        { id: 'status', title: 'status' },
        { id: 'ptime', title: 'processTime' }
      ]
    });

    csvWriterCCReload.writeRecords(results).then(() => {
      console.log(results);
      console.log('finished write the csv');

      // smtp
      // var mailOptions = {
      //   from: "noreply@digi.com.my",
      //   // to: "ramanes.ramalingam@accenture.com", // list of receivers
      //   to: "ramanes.ramalingam@accenture.com,HPKHOR@DIGI.COM.MY,marlon.a.viado@accenture.com,WCKOH@DIGI.COM.MY,MLOGES@DIGI.COM.MY,CHEAHCY@DIGI.COM.MY,wong.hiong@DIGI.COM.MY",
      //   subject: "duplicate report for " + myFileName, // Subject line
      //   html: '<p>Hi Team,<br>Kindly Refer to attachement</p>',
      //   attachments: [{
      //     path: config.output.filepath + myFileName
      //   }]
      // };

      // smtpTransport.sendMail(mailOptions, function (error, info) {
      //   console.log('SMTP triggerred')
      //   if (error) {
      //     console.log('Send email failed: ' + error);
      //   } else {
      //     console.log('Send email success');
      //   }
      // });
      //end smtp
//*********Start second function *************/
      var cursor = dbo.collection("paymenttransactions").aggregate([
        { $match: { transactionDate: { $gt: date1, $lt: date2 } } },
        { $match: { payType: 'prepaid', amount: "100.00", statusDesc: 'Approved' } },
        { $group: { _id: { msisdn: '$targetMsisdn', amount: '$amount' }, count: { $sum: 1 } } },
        { $match: { "count": { $gte: 2 } } }
      ]);
      console.log("connected for more than 100 query");
      cursor.toArray(function (err, docs) {
        if (err) throw err;
        var mydoc = docs.map(function (it) {
          return { MSISDN: it._id.msisdn, Amount: it._id.amount, Count: it.count };
        });
        console.log(mydoc);
        const csvWriter = createCsvWriter({
          path: 'file.csv',
          header: [
              {id: 'MSISDN', title: 'msisdn'},
              {id: 'Amount', title: 'amount'},
              {id:'Count',title:'count'}
          ]
      });

      csvWriter.writeRecords(mydoc).then(()=>{console.log("done")});
      });
//*********End second function ***********/
    });

  });



});

