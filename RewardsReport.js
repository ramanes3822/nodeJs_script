var mongodb = require('mongodb');
var client = mongodb.MongoClient;
var url = "mongodb://superAdmin:admin123@10.90.0.52:27017/OCSServer?authSource=admin";
var date1 = new Date("2018-12-06T16:00:00.00Z"); var date2 = new Date("2018-12-06T16:10:00.00Z");
var Createcsv = require('csv-writer').createObjectCsvWriter;


client.connect(url, { useNewUrlParser: true }, function (err, db) {
    var dbo = db.db("OCSServer");
    var cursor = dbo.collection("gamificationtransactions").find({
        header: {
            $in: ['Perx Transaction', 'Perx and CPA Transaction']
        },
        'payloadPlaybasisRedeemLog.message': 'issued',
        transactionDate: {
            $gte: date1, $lt: date2
        }
    }, {
            _id: 0,
            transactionDate: 1,
            msisdn: 1,
            productDescription: 1,
            "payloadPlaybasisRedeemLog.raw.data.reward.merchant_name": 1,
            price: 1
        });

    cursor.toArray(function (err, docs) {
        if (err) throw err;
        var map = docs.map(function (it) {

            return {
                TDate: it.transactionDate,
                Msisdn: it.msisdn,
                Product: it.productDescription,
                rewards: it.payloadPlaybasisRedeemLog.raw.data.reward.merchant_name

            }
        });
        console.log(map.length)
        var csvWriter = Createcsv({
            path: "file.csv",
            header: [
                { id: 'TDate', title: 'TransDate' },
                { id: 'Msisdn', title: 'msisdn' },
                { id: 'Product', title: 'Product' },
                { id: 'rewards', title: 'Rewards' }
            ]
        });

        csvWriter.writeRecords(map);

        db.close();
    });
});