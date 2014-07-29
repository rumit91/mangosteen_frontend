var json_endpoint = "http://eql.herokuapp.com/fake";
var json_terms_endpoint = "http://eql.herokuapp.com/terminals";
//var json_endpoint = "test.json";
$(document).ready(function(){
	
	$(document).keypress(function(e) {
		if(e.which == 13) {
			search();
		}
	});

	$("#searchButton").click(function() {
		search();
	});
});

function search(search_query) {
	var search_query = $("#search-box").val();

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
				formatted_html_email += "<div class='time'>" + email.sent_time + "</div>";
				formatted_html_email += "</div>";
				formatted_html_email_set += formatted_html_email;
			}

			$("#results-label").text("Emails " + search_query);
			$("#email-container").html(formatted_html_email_set);
			//$("body").append(formatted_html_email_set);
		}
	});
}