pingpoliCandlestickChart.prototype.addTechnicalIndicator = function( indicator )
{
    indicator.onInit( this );
    console.log(this)
    console.log(indicator)
    this.technicalIndicator.push(indicator);
}



function MovingAverage( samples , color , lineWidth )
{
    this.samples = samples;
    this.color = color;
    this.lineWidth = lineWidth;
    this.data = [];
}



// gets triggered whenever the technical indicator is added to the chart class
MovingAverage.prototype.onInit = function( candlestickChart )
{
    for ( var i = 0 ; i < candlestickChart.candlesticks.length ; ++i )
    {
        // average the number of samples
        var avg = 0;
        var counter = 0;
        for ( var j = i ; j > i-this.samples && j >= 0 ; --j )
        {
            avg += candlestickChart.candlesticks[j].close;
            ++counter;
        }
        avg /= counter;
        this.data.push( avg );
    }
}



// gets triggered whenever a new candlestick is added
MovingAverage.prototype.onAddCandlestick = function( candlestickChart , candlestickID )
{
    // average the number of samples
    var avg = 0;
    var counter = 0;
    for ( var i = candlestickID ; i > candlestickID-this.samples && i >= 0 ; --i )
    {
        avg += candlestickChart.candlesticks[i].close;
        ++counter;
    }
    avg /= counter;
    this.data.push( avg );
}



// gets triggered whenever a candlestick is updated
MovingAverage.prototype.onUpdateCandlestick = function( candlestickChart , candlestickID )
{
    // average the number of samples
    var avg = 0;
    var counter = 0;
    for ( var i = candlestickID ; i > candlestickID-this.samples && i >= 0 ; --i )
    {
        avg += candlestickChart.candlesticks[i].close;
        ++counter;
    }
    avg /= counter;
    this.data[candlestickID] = avg;
}



// gets triggered whenever the chart is redrawn
MovingAverage.prototype.draw = function( candlestickChart )
{
    var oldLineWidth = candlestickChart.context.lineWidth;
    candlestickChart.context.lineWidth = this.lineWidth;
    for ( var i = candlestickChart.zoomStartID ; i < this.data.length-1 ; ++i )
    {
        candlestickChart.drawLine( candlestickChart.xToPixelCoords( candlestickChart.candlesticks[i].timestamp ) , candlestickChart.yToPixelCoords( this.data[i] ) , candlestickChart.xToPixelCoords( candlestickChart.candlesticks[i+1].timestamp ) , candlestickChart.yToPixelCoords( this.data[i+1] ) , this.color );
    }
    candlestickChart.context.lineWidth = oldLineWidth;
}