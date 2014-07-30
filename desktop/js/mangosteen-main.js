//var json_endpoint = "http://eql.herokuapp.com/parse/fake/test";
//var json_endpoint = "http://eql.herokuapp.com/parse/from%20timur%20to%20samir%20before%20last%20week"
var json_endpoint = "http://eql.herokuapp.com/parse/";
var json_terms_endpoint = "http://eql.herokuapp.com/terminals";
var json_contacts_endpoint = "http://eql.herokuapp.com/fake/contacts/";
var queryParamKey = "q";
var grammar_terms;
var $search_box;

// autocomplete suggestion
var autocomplete_grammar_terms = ["from", "to", "by"];
var last_grammar_term = "";
var last_grammmar_index = -1;
var current_nongrammar_term = "";

//var json_endpoint = "test.json";
$(document).ready(function(){
	$.get(json_terms_endpoint, function(data) {
		if (data.terms) {
			grammar_terms = data.terms;
			console.log("Terms: " + grammar_terms );
		} else {
			console.log("No terms found: " + data);
		}
	});

	checkIfPhone();

	$search_box = $("#search-box");

	// Lookup if query string param was passed
	var query;
	if (query = qs(queryParamKey)) {
		$search_box.val(query);
		search(query);
	} else {
		setEndOfContenteditable($search_box[0]);
	}
	
	$(document).keypress(function(e) {
		if(e.which == 13) {
			var query = getSearchQuery();
			search(query);
			e.preventDefault();
		}
	});

	// Keypress is called before input value is updated. Keyup is called after
	// Doesn't work well with modified keystrokes (e.g. ctrl+a)
	$search_box.keyup(function(e) {
		//if (e.keyCode != 32) {
			var query = getSearchQuery();
			update_search_box(query, e.keyCode == 32);
		//}
	});
	initAutocomplete();

	$("#searchButton").click(function() {
		search(getSearchQuery());
	});
});

/* GRAMMAR HIGHLIGHTING / AUTOCOMPLETE */
function initAutocomplete() {
	$search_box
      // don't navigate away from the field on tab when selecting an item
      .bind( "keyup", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        minLength: 0,
        source: function( request, response ) {
            //console.log("request term: "  + request.term);
        	if (last_grammar_term && current_nongrammar_term && autocomplete_grammar_terms.indexOf(last_grammar_term.toLowerCase()) >= 0) {
        		
        		$.get(json_contacts_endpoint + current_nongrammar_term, function(data) {
        			if (data.contacts) {
        				//console.log("autocomplete: " + data.contacts);
        				response(data.contacts);
        			} else {
        				response([]);
        			}
        		});
        	} else {
        		response([]);
        	}
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
            console.log(this.textContent);
            	var selected = ui.item.value;
            	var query = $search_box.html();
            	var current_nongrammar_index = query.lastIndexOf(current_nongrammar_term);
            	if (current_nongrammar_index >= 0) {
            		query = query.substring(0, current_nongrammar_index) + selected + query.substring(current_nongrammar_index + current_nongrammar_term.length);
            		$search_box.html(query);
            		reset_autocomplete();
            	}

	          	return false;
        }
      });
}

function reset_autocomplete() {
	last_grammar_term = "";
	last_grammmar_index = -1;
	current_nongrammar_term = "";
}

// Grammar highlighting
function update_search_box(query, lastLetterIsSpace) {
	var query_html;

	// Only run processing if last letter was not a space
	if (!lastLetterIsSpace) {
		reset_autocomplete();
		var query_terms = query.split(/\s+/).filter(function (term) {
			return term.length > 0;
		});

		var new_query_terms = [];

		query_terms.forEach(function(query_term, index) {
			if (grammar_terms && grammar_terms.indexOf(query_term) >= 0) {
				last_grammar_term = query_term;
				last_grammmar_index = index;
				current_nongrammar_term = "";
			} else {
				// Save current non-grammar term
				if (index - 1 == last_grammmar_index) {
					current_nongrammar_term = query_term
				} else {
					current_nongrammar_term += " " + query_term;
				}

				query_term = '<b>' + query_term + '</b>';
			}

			new_query_terms.push(query_term);	
		});

		 query_html = new_query_terms.join(" ");
	} else {
		query_html = $search_box.html();
	}

	// Hacky bug fix: add extra space
	if (query.trim().length == query.length - 1) {
		query_html += "&nbsp;";
	}

	// console.log("grammar term: " + last_grammar_term);
	// console.log("nonqueryterm: " + current_nongrammar_term);

	$search_box.html(query_html);
	setEndOfContenteditable($search_box[0]);
}

// sourcE: http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}


/* DEVICE SPECIFIC OPTIONS */
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
	return $("#search-box").text();
}

function search(search_query) {
	console.log("Searching for " + search_query);
	$.getJSON( json_endpoint + search_query, function( data ) {
		//var server_response = $.parseJSON( data );
		var server_response = data;
		if(server_response.result.parse_success) {	
			showParsingAndTime(server_response.result, server_response.parse_terms);
			var formatted_html_email_set = "";
			for(var array_id in server_response.emails)
			{
				var email = server_response.emails[array_id];
				var formatted_html_email = '<div class="email-result">';
				var date_time = new Date(email.sent_time);

				if(isPhone()) {
					formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender phone'><span class='sender-name phone'>" + email.from.name + "</span></div>";
						formatted_html_email += "<div class='subject phone'>" + shortenText(email.subject, true) + "</div>";
						formatted_html_email += "<div class='preview phone'>" + shortenText(email.body_preview, true) + "</div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date phone'>" + getDateDisplayString(date_time) + "</div>";
						formatted_html_email += "<div class='day phone'>" + getDayOfWeek(date_time) + "</div>";
						formatted_html_email += "<div class='time phone'>" + getTimeDisplayString(date_time) + "</div>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}	
				else {
					formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender'><span class='sender-name'>" + email.from.name + "</span></div>";
						formatted_html_email += "<div class='subject'>" + email.subject + "</div>";
						formatted_html_email += "<div class='preview'>" + email.body_preview + "</div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date'>" + getDateDisplayString(date_time) + "</div>";
						formatted_html_email += "<div class='day'>" + getDayOfWeek(date_time) + "</div>";
						formatted_html_email += "<div class='time'>" + getTimeDisplayString(date_time) + "</div>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}
				formatted_html_email += "</div>";
				formatted_html_email_set += formatted_html_email;
			}
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

function getDayOfWeek(date) {
  return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()];
};

function getDateDisplayString(date) {
	//TODO: more complicated stuff like Mon-Fri based on current date
	// var date = parseDate(emailTimestamp);
	// return 	(date.getMonth()+1) + "/" + date.getDate() + "/" + date	.getFullYear().toString().substring(2);
	return date.toLocaleDateString();
}

function getTimeDisplayString(time) {
	// //TODO: AM/PM + "1 hr ago" scenarios
	// var time = parseTime(emailTimestamp);
	// return (time.getHours()) + ":" + formatMinutes(time.getMinutes());
	return time.toLocaleTimeString();
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


function showParsingAndTime(result_meta, parse_terms) {
	$("#parse-results").empty();
	var meta_html = "<span class='result-meta'>" + result_meta.count + " results (" + result_meta.duration.toString().substring(0,4) + " sec)";
	$("#parse-results").append(meta_html);
	for(var term in parse_terms)
	{
		var value = parse_terms[term];
		var parse_tags_html = "<span class='label label-default label-custom'>" + term + ": " + value + "</span>"
		$("#parse-results").append(parse_tags_html);
	}
}