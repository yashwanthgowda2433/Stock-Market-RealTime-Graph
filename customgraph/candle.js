const chart = LightweightCharts.createChart(document.getElementById('chart'), { 
    width: 1300, 
    height: 700,
    layout: {
        backgroundColor:'#000000',
        textColor: 'rgba(255,255,255,0.9)',
    },
    grid: {
        vertLines:{
            color:'rgba(197,203,206,0.2)',
        },
        horzLines:{
            color:'rgba(197,203,206,0.2)',
        }
    },

    crosshair:{
        mode:LightweightCharts.CrosshairMode.Normal,
    },
    priceScale:{
        borderColor:'rgba(197,203,206,0.8)',
    },
    timeScale:{
        borderColor:'rgba(197,203,206,0.8)',
    }

});

var candleSeries = chart.addCandlestickSeries({
    upColor:'#006400',
    downColor:'rgb(255, 0, 0)',
    borderDownColor:'rgb(255, 0, 0)',
    borderUpColor:'#006400',
    wickDownColor:'rgb(255, 0, 0)',
    wickUpColor:'#006400'
});

setInterval(function () {
var data = new Array()
var xmlhttp = new XMLHttpRequest();
xmlhttp.open( "GET" , "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m" );
xmlhttp.onreadystatechange = function()
{
    if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) 
    {
        var json = JSON.parse( xmlhttp.responseText );

        for ( var i = 0 ; i < json.length ; ++i )
        {
            // console.log(json[i][0] , json[i][1] , json[i][2] , json[i][3] , json[i][4])
            data.push({ time:json[i][0], open:json[i][1], high:json[i][2], low:json[i][3], close:json[i][4]});
            

        }
        // console.log(data)

        candleSeries.setData(
            data
        )
    }
}
xmlhttp.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
xmlhttp.send();
}, 1000);

 
