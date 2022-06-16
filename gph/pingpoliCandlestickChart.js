/*
A single-file JavaScript class to draw candlestick charts.
Use at your own risk.

Copyright 2022 Christian Behler

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

https://twitter.com/pingpoli
https://pingpoli.de
*/
function pingpoliCandlestick( timestamp , open , high , low , close )
{
    this.timestamp = parseInt(timestamp); 
    this.open = parseFloat(open);
    this.high = parseFloat(high);
    this.low = parseFloat(low);
    this.close = parseFloat(close);
}

pingpoliCandlestick.prototype.update = function( open , high , low , close )
{
    this.open = parseFloat(open);
    this.high = parseFloat(high);
    this.low = parseFloat(low);
    this.close = parseFloat(close);
}



function pingpoliCandlestickChart( canvasElementID , options )
{
    if ( options !== undefined ) this.options = options;
    else this.options = {};

    if ( !this.options.hasOwnProperty( "disableGrid" ) ) this.options.disableGrid = false;
    if ( !this.options.hasOwnProperty( "disableLegend" ) ) this.options.disableLegend = false;
    if ( !this.options.hasOwnProperty( "disableLowHighPriceDisplay" ) ) this.options.disableLowHighPriceDisplay = false;
    if ( !this.options.hasOwnProperty( "disableCrosshair" ) ) this.options.disableCrosshair = false;
    if ( !this.options.hasOwnProperty( "disableCurrentMarketPrice" ) ) this.options.disableCurrentMarketPrice = false;
    if ( !this.options.hasOwnProperty( "disablePanningAcceleration" ) ) this.options.disablePanningAcceleration = false;
    if ( !this.options.hasOwnProperty( "allowOverPanning" ) ) this.options.allowOverPanning = false;
    if ( !this.options.hasOwnProperty( "overlayShowTime" ) ) this.options.overlayShowTime = true;
    if ( !this.options.hasOwnProperty( "overlayShowData" ) ) this.options.overlayShowData = true;
    if ( !this.options.hasOwnProperty( "overlayShowChange" ) ) this.options.overlayShowChange = true;
    if ( !this.options.hasOwnProperty( "overlayMode" ) ) this.options.overlayMode = "hover";
    /*
    overlayMode : "click" -> "hover", "none", "none" disables it completely, "hover" is best for mouse, "click" is best for touch, but also works well with a mouse
    fillWidth : true -> the chart will always fill 100% of its parent element width
    fillHeight : true -> the chart will always fill 100% of its parent element height
    backgroundColor : "#000000" -> background color of the chart
    marginLeft, marginRight, marginTop, marginBottom : int -> how much margin at the edges of the chart
    fontSize : 12
    font : "sans-serif" 
    overlayBackgroundColor
    overlayTextColor
    greenColor, redColor, greenHoverColor, redHoverColor
    disableGrid : true -> disables the grid lines
    disableLegend : true -> disables the legend
    xGridCells, yGridCells : int : a rough estimate of how many grid cells there are ( these are only approximations because the grid will align itself to nice numbers near these values )
    gridColor
    gridTextColor
    gridLineStyle : "dashed" "dotted" "solid", default "dotted"
    wickWidth : int (uneven numbers look better), default 1
    wickGreenColor: 
    wickRedColor: 
    disableLowHighPriceDisplay : true, disables the low and high price markers in the chart
    disableCrosshair
    crosshairColor
    crosshairTextColor
    crosshairLineStyle
    scrollZoomSensitivity 20
    touchZoomSensitivity 50 
    panningSensitivity 500 // not used atm because of the 1:1 panning movement
    candleBorderWidth: int: default 0, draws a border around the candles, the color of the border is the wickGreenColor/wickRedColor options
    watermarkImage: default "", no watermark, draws the watermark image in the center of the screen (you probably want to use a png which is fairly transparent)
    overlayShowTime: true
    overlayShowData: true
    overlayShowChange: true
    panningAccelerationDamping
    */

    this.canvas = document.getElementById( canvasElementID );

    this.devicePixelRatio = window.devicePixelRatio || 1;
    console.log( this.devicePixelRatio );

    if ( this.options.hasOwnProperty( "fillWidth" ) && this.options.fillWidth === true )
    {
        var canvasParent = this.canvas.parentElement;
        this.canvas.width = canvasParent.getBoundingClientRect().width * this.devicePixelRatio;
        // this.width = parseInt( this.canvas.width );
        this.width = parseInt( canvasParent.getBoundingClientRect().width );
        this.canvas.style.width = canvasParent.getBoundingClientRect().width+'px';
    }
    else
    {
	    this.width = parseInt( this.canvas.width );
    }

    if ( this.options.hasOwnProperty( "fillHeight" ) && this.options.fillHeight === true )
    {
        var canvasParent = this.canvas.parentElement;
        this.canvas.height = canvasParent.getBoundingClientRect().height * this.devicePixelRatio;
        // this.height = parseInt( this.canvas.height );
        this.height = parseInt( canvasParent.getBoundingClientRect().height );
        this.canvas.style.height = canvasParent.getBoundingClientRect().height+'px';
    }
    else
    {
	    this.height = parseInt( this.canvas.height );
    }

    console.log( this.canvas.width+" x "+this.canvas.height );
    console.log( this.canvas.style.width+" x "+this.canvas.style.height );
    console.log( this.width+" x "+this.height );

    this.context = this.canvas.getContext( "2d" );
    this.context.scale( this.devicePixelRatio , this.devicePixelRatio );

    if ( ( this.options.hasOwnProperty( "fillWidth" ) && this.options.fillWidth === true ) || ( this.options.hasOwnProperty( "fillHeight" ) && this.options.fillHeight === true ) )
    {
        // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
        const resizeObserver = new ResizeObserver( entries =>
        {
            for ( let entry of entries )
            {
                if ( entry.contentBoxSize )
                {
                    // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                    const contentBoxSize = Array.isArray( entry.contentBoxSize ) ? entry.contentBoxSize[0] : entry.contentBoxSize;

                    console.log( contentBoxSize );
    
                    if ( this.options.hasOwnProperty( "fillWidth" ) && this.options.fillWidth === true )
                    {
                        this.canvas.width = contentBoxSize.inlineSize * this.devicePixelRatio;
                        // this.width = parseInt( this.canvas.width );
                        this.width = parseInt( contentBoxSize.inlineSize );
                        this.xPixelRange = this.width-this.marginLeft-this.marginRight;
                        this.canvas.style.width = contentBoxSize.inlineSize+'px';
                    }
                    if ( this.options.hasOwnProperty( "fillHeight" ) && this.options.fillHeight === true )
                    {
                        this.canvas.height = contentBoxSize.blockSize * this.devicePixelRatio;
                        // this.height = parseInt( this.canvas.height );
                        this.height = parseInt( contentBoxSize.blockSize );
                        this.yPixelRange = this.height-this.marginTop-this.marginBottom;
                        this.canvas.style.height = contentBoxSize.blockSize+'px';
                    }

                    this.context = this.canvas.getContext( "2d" );
                    this.context.scale( this.devicePixelRatio , this.devicePixelRatio );

                    console.log( this.canvas.width+" x "+this.canvas.height );
                    console.log( this.canvas.style.width+" x "+this.canvas.style.height );
                    console.log( this.width+" x "+this.height );

                    this.draw();
                }
            }
        } );
    
        // observe the size of the canvas parent element
        var canvasParent = this.canvas.parentElement;
        resizeObserver.observe( canvasParent );
    }

    this.canvas.addEventListener( "mousemove" , ( e ) => {
        this.mouseMove( e );
    } );
    this.canvas.addEventListener( "mouseout" , ( e ) => {
        this.mouseOut( e );
    } );
    this.canvas.addEventListener( "wheel" , ( e ) => {
        this.scroll( e );
        e.preventDefault();
    } );

    // touch controls - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
    this.canvas.addEventListener( "pointerdown" , ( e ) => {
        this.b_dragging = true;
        this.mouseDragStartX = e.offsetX;
        this.mouseDragStartY = e.offsetY;
        e.b_hasBeenMoved = false;
        e.totalMovement = 0.0;
        this.evCache.push( e );
    } );
    this.canvas.addEventListener( "pointermove" , ( e ) => {
        this.pointerMoveEvent( e );
    } );
    this.canvas.addEventListener( "pointerup" , ( e ) => {
        this.pointerUpEvent( e , true );
    } );
    this.canvas.addEventListener( "pointercancel" , ( e ) => {
        this.pointerUpEvent( e , false );
    } );
    this.canvas.addEventListener( "pointerout" , ( e ) => {
        this.pointerUpEvent( e , false );
    } );
    this.canvas.addEventListener( "pointerleave" , ( e ) => {
        this.pointerUpEvent( e , false );
    } );
    // global vars to cache event state
    this.evCache = new Array();
    this.prevDiff = -1;

    this.b_dragging = false;
    this.mouseDragStartX = 0;
    this.mouseDragStartY = 0;
    this.scrollOffsetX = 0;
    this.scrollOffsetXCounter = 0;

    // background color
    if ( this.options && this.options.hasOwnProperty( "backgroundColor" ) ) this.canvas.style.backgroundColor = this.options.backgroundColor;
    else this.canvas.style.backgroundColor = "#252525";
    // font
    if ( !this.options.hasOwnProperty( "fontSize" ) ) this.options.fontSize = 12;
    if ( !this.options.hasOwnProperty( "font" ) ) this.options.font = "sans-serif";
    // grid color
    if ( this.options && this.options.hasOwnProperty( "gridColor" ) ) this.gridColor = this.options.gridColor;
    else this.gridColor = "#444444";
    // grid text color
    if ( this.options && this.options.hasOwnProperty( "gridTextColor" ) ) this.gridTextColor = this.options.gridTextColor;
    else this.gridTextColor = "#aaaaaa";
    // mouse hover background color
    if ( this.options && this.options.hasOwnProperty( "overlayBackgroundColor" ) ) this.overlayBackgroundColor = this.options.overlayBackgroundColor;
    else this.overlayBackgroundColor = "#eeeeee";
    // mouse hover text color
    if ( this.options && this.options.hasOwnProperty( "overlayTextColor" ) ) this.overlayTextColor = this.options.overlayTextColor;
    else this.overlayTextColor = "#000000";
    // green color
    if ( this.options && this.options.hasOwnProperty( "greenColor" ) ) this.greenColor = this.options.greenColor;
    else this.greenColor = "#00cc00";
    // red color
    if ( this.options && this.options.hasOwnProperty( "redColor" ) ) this.redColor = this.options.redColor;
    else this.redColor = "#cc0000";
    // green hover color
    if ( this.options && this.options.hasOwnProperty( "greenHoverColor" ) ) this.greenHoverColor = this.options.greenHoverColor;
    else this.greenHoverColor = "#00ff00";
    // red hover color
    if ( this.options && this.options.hasOwnProperty( "redHoverColor" ) ) this.redHoverColor = this.options.redHoverColor;
    else this.redHoverColor = "#ff0000";
    // wickWidth
    if ( !this.options.hasOwnProperty( "wickWidth" ) ) this.options.wickWidth = 1;
    if ( !this.options.hasOwnProperty( "wickGreenColor" ) ) this.options.wickGreenColor = this.greenColor;
    if ( !this.options.hasOwnProperty( "wickRedColor" ) ) this.options.wickRedColor = this.redColor;

    // crosshair options
    if ( !this.options.hasOwnProperty( "crosshairColor" ) ) this.options.crosshairColor = "#eeeeee";
    if ( !this.options.hasOwnProperty( "crosshairTextColor" ) ) this.options.crosshairTextColor = "#000000";
    if ( !this.options.hasOwnProperty( "crosshairLineStyle" ) ) this.options.crosshairLineStyle = "dashed";


    if ( !this.options.hasOwnProperty( "candleBorderWidth" ) ) this.options.candleBorderWidth = 0;

    // watermark image
    if ( !this.options.hasOwnProperty( "watermarkImage" ) ) this.options.watermarkImage = "";
    this.watermarkImage = null;
    this.b_watermarkImageLoaded = false;
    if ( this.options.watermarkImage !== "" )
    {
        this.watermarkImage = new Image();
        this.watermarkImage.src = this.options.watermarkImage;
        this.watermarkImage.onload = () => {
            this.b_watermarkImageLoaded = true;
        }
    }



    this.context.lineWidth = 1;
    this.candleWidth = 5;

    // margins
    if ( this.options && this.options.hasOwnProperty( "marginLeft" ) ) this.marginLeft = parseInt( this.options.marginLeft );
    else this.marginLeft = 10;
    if ( this.options && this.options.hasOwnProperty( "marginRight" ) ) this.marginRight = parseInt( this.options.marginRight );
    else this.marginRight = 100;
    if ( this.options && this.options.hasOwnProperty( "marginTop" ) ) this.marginTop = parseInt( this.options.marginTop );
    else this.marginTop = 20;
    if ( this.options && this.options.hasOwnProperty( "marginBottom" ) ) this.marginBottom = parseInt( this.options.marginBottom );
    else this.marginBottom = 50;

    // zoom sensitivity
    // scrolling with wheel
    if ( this.options.hasOwnProperty( "scrollZoomSensitivity" ) ) this.scrollZoomSensitivity = this.options.scrollZoomSensitivity;
    else this.scrollZoomSensitivity = 20; 
    // pinch to zoom
    if ( this.options.hasOwnProperty( "touchZoomSensitivity" ) ) this.touchZoomSensitivity = this.options.touchZoomSensitivity;
    else this.touchZoomSensitivity = 50;
    // panning, i.e. moving along the x-axis
    if ( this.options.hasOwnProperty( "panningSensitivity" ) ) this.panningSensitivity = this.options.panningSensitivity;
    else this.panningSensitivity = 500;

    this.yStart = 0;
    this.yEnd = 0;
    this.yRange = 0;
    this.yPixelRange = this.height-this.marginTop-this.marginBottom;
    this.yStartIndex = 0;
    this.yEndIndex = 0;

    this.xStart = 0;
    this.xEnd = 0;
    this.xRange = 0;
    this.xPixelRange = this.width-this.marginLeft-this.marginRight;

    // these are only approximations, the grid will be divided in a way so the numbers are nice
    if ( this.options.hasOwnProperty( "xGridCells" ) ) this.xGridCells = this.options.xGridCells;
    else this.xGridCells = 16;
    if ( this.options.hasOwnProperty( "yGridCells" ) ) this.yGridCells = this.options.yGridCells;
    else this.yGridCells = 16;
    if ( !this.options.hasOwnProperty( "gridLineStyle" ) ) this.options.gridLineStyle = "dotted";

    this.b_drawMouseOverlay = false;
    this.mousePosition = { x: 0 , y: 0 };
    this.xMouseHover = 0;
    this.yMouseHover = 0;
    this.hoveredCandlestickID = 0;
    this.b_moveOverlay = false;
    this.b_pinchZooming = false;

    this.panningDeltaX = 0;
    if ( this.options.hasOwnProperty( "panningAccelerationDamping" ) ) this.panningAccelerationDamping = this.options.panningAccelerationDamping;
    else this.panningAccelerationDamping = 0.975;

    this.panningAtStartCallback = () => {};
    this.panningAtStartCooldown = 0;
    this.panningAtEndCallback = () => {};
    this.panningAtEndCooldown = 0;

    if ( !this.options.hasOwnProperty( "marketPriceLineColor" ) ) this.options.marketPriceLineColor = "#777777";
    if ( !this.options.hasOwnProperty( "marketPriceTextColor" ) ) this.options.marketPriceTextColor = "#ffffff";

    this.marketPriceRect = { x: 0, y: 0, width: 0, height: 0, b_clickable: false };

    this.b_firstDraw = true;

    // when zooming, just start at a later candlestick in the array
    this.zoomStartID = 0;

    this.candlesticks = [];
}



pingpoliCandlestickChart.prototype.clear = function()
{
    this.candlesticks = [];
    this.draw();
}



pingpoliCandlestickChart.prototype.addCandlestick = function( timestamp , open , high , low , close )
{
    // check if all values are numbers (or can be converted to one)
    if ( isNaN( timestamp ) )
    {
        console.log( "ERROR > addCandlestick() > timestamp is not a number: "+timestamp );
        return;
    }
    if ( isNaN( open ) )
    {
        console.log( "ERROR > addCandlestick() > open is not a number: "+timestamp );
        return;
    }
    if ( isNaN( high ) )
    {
        console.log( "ERROR > addCandlestick() > high is not a number: "+high );
        return;
    }
    if ( isNaN( low ) )
    {
        console.log( "ERROR > addCandlestick() > low is not a number: "+low );
        return;
    }
    if ( isNaN( close ) )
    {
        console.log( "ERROR > addCandlestick() > close is not a number: "+close );
        return;
    }

    var candlestick = new pingpoliCandlestick( timestamp , open , high , low , close );

    // don't add candlesticks if the low is bigger than the high
    if ( candlestick.low > candlestick.high ) 
    {
        console.log( "ERROR > addCandlestick() > the low value of this candle is higher than its high value, it won't be added" );
        return;
    }

    // don' t add candlesticks with the same timestamp
    for ( let i = 0 ; i < this.candlesticks.length ; ++i )
    {
        if ( this.candlesticks[i].timestamp == candlestick.timestamp )
        {
            console.log( "ERROR > addCandlestick() > a candlestick with the same timestamp already exists, it won't be added twice" );
            return;
        }
    }

    if ( this.candlesticks.length > 0 )
    {
        if ( candlestick.timestamp < this.candlesticks[0].timestamp )
        {
            this.zoomStartID++;
        }
        if ( candlestick.timestamp > this.candlesticks[this.candlesticks.length-1].timestamp )
        {
            this.zoomStartID++;
            this.scrollOffsetX--;
            this.scrollOffsetXCounter--;
            if ( this.zoomStartID > this.candlesticks.length-50 )
            {
                this.zoomStartID = this.candlesticks.length-50;
            }
            if ( this.zoomStartID+this.scrollOffsetX < 0 )
            {
                this.scrollOffsetX = -this.zoomStartID;
                this.scrollOffsetXCounter = -this.zoomStartID;
            }
        }
    }

    // add the candlestick
    this.candlesticks.push( candlestick );

    // sort the candlesticks according to their timestamps
    this.candlesticks.sort( ( a , b ) => {
        if ( a.timestamp < b.timestamp ) return -1;
        if ( a.timestamp > b.timestamp ) return 1;
        return 0;
    } );
}



pingpoliCandlestickChart.prototype.updateCandlestick = function( timestamp , open , high , low , close )
{
    if ( this.candlesticks.length == 0 ) return;

    var lastCandlestick = this.candlesticks[this.candlesticks.length-1];
    // check if the candlestick already exists in the chart
    if ( lastCandlestick.timestamp == timestamp )
    {
        lastCandlestick.update( open , high , low , close );
    }
    else
    {
        // if the candlestick does not exist in the chart, add a new one
        this.addCandlestick( new pingpoliCandlestick( timestamp , open , high , low , close ) );
    }
    // update the chart
    this.draw();
}



pingpoliCandlestickChart.prototype.mouseMove = function( e )
{
    if ( this.candlesticks.length == 0 ) return;

    if ( this.options.overlayMode === "hover" )
    {
        this.updateOverlay( e );
    }
}



pingpoliCandlestickChart.prototype.mouseOut = function( e )
{
    if ( this.options.overlayMode === "hover" )
    {
        this.b_drawMouseOverlay = false;
        this.draw();
    }
}



pingpoliCandlestickChart.prototype.scroll = function( e )
{
    // disable zooming while the overlay is active
    //if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay ) return;

    var currentZoomRange = this.candlesticks.length-this.zoomStartID;
    if ( e.deltaY < 0 )
    {
        if ( this.candlesticks.length > 50 )
        {
            this.zoomStartID += currentZoomRange/this.scrollZoomSensitivity;
            this.zoomStartID = Math.floor( this.zoomStartID );
            if ( this.zoomStartID > this.candlesticks.length-50 ) this.zoomStartID = this.candlesticks.length-50;
        }
    }
    else 
    {
        this.zoomStartID -= currentZoomRange/this.scrollZoomSensitivity;
        this.zoomStartID = Math.floor( this.zoomStartID );
        if ( this.zoomStartID < 0 ) this.zoomStartID = 0;
    }
    this.limitScrollOffset();

    if ( this.options.overlayMode === "hover" )
    {
        this.updateOverlay( e );
    }
    else if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay )
    {
        this.moveOverlay( e );
    }
    else this.draw();
}



pingpoliCandlestickChart.prototype.pointerMoveEvent = function( e )
{
    // find this event in the cache and update its record with this event
    for ( var i = 0 ; i < this.evCache.length ; i++ )
    {
        if ( e.pointerId == this.evCache[i].pointerId )
        {
            var totalMovement = this.evCache[i].totalMovement;
            var dx = Math.abs( this.evCache[i].clientX - e.clientX );
            var dy = Math.abs( this.evCache[i].clientY - e.clientY );
            this.evCache[i] = e;
            this.evCache[i].b_hasBeenMoved = true;
            // count the total movement of the event (0 movement for detecting a click on a touch device is a bit tricky, so we should count very small movements as clicks as well)
            var distance = Math.sqrt( dx*dx + dy*dy );
            this.evCache[i].totalMovement = totalMovement + distance;
            break;
        }
    }

    // if two pointers are down, check for pinch gestures
    if ( this.evCache.length == 2 )
    {
        // disable pinch to zoom while the overlay is active
        // if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay )
        // {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     return;
        // }

        // calculate the distance between the two pointers
        var curDiff = Math.abs( this.evCache[0].clientX - this.evCache[1].clientX );

        if ( this.prevDiff > 0 )
        {
            var currentZoomRange = this.candlesticks.length-this.zoomStartID;
            if ( curDiff > this.prevDiff )
            {
                if ( this.candlesticks.length > 50 )
                {
                    this.zoomStartID += currentZoomRange/this.touchZoomSensitivity;
                    this.zoomStartID = Math.floor( this.zoomStartID );
                    if ( this.zoomStartID > this.candlesticks.length-50 ) this.zoomStartID = this.candlesticks.length-50;
                }
                this.limitScrollOffset();
                if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay )
                {
                    this.moveOverlay( e );
                }
                this.draw();
            }
            if ( curDiff < this.prevDiff )
            {
                this.zoomStartID -= currentZoomRange/this.touchZoomSensitivity;
                this.zoomStartID = Math.floor( this.zoomStartID );
                if ( this.zoomStartID < 0 ) this.zoomStartID = 0;
                this.limitScrollOffset();
                if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay )
                {
                    this.moveOverlay( e );
                }
                this.draw();
            }
        }

        this.prevDiff = curDiff;
        this.b_pinchZooming = true;

        e.preventDefault();
        e.stopPropagation();
        return;
    }

    if ( this.evCache.length == 1 )
    {
        // if this a leftover from pinch zooming, e.g. one finger is released slower then the other one, just do nothing until both fingers have left the surface
        if ( this.b_pinchZooming )
        {   
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // update the overlay via dragging when the overlay is active
        if ( this.options.overlayMode === "click" && this.b_drawMouseOverlay )
        {
            // only trigger this after a somewhat significant movement (otherwise messy touch events would trigger this as well)
            if ( this.evCache[i].totalMovement > 10 )
            {
                this.updateOverlay( e );
            }
            return;
        }

        if ( this.candlesticks.length > 1 )
        {
            // calculate how many pixels are between two candles
            var pixelDifference = this.xToPixelCoords(this.candlesticks[1].timestamp)-this.xToPixelCoords(this.candlesticks[0].timestamp);

            // var currentZoomRange = this.candlesticks.length-this.zoomStartID;
            this.panningDeltaX = Math.floor( e.offsetX-this.mouseDragStartX );
            // this.scrollOffsetXCounter -= this.panningDeltaX*(currentZoomRange/this.panningSensitivity);
            this.scrollOffsetXCounter -= this.panningDeltaX/pixelDifference;
            this.scrollOffsetX = Math.floor( this.scrollOffsetXCounter );
            this.mouseDragStartX = e.offsetX;
            

            // var currentZoomRange = this.candlesticks.length-this.zoomStartID;
            // this.panningDeltaX = Math.floor( e.offsetX-this.mouseDragStartX );
            // this.scrollOffsetXCounter -= this.panningDeltaX*(currentZoomRange/this.panningSensitivity);
            // this.scrollOffsetX = Math.floor( this.scrollOffsetXCounter );
            // this.mouseDragStartX = e.offsetX;

            this.limitScrollOffset();
            this.draw();
        }

        e.preventDefault();
        e.stopPropagation();
        return;
    }
}



pingpoliCandlestickChart.prototype.pointerUpEvent = function( e , b_pointerUpEvent )
{
    for ( var i = 0 ; i < this.evCache.length ; i++ )
    {
        if ( this.evCache[i].pointerId == e.pointerId )
        {
            // it's only a click if the pointer has not been moved (or moved very little) since its down event
            if ( !this.evCache[i].b_hasBeenMoved || this.evCache[i].totalMovement < 20 )
            {
                this.click( e );
            }
            this.evCache.splice( i , 1 );
            break;
        }
    }
  
    if ( this.evCache.length < 2 )
    {
        this.prevDiff = -1;
    }

    if ( this.evCache.length == 0 )
    {
        if ( b_pointerUpEvent )
        {
            if ( this.b_pinchZooming === false )
            {
                if ( this.options.disablePanningAcceleration === false )
                {
                    if ( Math.abs(this.panningDeltaX) > 1 )
                    {
                        var currentZoomRange = this.candlesticks.length-this.zoomStartID;
                        this.scrollOffsetXCounter -= this.panningDeltaX*(currentZoomRange/this.panningSensitivity);
                        this.scrollOffsetX = Math.floor( this.scrollOffsetXCounter );            
                        this.limitScrollOffset();
                        this.draw();

                        setTimeout( () => { this.panningAccelerationLoop() } , 20 );
                    }
                }
            }
        }
        this.b_dragging = false;
        this.b_pinchZooming = false;
    }

    e.preventDefault();
    e.stopPropagation();
}



pingpoliCandlestickChart.prototype.panningAccelerationLoop = function()
{
    this.panningDeltaX *= this.panningAccelerationDamping;

    var currentZoomRange = this.candlesticks.length-this.zoomStartID;
    this.scrollOffsetXCounter -= this.panningDeltaX*(currentZoomRange/this.panningSensitivity);
    this.scrollOffsetX = Math.floor( this.scrollOffsetXCounter );            
    this.limitScrollOffset();
    this.draw();

    if ( Math.abs( this.panningDeltaX ) > 0.5 )
    {
        setTimeout( () => { this.panningAccelerationLoop() } , 20 );
    }
}



pingpoliCandlestickChart.prototype.click = function( e )
{
    // check if the market price marker is clicked
    // var marketPrice = this.candlesticks[this.candlesticks.length-1].close;
    var getMousePos = ( e ) =>
    {
        var rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX-rect.left , y: e.clientY-rect.top };
    }
    var mousePosition = getMousePos( e );
    // var str = marketPrice+" >";
    // var textWidth = this.context.measureText( str ).width;
    // var markerXPos = this.width-this.width/2-textWidth-10;
    // var markerYPos = this.yToPixelCoords(marketPrice)-this.options.fontSize/2-2;
    if ( this.marketPriceRect.b_clickable )
    {
        if ( mousePosition.x > this.marketPriceRect.x && mousePosition.x < this.marketPriceRect.x+this.marketPriceRect.width )
        {
            if ( mousePosition.y > this.marketPriceRect.y && mousePosition.y < this.marketPriceRect.y+this.marketPriceRect.height )
            {
                this.scrollOffsetX = 0;
                this.scrollOffsetXCounter = 0;
                this.draw();
                return;
            }
        }
    }

    if ( this.options.overlayMode === "click" )
    {
        if ( !this.b_drawMouseOverlay )
        {
            this.updateOverlay( e );
        }
        else
        {
            this.b_drawMouseOverlay = false;
            this.draw();
        }
    }
}



// this function updates the overlay and its position, i.e. a new candle is focussed
pingpoliCandlestickChart.prototype.updateOverlay = function( e )
{
    var getMousePos = ( e ) =>
    {
        var rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX-rect.left , y: e.clientY-rect.top };
    }
    this.mousePosition = getMousePos( e );
    this.mousePosition.x += this.candleWidth/2;
    this.b_drawMouseOverlay = true;
    if ( this.mousePosition.x < this.marginLeft ) this.b_drawMouseOverlay = false;
    if ( this.mousePosition.x > this.width-this.marginRight+this.candleWidth ) this.b_drawMouseOverlay = false;
    if ( this.mousePosition.y > this.height-this.marginBottom ) this.b_drawMouseOverlay = false;
    if ( this.b_drawMouseOverlay )
    {
        this.yMouseHover = this.yToValueCoords( this.mousePosition.y );
        this.overlayPriceValue = this.roundPriceValue( this.yMouseHover );
        this.xMouseHover = this.xToValueCoords( this.mousePosition.x );
        // snap to candlesticks
        var candlestickDelta = this.candlesticks[1].timestamp-this.candlesticks[0].timestamp;
        this.hoveredCandlestickID = Math.floor((this.xMouseHover-this.candlesticks[0].timestamp)/candlestickDelta);
        this.xMouseHover = Math.floor(this.xMouseHover/candlestickDelta)*candlestickDelta;
        this.mousePosition.x = this.xToPixelCoords( this.xMouseHover );
        this.draw();
    }
    else this.draw();
}



// this function only moves the overlay on the chart and the same candle remains focussed
pingpoliCandlestickChart.prototype.moveOverlay = function( e )
{
    if ( this.b_drawMouseOverlay )
    {
        this.b_moveOverlay = true;
        // the actual moving is done in the draw function, because it needs to happen after rescaling
        this.draw();
    }
}



pingpoliCandlestickChart.prototype.limitScrollOffset = function()
{
    if ( this.zoomStartID+this.scrollOffsetX < 0 )
    {
        this.scrollOffsetX = -this.zoomStartID;
        this.scrollOffsetXCounter = -this.zoomStartID;
        // don't call the callback more than once per second
        if ( Date.now() > this.panningAtStartCooldown )
        {
            this.panningAtStartCallback();
            this.panningAtStartCooldown = Date.now()+1000;
            console.log( "panning at start" );
        }
    }
    if ( this.options.allowOverPanning )
    {
        var currentZoomRange = this.candlesticks.length-this.zoomStartID;
        if ( this.scrollOffsetX > Math.floor(currentZoomRange/2) )
        {
            this.scrollOffsetX = Math.floor(currentZoomRange/2);
            this.scrollOffsetXCounter = Math.floor(currentZoomRange/2);
            // don't call the callback more than once per second
            if ( Date.now() > this.panningAtEndCooldown )
            {
                this.panningAtEndCallback();
                this.panningAtEndCooldown = Date.now()+1000;
                console.log( "panning at end" );
            }
        }
    }
    else
    {
        if ( this.scrollOffsetX > 0 )
        {
            this.scrollOffsetX = 0;
            this.scrollOffsetXCounter = 0;
            // don't call the callback more than once per second
            if ( Date.now() > this.panningAtEndCooldown )
            {
                this.panningAtEndCallback();
                this.panningAtEndCooldown = Date.now()+1000;
                console.log( "panning at end" );
            }
        }
    }
}



pingpoliCandlestickChart.prototype.draw = function()
{
	// clear background
	this.context.clearRect( 0 , 0 , this.width , this.height );
    // set the font
    this.context.font = this.options.fontSize+"px "+this.options.font;

    // watermark image
    if ( this.watermarkImage !== null && this.b_watermarkImageLoaded )
    {
        var x = (this.width  - this.watermarkImage.width ) * 0.5;
        var y = (this.height - this.watermarkImage.height) * 0.5;

        this.context.drawImage( this.watermarkImage , x , y );
    }

    if ( this.candlesticks.length == 0 ) return;

    // on the first draw, set the zoom and pan/scroll to the end
    if ( this.b_firstDraw )
    {
        this.zoomStartID = this.candlesticks.length-200;
        if ( this.zoomStartID < 0 ) this.zoomStartID = 0;
        this.scrollOffsetX = 0;
        this.scrollOffsetXCounter = 0;
        this.b_firstDraw = false;
    }

    this.calculateYRange();
    this.calculateXRange();

    if ( this.options.disableGrid === false )
    {
        this.drawGrid();
    }

    this.candleWidth = Math.floor( this.xPixelRange/(this.candlesticks.length-this.zoomStartID) );
    this.candleWidth--;
    if ( this.candleWidth%2 == 0 ) this.candleWidth--;

    var b_lastCandleIsVisible = false;
    for ( var i = this.zoomStartID+this.scrollOffsetX ; i < this.candlesticks.length+this.scrollOffsetX ; ++i )
    {
        if ( i >= this.candlesticks.length ) continue;

        if ( i == this.candlesticks.length-1 ) b_lastCandleIsVisible = true;

        var color = ( this.candlesticks[i].close > this.candlesticks[i].open ) ? this.options.wickGreenColor : this.options.wickRedColor;

        // if ( i == this.hoveredCandlestickID )
        // {
        //     if ( color == this.greenColor ) color = this.greenHoverColor;
        //     else if ( color == this.redColor ) color = this.redHoverColor;
        // }

        // draw the wick
        this.context.lineWidth = this.options.wickWidth;
        this.drawLine( Math.floor(this.xToPixelCoords( this.candlesticks[i].timestamp )) , Math.floor(this.yToPixelCoords( this.candlesticks[i].low )) , Math.floor(this.xToPixelCoords( this.candlesticks[i].timestamp )) , Math.floor(this.yToPixelCoords( this.candlesticks[i].high )) , color );

        // candle color
        color = ( this.candlesticks[i].close > this.candlesticks[i].open ) ? this.greenColor : this.redColor;
        if ( i == this.hoveredCandlestickID )
        {
            if ( color == this.greenColor ) color = this.greenHoverColor;
            else if ( color == this.redColor ) color = this.redHoverColor;
        }

        // draw the candle
        this.fillRect( Math.floor(this.xToPixelCoords( this.candlesticks[i].timestamp ))-Math.floor( this.candleWidth/2 ) , Math.floor(this.yToPixelCoords( this.candlesticks[i].open )) , this.candleWidth , Math.floor(this.yToPixelCoords( this.candlesticks[i].close ) - this.yToPixelCoords( this.candlesticks[i].open )) , color );
        // candle border
        if ( this.options.candleBorderWidth > 0 )
        {
            color = ( this.candlesticks[i].close > this.candlesticks[i].open ) ? this.options.wickGreenColor : this.options.wickRedColor;

            this.context.lineWidth = this.options.candleBorderWidth;
            this.drawRect( Math.floor(this.xToPixelCoords( this.candlesticks[i].timestamp ))-Math.floor( this.candleWidth/2 ) , Math.floor(this.yToPixelCoords( this.candlesticks[i].open )) , this.candleWidth , Math.floor(this.yToPixelCoords( this.candlesticks[i].close ) - this.yToPixelCoords( this.candlesticks[i].open )) , color );
            this.context.lineWidth = 1;
        }
    }
    this.context.lineWidth = 1;

    if ( this.options.disableLegend === false )
    {
        this.drawLegend();
    }

    // draw price high
    if ( this.options.disableLowHighPriceDisplay === false )
    {
        this.context.fillStyle = this.gridTextColor;
        var highPriceStrWidth = this.context.measureText( this.yEnd ).width;
        var highPriceXPos = Math.floor( this.xToPixelCoords( this.candlesticks[this.yEndIndex].timestamp ) );
        if ( highPriceXPos+highPriceStrWidth+20 > this.width )
        {
            highPriceXPos -= (highPriceStrWidth+20);
            this.drawLine( highPriceXPos+highPriceStrWidth+5 , Math.floor(this.yToPixelCoords(this.yEnd)) , highPriceXPos+highPriceStrWidth+20-1 , Math.floor(this.yToPixelCoords(this.yEnd)) , this.gridTextColor );
            this.context.fillText( this.yEnd , highPriceXPos , Math.floor(this.yToPixelCoords(this.yEnd))+this.options.fontSize/2 );
        }
        else
        {
            this.drawLine( highPriceXPos+1 , Math.floor(this.yToPixelCoords(this.yEnd)) , highPriceXPos+15 , Math.floor(this.yToPixelCoords(this.yEnd)) , this.gridTextColor );
            this.context.fillText( this.yEnd , highPriceXPos+20 , Math.floor(this.yToPixelCoords(this.yEnd))+this.options.fontSize/2 );
        }
        // and price low
        var lowPriceStrWidth = this.context.measureText( this.yStart ).width;
        var lowPriceXPos = Math.floor( this.xToPixelCoords( this.candlesticks[this.yStartIndex].timestamp ) );
        if ( lowPriceXPos+lowPriceStrWidth+20 > this.width )
        {
            lowPriceXPos -= (lowPriceStrWidth+20);
            this.drawLine( lowPriceXPos+lowPriceStrWidth+5 , Math.floor(this.yToPixelCoords(this.yStart)) , lowPriceXPos+lowPriceStrWidth+20-1 , Math.floor(this.yToPixelCoords(this.yStart)) , this.gridTextColor );
            this.context.fillText( this.yStart , lowPriceXPos , Math.floor(this.yToPixelCoords(this.yStart))+this.options.fontSize/2 );
        }
        else
        {
            this.drawLine( lowPriceXPos+1 , Math.floor(this.yToPixelCoords(this.yStart)) , lowPriceXPos+15 , Math.floor(this.yToPixelCoords(this.yStart)) , this.gridTextColor );
            this.context.fillText( this.yStart , lowPriceXPos+20 , Math.floor(this.yToPixelCoords(this.yStart))+this.options.fontSize/2 );
        }
    }

    // current market price
    if ( this.options.disableCurrentMarketPrice === false )
    {
        var currentMarketPrice = this.candlesticks[this.candlesticks.length-1].close

        this.context.setLineDash( [2,2] );

        if ( b_lastCandleIsVisible )
        {
            // line from the candle to the marker at the y-axis
            this.drawLine( this.xToPixelCoords(this.candlesticks[this.candlesticks.length-1].timestamp)+this.candleWidth , this.yToPixelCoords(currentMarketPrice) , this.width , this.yToPixelCoords(currentMarketPrice) , this.options.marketPriceLineColor );

            var color = ( this.candlesticks[this.candlesticks.length-1].close > this.candlesticks[this.candlesticks.length-1].open ) ? this.greenColor : this.redColor;

            // marker at the y-axis
            var textWidth = this.context.measureText( currentMarketPrice ).width;
            this.fillRect( this.width-textWidth-10 , this.yToPixelCoords(currentMarketPrice)-this.options.fontSize/2-2 , textWidth+10 , this.options.fontSize+4 , color );
            this.context.fillStyle = this.options.marketPriceTextColor;
            this.context.fillText( currentMarketPrice , this.width-textWidth-5 , this.yToPixelCoords(currentMarketPrice)+this.options.fontSize/2-2 );

            this.marketPriceRect.b_clickable = false;
        }
        else
        {
            var str = currentMarketPrice+" >";
            var textWidth = this.context.measureText( str ).width;

            // if the current market price is bigger than the biggest y value
            if ( currentMarketPrice > this.yEnd )
            {
                var xPos = this.width-this.width/2-textWidth;
                var yPos = 20;

                // line forward a bit
                this.drawLine( xPos , yPos , xPos+100 , yPos , this.options.marketPriceLineColor );
                // and then up
                this.drawLine( xPos+100 , yPos , xPos+100 , 0 , this.options.marketPriceLineColor );

                // marker in the middle
                this.fillRect( xPos-10 , yPos-this.options.fontSize/2-2 , textWidth+10 , this.options.fontSize+4 , this.options.marketPriceLineColor );
                this.context.fillStyle = this.options.marketPriceTextColor;
                this.context.fillText( str , xPos-5 , yPos+this.options.fontSize/2-2 );

                this.marketPriceRect.x = xPos-10;
                this.marketPriceRect.y = yPos-this.options.fontSize/2-2;
                this.marketPriceRect.width = textWidth+10;
                this.marketPriceRect.height = this.options.fontSize+4;
                this.marketPriceRect.b_clickable = true;
            }
            // if the current market price is smaller than the lowest y value
            else if ( currentMarketPrice < this.yStart )
            {
                var xPos = this.width-this.width/2-textWidth;
                var yPos = this.height-this.marginBottom;

                // line forward a bit
                this.drawLine( xPos , yPos , xPos+100 , yPos , this.options.marketPriceLineColor );
                // and then down
                this.drawLine( xPos+100 , yPos , xPos+100 , this.height , this.options.marketPriceLineColor );

                // marker in the middle
                this.fillRect( xPos-10 , yPos-this.options.fontSize/2-2 , textWidth+10 , this.options.fontSize+4 , this.options.marketPriceLineColor );
                this.context.fillStyle = this.options.marketPriceTextColor;
                this.context.fillText( str , xPos-5 , yPos+this.options.fontSize/2-2 );

                this.marketPriceRect.x = xPos-10;
                this.marketPriceRect.y = yPos-this.options.fontSize/2-2;
                this.marketPriceRect.width = textWidth+10;
                this.marketPriceRect.height = this.options.fontSize+4;
                this.marketPriceRect.b_clickable = true;
            }
            else
            {
                // line across the screen
                this.drawLine( 0 , this.yToPixelCoords(currentMarketPrice) , this.width , this.yToPixelCoords(currentMarketPrice) , this.options.marketPriceLineColor );

                // marker in the middle
                this.fillRect( this.width-this.width/2-textWidth-10 , this.yToPixelCoords(currentMarketPrice)-this.options.fontSize/2-2 , textWidth+10 , this.options.fontSize+4 , this.options.marketPriceLineColor );
                this.context.fillStyle = this.options.marketPriceTextColor;
                this.context.fillText( str , this.width-this.width/2-textWidth-5 , this.yToPixelCoords(currentMarketPrice)+this.options.fontSize/2-2 );

                this.marketPriceRect.x = this.width-this.width/2-textWidth-10;
                this.marketPriceRect.y = this.yToPixelCoords(currentMarketPrice)-this.options.fontSize/2-2;
                this.marketPriceRect.width = textWidth+10;
                this.marketPriceRect.height = this.options.fontSize+4;
                this.marketPriceRect.b_clickable = true;
            }
        }

        this.context.setLineDash( [] );
    }

    // draw overlay
    if ( this.b_drawMouseOverlay )
    {
        if ( this.b_moveOverlay )
        {
            this.mousePosition.x = this.xToPixelCoords( this.xMouseHover );
            this.mousePosition.y = this.yToPixelCoords( this.overlayPriceValue );
            this.b_moveOverlay = false;
        }

        // crosshair
        if ( this.options.disableCrosshair === false )
        {
            if ( this.options.crosshairLineStyle == "dashed" )
            {
                this.context.setLineDash( [5,5] );
            }
            else if ( this.options.crosshairLineStyle == "dotted" )
            {
                this.context.setLineDash( [2,2] );
            }
            else
            {
                this.context.setLineDash( [] );
            }

            // price line
            // this.context.setLineDash( [5,5] );
            this.drawLine( 0 , this.mousePosition.y , this.width , this.mousePosition.y , this.options.crosshairColor );
            // this.context.setLineDash( [] );
            var str = this.overlayPriceValue;
            var textWidth = this.context.measureText( str ).width;
            this.fillRect( this.width-textWidth-10 , this.mousePosition.y-this.options.fontSize/2-2 , textWidth+10 , this.options.fontSize+4 , this.options.crosshairColor );
            this.context.fillStyle = this.options.crosshairTextColor;
            this.context.fillText( str , this.width-textWidth-5 , this.mousePosition.y+this.options.fontSize/2-2 );

            // time line
            // this.context.setLineDash( [5,5] );
            this.drawLine( this.mousePosition.x , 0 , this.mousePosition.x , this.height , this.options.crosshairColor );
            // this.context.setLineDash( [] );
            str = this.formatDate( new Date( this.xMouseHover ) );
            textWidth = this.context.measureText( str ).width;
            this.fillRect( this.mousePosition.x-textWidth/2-5 , this.height-this.options.fontSize-5 , textWidth+10 , this.options.fontSize+5 , this.options.crosshairColor );
            this.context.fillStyle = this.options.crosshairTextColor;
            this.context.fillText( str , this.mousePosition.x-textWidth/2 , this.height-5 );

            this.context.setLineDash( [] );
        }

        // because of the overscrolling at the end, it's possible to place the marker at a position without any candles, so only draw the databox if there is actually a candle
        if ( this.hoveredCandlestickID >= 0 && this.hoveredCandlestickID < this.candlesticks.length )
        {
            // find the widest data text
            var widestText = 0;

            var dataBoxHeight = 10;

            if ( this.options.overlayShowTime )
            {
                var timeStr = this.formatDate( new Date( this.xMouseHover ) );
                if ( this.context.measureText( timeStr ).width > widestText ) widestText = this.context.measureText( timeStr ).width;
                dataBoxHeight += this.options.fontSize;
            }

            if ( this.options.overlayShowData )
            {
                var openStr = "Open: "+this.candlesticks[this.hoveredCandlestickID].open;
                if ( this.context.measureText( openStr ).width > widestText ) widestText = this.context.measureText( openStr ).width;

                var highStr = "High: "+this.candlesticks[this.hoveredCandlestickID].high;
                if ( this.context.measureText( highStr ).width > widestText ) widestText = this.context.measureText( highStr ).width;

                var lowStr = "Low: "+this.candlesticks[this.hoveredCandlestickID].low;
                if ( this.context.measureText( lowStr ).width > widestText ) widestText = this.context.measureText( lowStr ).width;

                var closeStr = "Close: "+this.candlesticks[this.hoveredCandlestickID].close;
                if ( this.context.measureText( closeStr ).width > widestText ) widestText = this.context.measureText( closeStr ).width;

                dataBoxHeight += 4*this.options.fontSize;
            }

            if ( this.options.overlayShowChange )
            {
                var change = 0;
                var changePercent = 0;
                if ( this.hoveredCandlestickID > 0 )
                {
                    change = this.candlesticks[this.hoveredCandlestickID].close - this.candlesticks[this.hoveredCandlestickID-1].close;
                    if ( Math.abs(change) > 1 ) change = Math.round( change*100 )/100;
                    else if ( Math.abs(change) > 0.01 ) change = change.toFixed( 4 );
                    else if ( Math.abs(change) > 0.0001 ) change = change.toFixed( 6 );
                    else change = change.toFixed( 8 );

                    changePercent = (change/this.candlesticks[this.hoveredCandlestickID-1].close)*100;
                    changePercent = Math.round( changePercent*100 )/100;
                }

                var changeStr = "Change: "+change;
                if ( this.context.measureText( changeStr ).width > widestText ) widestText = this.context.measureText( changeStr ).width;

                var changePercentStr = "Change %: "+changePercent+"%";
                if ( this.context.measureText( changePercentStr ).width > widestText ) widestText = this.context.measureText( changePercentStr ).width;

                dataBoxHeight += 2*this.options.fontSize;
            }

            widestText += 20;

            // total width = widest text width + 10 pixels for the red or green indicator and 5 pixels of padding on each side
            var dataBoxWidth = widestText+10+10;
            // var dataBoxHeight = 5*this.options.fontSize+10;

            // data
            var yPos = this.mousePosition.y-dataBoxHeight-15;
            if ( yPos < 0 ) yPos = this.mousePosition.y+15;
            var xPos = this.mousePosition.x+15;
            if ( xPos+dataBoxWidth > this.width ) xPos = this.mousePosition.x-dataBoxWidth-15;

            this.fillRect( xPos , yPos , dataBoxWidth , dataBoxHeight , this.overlayBackgroundColor );
            var color = ( this.candlesticks[this.hoveredCandlestickID].close > this.candlesticks[this.hoveredCandlestickID].open ) ? this.greenColor : this.redColor;
            this.fillRect( xPos , yPos , 10 , dataBoxHeight , color );
            this.context.lineWidth = 2;
            this.drawRect( xPos , yPos , dataBoxWidth , dataBoxHeight , color );
            this.context.lineWidth = 1;

            this.context.fillStyle = this.overlayTextColor;
            var textYPosCounter = yPos+this.options.fontSize;
            if ( this.options.overlayShowTime )
            {
                this.context.fillText( timeStr , xPos+15 , textYPosCounter );
                textYPosCounter += this.options.fontSize;
            }
            if ( this.options.overlayShowData )
            {
                this.context.fillText( "Open:" , xPos+15 , textYPosCounter );
                this.context.fillText( this.candlesticks[this.hoveredCandlestickID].open , xPos+dataBoxWidth-this.context.measureText( this.candlesticks[this.hoveredCandlestickID].open ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;

                this.context.fillText( "High:" , xPos+15 , textYPosCounter );
                this.context.fillText( this.candlesticks[this.hoveredCandlestickID].high , xPos+dataBoxWidth-this.context.measureText( this.candlesticks[this.hoveredCandlestickID].high ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;

                this.context.fillText( "Low:" , xPos+15 , textYPosCounter );
                this.context.fillText( this.candlesticks[this.hoveredCandlestickID].low , xPos+dataBoxWidth-this.context.measureText( this.candlesticks[this.hoveredCandlestickID].low ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;

                this.context.fillText( "Close:" , xPos+15 , textYPosCounter );
                this.context.fillText( this.candlesticks[this.hoveredCandlestickID].close , xPos+dataBoxWidth-this.context.measureText( this.candlesticks[this.hoveredCandlestickID].close ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;
            }
            if ( this.options.overlayShowChange )
            {
                this.context.fillText( "Change:" , xPos+15 , textYPosCounter );
                this.context.fillText( change , xPos+dataBoxWidth-this.context.measureText( change ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;
                this.context.fillText( "Change %:" , xPos+15 , textYPosCounter );
                this.context.fillText( changePercent+"%" , xPos+dataBoxWidth-this.context.measureText( changePercent+"%" ).width-5 , textYPosCounter );
                textYPosCounter += this.options.fontSize;
            }
        }
    }
}



pingpoliCandlestickChart.prototype.drawGrid = function()
{
    if ( this.options.gridLineStyle == "dashed" )
    {
        this.context.setLineDash( [5,5] );
    }
    else if ( this.options.gridLineStyle == "dotted" )
    {
        this.context.setLineDash( [2,2] );
    }
    else
    {
        this.context.setLineDash( [] );
    }

    // roughly divide the yRange into cells
    var yGridSize = (this.yRange)/this.yGridCells;

    // try to find a nice number to round to
    var niceNumber = Math.pow( 10 , Math.ceil( Math.log10( yGridSize ) ) );
    if ( yGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( yGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // find next largest nice number above yStart
    var yStartRoundNumber = Math.ceil( this.yStart/niceNumber ) * niceNumber;
    // find next lowest nice number below yEnd
    var yEndRoundNumber = Math.floor( this.yEnd/niceNumber ) * niceNumber;

    for ( var y = yStartRoundNumber ; y <= yEndRoundNumber ; y += niceNumber )
    {
        this.drawLine( 0 , this.yToPixelCoords( y ) , this.width , this.yToPixelCoords( y ) , this.gridColor );
    }

    // roughly divide the xRange into cells
    var xGridSize = (this.xRange)/this.xGridCells;

    // try to find a nice number to round to
    niceNumber = Math.pow( 10 , Math.ceil( Math.log10( xGridSize ) ) );
    if ( xGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( xGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // find next largest nice number above yStart
    var xStartRoundNumber = Math.ceil( this.xStart/niceNumber ) * niceNumber;
    // find next lowest nice number below yEnd
    var xEndRoundNumber = Math.floor( this.xEnd/niceNumber ) * niceNumber;

    // if the total x range is more than 3 days, format the timestamp as date instead of hours
    var b_formatAsDate = false;
    if ( this.xRange > 60*60*24*1000*3 ) b_formatAsDate = true;

    for ( var x = xStartRoundNumber ; x <= xEndRoundNumber ; x += niceNumber )
    {
        this.drawLine( this.xToPixelCoords( x ) , 0 , this.xToPixelCoords( x ) , this.height , this.gridColor );
    }

    this.context.setLineDash( [] );
}



pingpoliCandlestickChart.prototype.drawLegend = function()
{
    // roughly divide the yRange into cells
    var yGridSize = (this.yRange)/this.yGridCells;

    // try to find a nice number to round to
    var niceNumber = Math.pow( 10 , Math.ceil( Math.log10( yGridSize ) ) );
    if ( yGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( yGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // find next largest nice number above yStart
    var yStartRoundNumber = Math.ceil( this.yStart/niceNumber ) * niceNumber;
    // find next lowest nice number below yEnd
    var yEndRoundNumber = Math.floor( this.yEnd/niceNumber ) * niceNumber;

    for ( var y = yStartRoundNumber ; y <= yEndRoundNumber ; y += niceNumber )
    {
        var textWidth = this.context.measureText( this.roundPriceValue( y ) ).width;
        this.context.fillStyle = this.gridTextColor;
        this.context.fillText( this.roundPriceValue( y ) , this.width-textWidth-5 , this.yToPixelCoords( y )-5 );
    }

    // roughly divide the xRange into cells
    var xGridSize = (this.xRange)/this.xGridCells;

    // try to find a nice number to round to
    niceNumber = Math.pow( 10 , Math.ceil( Math.log10( xGridSize ) ) );
    if ( xGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( xGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // find next largest nice number above yStart
    var xStartRoundNumber = Math.ceil( this.xStart/niceNumber ) * niceNumber;
    // find next lowest nice number below yEnd
    var xEndRoundNumber = Math.floor( this.xEnd/niceNumber ) * niceNumber;

    // if the total x range is more than 1 days, format the timestamp as date instead of hours
    var b_formatAsDate = false;
    if ( this.xRange > 60*60*24*1000*1 ) b_formatAsDate = true;

    for ( var x = xStartRoundNumber ; x <= xEndRoundNumber ; x += niceNumber )
    {
        var date = new Date( x );
        var dateStr = "";
        if ( b_formatAsDate )
        {
            var day = date.getDate();
            if ( day < 10 ) day = "0"+day;
            var month = date.getMonth()+1;
            if ( month < 10 ) month = "0"+month;
            dateStr = day+"."+month;
        }
        else
        {
            var minutes = date.getMinutes();
            if ( minutes < 10 ) minutes = "0"+minutes;
            dateStr = date.getHours()+":"+minutes;
        }
        this.context.fillStyle = this.gridTextColor;
        this.context.fillText( dateStr , this.xToPixelCoords( x )+5 , this.height-5 );
    }
}



pingpoliCandlestickChart.prototype.calculateYRange = function()
{
    for ( var i = this.zoomStartID+this.scrollOffsetX ; i < this.candlesticks.length+this.scrollOffsetX ; ++i )
    {
        if ( i >= this.candlesticks.length ) continue;

        if ( i == this.zoomStartID+this.scrollOffsetX )
        {
            this.yStart = this.candlesticks[i].low;
            this.yEnd = this.candlesticks[i].high;
        }
        else
        {
            if ( this.candlesticks[i].low < this.yStart )
            {
                this.yStart = this.candlesticks[i].low;
                this.yStartIndex = i;
            }
            if ( this.candlesticks[i].high > this.yEnd )
            {
                this.yEnd = this.candlesticks[i].high;
                this.yEndIndex = i;
            }
        }
    }
    this.yRange = this.yEnd - this.yStart;
}



pingpoliCandlestickChart.prototype.calculateXRange = function()
{
    if ( this.candlesticks.length == 0 )
    {
        this.xStart = 0;
        this.xEnd = 0;
        this.xRange = 0;
    }
    else
    {
        if ( this.scrollOffsetX > 0 )
        {
            var delta = this.candlesticks[1].timestamp-this.candlesticks[0].timestamp;
            this.xStart = this.candlesticks[this.zoomStartID+this.scrollOffsetX].timestamp;
            var localScrollOffsetX = this.scrollOffsetX;
            if ( localScrollOffsetX > 0 ) localScrollOffsetX = 0;
            this.xEnd = this.candlesticks[this.candlesticks.length-1+localScrollOffsetX].timestamp;
            this.xEnd += this.scrollOffsetX*delta;
            this.xRange = this.xEnd - this.xStart;
        }
        else
        {
            this.xStart = this.candlesticks[this.zoomStartID+this.scrollOffsetX].timestamp;
            this.xEnd = this.candlesticks[this.candlesticks.length-1+this.scrollOffsetX].timestamp;
            this.xRange = this.xEnd - this.xStart;
        }
    }
}



pingpoliCandlestickChart.prototype.yToPixelCoords = function( y )
{
    return this.height - this.marginBottom - (y-this.yStart) * this.yPixelRange/this.yRange;
}



pingpoliCandlestickChart.prototype.xToPixelCoords = function( x )
{
    return this.marginLeft + (x-this.xStart) * this.xPixelRange/this.xRange;
}



pingpoliCandlestickChart.prototype.yToValueCoords = function( y )
{
    return this.yStart + ( this.height - this.marginBottom - y ) * this.yRange/this.yPixelRange;
}



pingpoliCandlestickChart.prototype.xToValueCoords = function( x )
{
    return this.xStart + ( x - this.marginLeft ) * this.xRange/this.xPixelRange;
}



pingpoliCandlestickChart.prototype.drawLine = function( xStart , yStart , xEnd , yEnd , color )
{
	this.context.beginPath();
    // to get a crisp 1 pixel wide line, we need to add 0.5 to the coords
    if ( this.context.lineWidth%2 == 0 )
    {
        this.context.moveTo( xStart , yStart );
	    this.context.lineTo( xEnd , yEnd );
    }
	else
    {
        // to get a crisp 1 pixel wide line, we need to add 0.5 to the coords
        this.context.moveTo( xStart+0.5 , yStart+0.5 );
	    this.context.lineTo( xEnd+0.5 , yEnd+0.5 );
    }
	this.context.strokeStyle = color;
	this.context.stroke();
}



pingpoliCandlestickChart.prototype.fillRect = function( x , y , width , height , color )
{
	this.context.beginPath();
    this.context.fillStyle = color;
	this.context.rect( x , y , width , height );
	this.context.fill();
}



pingpoliCandlestickChart.prototype.drawRect = function( x , y , width , height , color )
{
	this.context.beginPath();
    this.context.strokeStyle = color;
	this.context.rect( x , y , width , height );
	this.context.stroke();
}



pingpoliCandlestickChart.prototype.formatDate = function( date )
{
    var day = date.getDate();
    if ( day < 10 ) day = "0"+day;
    var month = date.getMonth()+1;
    if ( month < 10 ) month = "0"+month;
    var hours = date.getHours();
    if ( hours < 10 ) hours = "0"+hours;
    var minutes = date.getMinutes();
    if ( minutes < 10 ) minutes = "0"+minutes;
    return day+"."+month+"."+date.getFullYear()+" - "+hours+":"+minutes;
}



pingpoliCandlestickChart.prototype.roundPriceValue = function( value )
{
    if ( value > 1.0 ) return Math.round( value*100 )/100;
    if ( value > 0.001 ) return Math.round( value*1000 )/1000;
    if ( value > 0.00001 ) return Math.round( value*100000 )/100000;
    if ( value > 0.0000001 ) return Math.round( value*10000000 )/10000000;
    else return Math.round( value*1000000000 )/1000000000;
}