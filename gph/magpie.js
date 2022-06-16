function magpie( token )
{
	var data = {};
	data.token = token;
	data.referrer = document.referrer;
	if ( typeof magpie_subpage !== "undefined" )
	{
		data.subpage = magpie_subpage;
	}

	var xmlhttp = new XMLHttpRequest();
	//xmlhttp.open( "POST" , "../magpie/magpie.php?token="+encodeURIComponent(token) );
	xmlhttp.open( "POST" , "https://pingpoli.de/magpie/magpie.php?token="+encodeURIComponent(token) );
	xmlhttp.onreadystatechange = function()
	{
		if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 )
		{
			console.log( xmlhttp.responseText );
			var json = JSON.parse( xmlhttp.responseText );
			if ( !json.result )
			{
				console.log( xmlhttp.responseText );
			}
		}
	}
	xmlhttp.setRequestHeader( 'Content-Type' , 'application/json' );
	xmlhttp.send( JSON.stringify( data ) );
}
