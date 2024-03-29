//var json_endpoint = "http://eql.herokuapp.com/parse/fake/test";
//var json_endpoint = "http://eql.herokuapp.com/parse/from%20timur%20to%20samir%20before%20last%20week"
//var json_endpoint = "http://eql.herokuapp.com/parse/about%20microsoft%20with%20links%20to%20facebook"
var json_endpoint = "http://eql.herokuapp.com/parse/";
var json_terms_endpoint = "http://eql.herokuapp.com/terminals";
var json_contacts_endpoint = "http://eql.herokuapp.com/contacts/";
var queryParamKey = "q";
var grammar_terms;
var $search_box;

// autocomplete suggestion
var autocomplete_grammar_terms = ["from", "to", "by"];
var last_grammar_term = "";
var last_grammmar_index = -1;
var current_nongrammar_term = "";

var curr_placeholder_index = 0;
var placeholders = [
	"sent by Satya about One Week",
	"with excel attachments",
	"with links to stubhub",
	"sent yesterday from Evan",
	"with pictures attached"
];

//var json_endpoint = "test.json";
$(document).ready(function(){
	if (window.chrome) {
		$("#unsupported").hide();
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
			} else if (e.which == 32) {
				var query = getSearchQuery();
				search(query);
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

		// rotate placeholders
		setInterval(function() {
			if (++curr_placeholder_index == placeholders.length) {
				curr_placeholder_index = 0;
			}
			//console.log("updating placeholder " + placeholders[curr_placeholder_index]);
			//$search_box.fadeOut(500);
			$search_box.attr("placeholder", placeholders[curr_placeholder_index]);
			//$search_box.fadeIn(500);
		}, 2500);
		
		// hack :(
		setTimeout(function() {
			$search_box.width($("#search-container").width() - 271);
		}, 1);

		$("#dym-container").hide();
		var $suggestion = $("#dym-suggestion");
		$suggestion.click(function() {
			$("#dym-container").fadeOut(500);
			var suggestion_text = $suggestion.text();
			update_search_box(suggestion_text, false);
			search(suggestion_text);
		});
	} else {
		$("#search-container").hide();
		$("#dym-container").hide();
	}
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
		else if ( event.keyCode === 13) 
		{
			this.blur();
			setEndOfContenteditable(this);
		}
      })
      .autocomplete({
        minLength: 2,
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
	$("#email-container").empty();
	$.getJSON( json_endpoint + search_query, function( data ) {
		//var server_response = $.parseJSON( data );
		var server_response = data;
		if(server_response.result.parse_success) {	
			showParsingAndTime(server_response.result, server_response.parse_terms);
			//var formatted_html_email_set = "";
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
						formatted_html_email += "<div class='time phone'>" + getTimeDisplayString(date_time) + "</div>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}	
				else {
					formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender'>";
							formatted_html_email += "<span class='sender-name'>" + email.from.name + "</span>";
							formatted_html_email += "<span class='sender-email hide'> &#60" + email.from.email + "&#62</span>";
							formatted_html_email += "<span class='counts'>";
								formatted_html_email += "<span class='link-count'><span class='glyphicon glyphicon-link'></span> " + (email.links ? email.links.length : 0) + "</span>"
								formatted_html_email += "<span class='attachment-count'><span class='glyphicon glyphicon-paperclip'></span> " + (email.attachment ? email.attachment.length : 0) + "</span>"
							formatted_html_email += "</span>";	
						formatted_html_email += "</div>";
						formatted_html_email += "<div class='subject'>" + email.subject + "</div>";
						for(var receiver in email.to)
						{
							formatted_html_email += "<div class='to hide'><span class='to-name'>" + email.to[receiver].name + "</span><span class='to-email'> &#60" + email.to[receiver].email + "&#62</span></div>";
						}
						formatted_html_email += "<div class='preview'>" + email.body_preview + "</div>";
						if(email.links && email.links.length > 0) {
							formatted_html_email += "<div class='links hide'>";
							//formatted_html_email += "<div><span class='glyphicon glyphicon-link'></span> Links</div>";
							for(var link in email.links)
							{
								formatted_html_email += "<div class='link'><span class='glyphicon glyphicon-link'></span> <a href='" + email.links[link] + "'>" + email.links[link] + "</a></div>";
							}
							formatted_html_email += "</div>";
						}
						if(email.attachment && email.attachment.length > 0) {
							formatted_html_email += "<div class='attachments hide'>";
							//formatted_html_email += "<div><span class='glyphicon glyphicon-paperclip'></span> Attachments</div>";
							for(var attachment in email.attachment)
							{
								formatted_html_email += "<div class='attachment'><span class='glyphicon glyphicon-paperclip'></span> " + email.attachment[attachment] + "</div>";
							}
							formatted_html_email += "</div>";
						}
						formatted_html_email += "<div class='body hide'><hr />" + email.body + "</div>";
						//formatted_html_email += "<div class='html-body hide'><iframe class='html-email-iframe'></iframe></div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date'>" + getDateDisplayString(date_time) + "</div>";
						formatted_html_email += "<div class='time'>" + getTimeDisplayString(date_time) + "</div>";
						formatted_html_email += "<span class='email-details-expander chevron-down'>&#8964;</span>";
						//formatted_html_email += "<div class='icons'><span class='glyphicon glyphicon-paperclip icon-white'><span class='glyphicon glyphicon-link icon-white'></span></div>";
						//formatted_html_email += "<div class='icons'><img class='link-icon' src='./icons/link_icon_white.png'></div>";
					formatted_html_email += "</div>";
				}
				formatted_html_email += "</div>";
				$("#email-container").append(formatted_html_email);
				
				//console.log(email.html_body);
				//var email_iframe = $("#email-container").find(".email-result").last().find(".html-email-iframe");
				//console.log(email_iframe);
				//email_iframe.contents().find('body').replaceWith(email.html_body);
				//formatted_html_email_set += formatted_html_email;
			}
			//$("#email-container").html(formatted_html_email_set);
			//$("body").append(formatted_html_email_set);

			update_dym(server_response.suggestions);
		}
	});
}

function update_dym(suggestion) {
	var $dym = $("#dym-container");
	if (suggestion && suggestion.length > 0) {
		// Update query
		var text = suggestion[0];

		// too high-risk with -1 bug
		// suggestion.forEach(function(indicesString, index) {
		// 	if (index > 0) {
		// 		var indices = indicesString.split(",");
		// 		var start = parseInt(indices[0]);
		// 		var length = parseInt(indices[1]);
		// 		var highlight = '<em><strong>' + text.substr(start, length) + '</em></strong>';
		// 		text = text.substring(0, start) + highlight + text.substring(start + length);
		// 	}
		// });

		$("#dym-suggestion").html(text);

		// Fire query
		$dym.fadeIn(500);
	} else {
		$dym.hide();
	}
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
	var daysSince = (Date.now() - date) / (1000*60*60*24);
	return daysSince < 7 ? getDayOfWeek(date) : date.toLocaleDateString();
}

function getTimeDisplayString(time) {
	// //TODO: AM/PM + "1 hr ago" scenarios
	// var time = parseTime(emailTimestamp);
	// return (time.getHours()) + ":" + formatMinutes(time.getMinutes());
	var localeTimeString = time.toLocaleTimeString().toString();
	var parts = localeTimeString.split(":");
	return parts[0] + ":" + parts[1] + " " + parts[2].substring(3,5);
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
	var meta_html = "<span class='result-meta'>Showing " + result_meta.count + " of " + result_meta.total + " results (" + result_meta.duration.toString().substring(0,4) + " sec)";
	$("#parse-results").append(meta_html);
	for(var term in parse_terms)
	{
		var value = parse_terms[term];
		var parse_tags_html = "<span class='label label-default label-custom'>" + term + ": " + value + "</span>"
		$("#parse-results").append(parse_tags_html);
	}
}
$(document).on('click', '.email-details-expander', function () {
	if( $(this).hasClass("chevron-down")) {
		$(this).html("&#8963;");
		$(this).addClass("chevron-up");
		$(this).removeClass("chevron-down");
		var email_html = $(this).parentsUntil(".email-result").parent();
		email_html.find(".body").removeClass("hide");
		email_html.find(".preview").addClass("hide");
		email_html.find(".sender-email").removeClass("hide");
		email_html.find(".subject").addClass("add-bottom-margin");
		email_html.find(".to").removeClass("hide");
		email_html.find(".links").removeClass("hide");
		email_html.find(".attachments").removeClass("hide");
		//email_html.find(".html-body").removeClass("hide");
	}
	else if ( $(this).hasClass("chevron-up")) {
		$(this).html("&#8964;");
		$(this).addClass("chevron-down");
		$(this).removeClass("chevron-up");
		var email_html = $(this).parentsUntil(".email-result").parent();
		email_html.find(".preview").removeClass("hide");
		email_html.find(".body").addClass("hide");
		email_html.find(".sender-email").addClass("hide");
		email_html.find(".to").addClass("hide");
		email_html.find(".subject").removeClass("add-bottom-margin");
		email_html.find(".links").addClass("hide");
		email_html.find(".attachments").addClass("hide");
		//email_html.find(".html-body").addClass("hide");
	}
});
$("#want-button").click(function (event) {
	event.preventDefault();
	$('#myModal').modal('show');
});
