var json_endpoint = "http://eql.herokuapp.com/parse/fake/test";
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
	if (isPhone()) {
		$("#main-container").css("margin-top", 0);
	}
	else {
		$("#query-ui").css("display", "block");
	}
}
function isPhone() {
	var urlVars = getUrlVars();
	if (urlVars["ph"] == 1) {
		return true;
	}
	else {
		return false;
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
				if(isPhone()) {
					formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender phone'><span class='sender-name phone'>" + email.from.name + "</span></div>";
						formatted_html_email += "<div class='subject phone'>" + shortenText(email.subject, true) + "</div>";
						formatted_html_email += "<div class='preview phone'>" + shortenText(email.body_preview, true) + "</div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date phone'>" + getDateDisplayString(email.sent_time) + "</div>";
						formatted_html_email += "<div class='time phone'>" + getTimeDisplayString(email.sent_time) + "</div>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}	
				else {
					formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender'><span class='sender-name'>" + email.from.name + "</span><span class='sender-email'> &#60" + email.from.email + "&#62</span></div>";
						formatted_html_email += "<div class='subject'>" + shortenText(email.subject, false) + "</div>";
						formatted_html_email += "<div class='preview'>" + shortenText(email.body_preview, false) + "</div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date'>" + getDateDisplayString(email.sent_time) + "</div>";
						formatted_html_email += "<div class='time'>" + getTimeDisplayString(email.sent_time) + "</div>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}
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

function shortenText(text, isPhone) {
	return text;
	/*if(isPhone) {
		if(text.length < 40) {
			return text;
		} else {
			return text.substring(0,39) + "...";
		}
	} else {
		if(text.length < 61) {
			return text;
		} else {
			return text.substring(0,60) + "...";
		}
	}*/
}

function getDateDisplayString(emailTimestamp) {
	//TODO: more complicated stuff like Mon-Fri based on current date
	var date = parseDate(emailTimestamp);
	return 	(date.getMonth()+1) + "/" + date.getDate() + "/" + date	.getFullYear().toString().substring(2);
}

function parseDate(emailTimestamp) {
	var date = emailTimestamp.split('T')[0];
	var parts = date.split('-');
	// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
	return new Date(parts[0], parts[1]-1, parts[2]);
}

function getTimeDisplayString(emailTimestamp) {
	//TODO: AM/PM + "1 hr ago" scenarios
	var time = parseTime(emailTimestamp);
	return (time.getHours()) + ":" + formatMinutes(time.getMinutes());
}

function parseTime(emailTimestamp) {
	var time = emailTimestamp.split('T')[1];
	var parts = time.split(':');
	return new Date(2014,0,1, parts[0], parts[1], parts[2], 0);
}

function formatMinutes(minutesInput) {
	if(minutesInput.toString().length == 2) {
		return minutesInput.toString();
	}
	else if(minutesInput.toString().length == 1) {
		return "0" + minutesInput;
	}
	else {
		return "00";
	}
}