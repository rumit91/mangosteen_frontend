var json_endpoint = "http://eql.herokuapp.com/fake";
var json_terms_endpoint = "http://eql.herokuapp.com/terminals";
var queryParamKey = "q";

//var json_endpoint = "test.json";
$(document).ready(function(){
	checkIfPhone();
	// Lookup if query string param was passed
	var query;
	if (query = qs(queryParamKey)) {
		$("#search-box").val(query);
		search(query);
	} 
	
	$(document).keypress(function(e) {
		if(e.which == 13) {
			search(getSearchQuery());
		}
	});

	$("#searchButton").click(function() {
		search(getSearchQuery());
	});
});

function checkIfPhone() {
	var urlVars = getUrlVars();
	if (urlVars["ph"] == 1) {
		$("#query-ui").hide();
	}
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getSearchQuery() {
	return $("#search-box").val();
}

function search(search_query) {
	console.log("Searching for " + search_query);
	$.getJSON( json_endpoint, function( data ) {
		//var server_response = $.parseJSON( data );
		var server_response = data;
		if(server_response.result.parse_success) {		
			var formatted_html_email_set = "";
			for(var array_id in server_response.emails)
			{
				var email = server_response.emails[array_id];
				var formatted_html_email = '<div class="email-result">';
				formatted_html_email += "<div class='sender'><span class='sender-name'>" + email.from.name + "</span><span class='sender-email'> &#60" + email.from.email + "&#62</span></div>";
				formatted_html_email += "<div class='subject'>" + email.subject + "</div>";
				formatted_html_email += "<div class='preview'>" + email.body_preview + "</div>";
				formatted_html_email += "<div class='time'>Received " + email.sent_time + "</div>";
				formatted_html_email += "</div>";
				formatted_html_email_set += formatted_html_email;
			}

			$("#results-label").text("Emails " + search_query);
			$("#email-container").html(formatted_html_email_set);
			//$("body").append(formatted_html_email_set);
		}
	});
}

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}