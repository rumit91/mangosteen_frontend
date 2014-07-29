//var json_endpoint = "http://eql.herokuapp.com/fake";
var json_endpoint = "test.json";
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
		var server_response = $.parseJSON( data );
		if(server_response.result.parse_success) {		
			var formatted_email_set = [];
			for(var email in server_response.emails)
			{
				var formatted_email = "<ul>";
				formatted_email += "<li>" + email.from.name + " &#60" + email.from.email + "&#62</li>";
				formatted_email += "<li>" + email.subject + "</li>";
				formatted_email += "<li>" + email.body_preview + "</li>";
				formatted_email += "<li>" + email.sent_time + "</li>";
				formatted_email += "</ul>";
				formatted_email_set[formatted_email_set.length] = formatted_email;
			}
			$("#email-container").append(formatted_emails);
		}
	});
}