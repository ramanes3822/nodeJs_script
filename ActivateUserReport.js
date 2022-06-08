
'use strict';
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
var moment = require('moment');
var nodemailer = require("nodemailer");
//var sftpclient = require('scp2');
var config = require("./config/config.json");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://superAdmin:admin123@10.90.XXXX:27017/admin";///********newupdate */
var count = 0;

//initialize SMTP server
var smtpTransport = nodemailer.createTransport(config.email.smtp) // email transporter

//Setting up date range to retrieve

var toDate, fromDate, resultcount = 0;
var temp = [];
var date1= new Date("2018-12-01T16:00:00.00Z"); var date2= new Date("2018-12-02T16:00:00.00Z");
//var date1= new Date("2018-12-31T16:00:00.00Z"); var date2= new Date("2019-01-01T16:00:00.00Z");
// var toDate = new Date();
// toDate.setHours(0);
// toDate.setMinutes(0);
// toDate.setSeconds(0);
// toDate.setMilliseconds(0);
// var fromDate = new Date(toDate.getTime() - (1000 * 60 * 60 * 24 * config.reportDuration));

// console.log(fromDate);
// console.log(toDate);


// var dateNow = new Date()
// var monthlyFrom = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1, 0, 0, 0)
// var monthlyTo = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0, 23, 59, 59, 999)
// console.log('=========Monthly========');
// console.log(dateNow);
// console.log(monthlyFrom);
// console.log(monthlyTo);



if (process.argv[2] == "monthly") {
    var dateNow = new Date()
    fromDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1, 0, 0, 0)
    toDate = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 1, 0, 0, 0, 0)

} else {
    toDate = new Date();
    toDate.setHours(0);
    toDate.setMinutes(0);
    toDate.setSeconds(0);
    toDate.setMilliseconds(0);
    fromDate = new Date(toDate.getTime() - (1000 * 60 * 60 * 24 * config.reportDuration));

}

console.log(fromDate);
console.log(toDate);


// Connect using MongoClient
MongoClient.connect(/*config.db.*/url,{ useNewUrlParser: true }, function (err, db) {
    var dbo=db.db("OCSServer");
    console.log("Mongodb connected.")
    //for (var i = 0; i < config.reportDuration; i++) {
        fromDate = new Date(toDate.getTime() - (1000 * 60 * 60 * 24));
        //console.log(fromDate);
        //console.log(toDate);
        dbo.collection('appusers').find(
            { 'lastLogin': { $gte: date1, $lt: date2 } }).toArray(function (err, items) {

                console.log("count:" + count)
                if (err) {
                    count++;
                    //Error handling
                    console.log("Mongodb Error. " + err)
                    process.exit();
                } else {
                    // console.log(items)
                    console.log("items.length: " + items.length)

                    for (var i = 0; i < items.length; i++) {
                        //console.log(items[i].lastLogin)
                        //console.log(moment(items[i].lastLogin).format('YYYY-MM-DD').toString())
                        //temp = items[i].msisdn.split(',');
                        if (items[i].msisdn.length > 1) {
                            //console.log("TC Login");
                            for (var j = 0; j < items[i].msisdn.length; j++) {
                                tempItem = {
                                    msisdn: items[i].msisdn[j],
                                    lastLogin: moment(items[i].lastLogin).format('YYYY-MM-DD').toString(),
                                    tc: true,
                                    type: 'HYBRIDAPP'
                                };
                                temp.push(tempItem)
                            }
                        } else {
                            //console.log("Not TC");
                            items[i].msisdn = items[i].msisdn[0];
                            items[i].lastLogin = moment(items[i].lastLogin).format('YYYY-MM-DD').toString();
                            items[i].tc = false;
                            items[i].type = 'HYBRIDAPP';
                            temp.push(items[i])
                        }
                    }
                    //count++;
                    //if (count == items.length) {
                        console.log("Done!")
                        var filename = config.output.filename.replace('##DATE##', moment().format('YYYYMMDD'));
                        console.log(filename)
                        var tempItem = {};
                        var csvWriterCCReload = createCsvWriter({
                            path: config.output.filepath + filename,
                            header: [
                                { id: 'lastLogin', title: 'lastLogin' },
                                { id: 'msisdn', title: 'msisdn' },
                                { id: 'type', title:'type'}
                            ]
                        });

                        // SFTP AR File
                        csvWriterCCReload.writeRecords(temp).then(() => {
                            console.log('CSV Generation Done');

                            //Email
                           /* if (config.email.enabled) {
                                console.log('Email enabled');
                                var mailOptions = {
                                    from: config.email.smtp.sender,
                                    to: config.email.to, // list of receivers
                                    subject: config.email.title.replace('##DATE##', moment().format('YYYYMMDD')), // Subject line
                                    attachments: [{
                                        path: config.output.filepath + filename
                                    }]
                                };
                                smtpTransport.sendMail(mailOptions, function (error, info) {
                                    //console.log('SMTP triggerred')
                                    if (error) {
                                        console.log('Send email failed: ' + error);
                                    } else {
                                        console.log('Send email success');
                                    }
                                    resultcount++;
                                    //check
                                    if (resultcount == 2) {
                                        process.exit();
                                    }
                                });
                            } else*/ //{
                                resultcount++;
                                //check
                                if (resultcount == 2) {
                                    process.exit();
                                }
                           // }
                            //SFTP
                           /* if (config.sftp.enabled) {
                                console.log('Sftp enabled');
                                /*
                                sftpclient.scp(config.output.filepath + filename, {
                                    host: config.sftp.host,
                                    username: config.sftp.username,
                                    password: config.sftp.password,
                                    path: config.sftp.path,
                                }, function (err) {
                                    // console.log(err);
                                    resultcount++;
                                    //check
                                    if (resultcount == 2) {
                                        process.exit();
                                    }
                                })
                            } else*/ 
                            db.close();
                        });
                    //}

                    // //console.log(temp)

                }
            })
        toDate = fromDate;
   // }

});
