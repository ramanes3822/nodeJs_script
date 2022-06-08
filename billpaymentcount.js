var mongodb=require('mongodb').MongoClient;
//var url="mongodb://superAdmin:admin123@10.xxxx:27017/admin";
var url="mongodb://superAdmin:admin123@10.xxxx:27017/admin";
var moment=require('moment');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;

var Date1=new Date("2019-04-30T16:00:00.00Z");var Date2=new Date("2019-05-31T16:00:00.00Z");
// var todaydate=new Date(new Date().setHours(0,0,0,0));
// var yesterdaydate=new Date(todaydate.getTime()- 1000 * 60 * 60 * 24);
var report=[];

//connect mongo and query
mongodb.connect(url,{useNewUrlParser:true},function (err,db){
    if (err) throw err;
    dbo=db.db("OCSServer");
    console.log("connected to DB")
    console.log("Start querying")
    dbo.collection('paymenttransactions').aggregate([
{$match:{transactionDate: {$gte: Date1,$lt: Date2}}},
{$match:{statusDesc:"Approved",payType:"postpaid"}},
{$project:{_id:0,transactionDate:1}},
]).toArray(function (err,data){
        if (err) throw err;
        for (var i=0; i < data.length; i++){

            var transdate=moment(data[i].transactionDate).format('DD/MM/YYYY');
            //var Amount=parseFloat(data[i].fee);

            report.push({
                transactionDate:transdate,
                countAll:1
            });
        }

var helper = {};
var result = report.reduce(function(res, param) {
var key    = param.transactionDate;
  
  if(!helper[key]) {
    helper[key] = Object.assign({}, param); // create a copy of o
    res.push(helper[key]);
  } else {
    helper[key].countAll += param.countAll;
  }

  return res;
}, []);

console.log(result);
var csvWriteHeadPath=createCsvWriter({
    path:'Billpaymentcount.csv',
    header:[
        {id:'transactionDate',title:'Date'},
        {id:'countAll',title:'TCount'}
    ]
});

csvWriteHeadPath.writeRecords(result).then(()=>{
    console.log('finish write to CSV');
    db.close();
});

    });
});


