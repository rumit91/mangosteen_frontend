var json_endpoint = "http://eql.herokuapp.com/fake";
var json_terms_endpoint = "http://eql.herokuapp.com/terminals";
//var json_endpoint = "test.json";
$(document).ready(function(){
	
	$(document).keypress(function(e) {
		if(e.which == 13) {
			var search_query = $("#search-box").val();
			search(search_query);
		}
	});
});

function search(search_query) {
	alert(search_query);
	$.getJSON( json_endpoint, function( data ) {
		//var server_response = $.parseJSON( data );
		var server_response = data;
		if(server_response.result.parse_success) {		
			var formatted_html_email_set = "";
			for(var array_id in server_response.emails)
			{
				var email = server_response.emails[array_id];
				var formatted_html_email = "<ul>";
				formatted_html_email += "<li>" + email.from.name + " &#60" + email.from.email + "&#62</li>";
				formatted_html_email += "<li>" + email.subject + "</li>";
				formatted_html_email += "<li>" + email.body_preview + "</li>";
				formatted_html_email += "<li>" + email.sent_time + "</li>";
				formatted_html_email += "</ul>";
				formatted_html_email_set += formatted_html_email;
			}
			$("#email-container").append(formatted_html_email_set);
		}
	});
}