var array=[
    {Id:"001",qty:1},
    {Id:"002",qty:2},
    {Id:"001",qty:2},
    {Id:"003",qty:4}
    ]


    var result = [];
    array.reduce(function (res, value) {
        if (!res[value.Id]) {
            res[value.Id] = {
                qty: 0,
                Id: value.Id
            };
            result.push(res[value.Id])
        }
        res[value.Id].qty += value.qty
        return res;
        console.log(res)
    }, {});