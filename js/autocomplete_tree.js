params = {}

var snapmeetPeopleUrl = "https://snapmeet.azurewebsites.net/People/Search"
var mangosteen_contacts_endpoint = "http://eql.herokuapp.com/contacts/";

function launch_word(){
  window.location.href = "https://office.live.com/start/Word.aspx?omkt=en%2DUS";
}

function launch_onenote(){
  window.location.href = "http://www.onenote.com/notebooks";
}

function launch_powerpoint(){
  window.location.href = "https://office.live.com/start/Powerpoint.aspx?omkt=en%2DUS";
}

function launch_excel(){
  window.location.href = "https://office.live.com/start/Excel.aspx?omkt=en%2DUS";
}

function resolve_email(query , onComplete ){
  $.get(snapmeetPeopleUrl + "?user=saahm&query="+query, function(data){ 
          var email = "";
          if (data && data.contacts && data.contacts.length > 0){
            email = data.contacts[0].alias+"@microsoft.com";
          }
          else if (data && data.others  && data.others.length > 0){
            email = data.others[0].alias+"@microsoft.com";
          }
          onComplete(email);
        }); 
}

function who_is(alias){
 var url = "https://msft-my.spoppe.com/PersonImmersive.aspx?accountname=i%3A0%23%2Ef%7Cmembership%7C" + alias + "@microsoft.com";
 window.location.href = url;
}

function find_documents_by(email){
  window.location.href = ("https://msft-my.spoppe.com/_layouts/15/me.aspx?p="+email)
}

function search_the_web(raw){
  
  query = raw;
  if (raw.indexOf("for ") == 0){
    query = raw.substring(4);
  }
  else if (raw.indexOf("about ") == 0){
    query = raw.substring(6);
  }
  
  window.location.href= ("http://bing.com/search?q=" + query)
}

function mangosteen_people_search(prefix, onSuccess){
  $.get(mangosteen_contacts_endpoint + prefix, function(data) {
    if (data.contacts) {
      onSuccess(data.contacts);
    }
    else{
      onSuccess([]);
    }
  });
}

function snapmeet_people_search( prefix , onSuccess ){
  $.get(snapmeetPeopleUrl + "?user=saahm&query="+ prefix , function(data){ 
          var names = []
          if (data && data.contacts && data.others){
            $.each(data.contacts, function(i, item){ names.push(item.name); });
            $.each(data.others, function(i, item){ names.push(item.name); });
          }
          onSuccess(names);
        }); 
}

function fast_search(query){
  window.location.href = "https://msft.spoppe.com/search/Pages/results.aspx?k=" + query;
}

function show_me_emails(search_query) {
  console.log("Raw Query " + search_query);
  search_query = search_query.lower();
  if (search_query.indexOf("show me emails")){
    search_query = search_query.substring("show me emails".length);
  }
	
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
			
        formatted_html_email += "<div class='email-result-left'>";
						formatted_html_email += "<div class='sender phone'><span class='sender-name phone'>" + email.from.name + "</span></div>";
						formatted_html_email += "<div class='subject phone'>" + shortenText(email.subject, true) + "</div>";
						formatted_html_email += "<div class='preview phone'>" + shortenText(email.body_preview, true) + "</div>";
					formatted_html_email += "</div>";
						formatted_html_email += "<div class='email-result-right'>";
						formatted_html_email += "<div class='date phone'>" + getDateDisplayString(date_time) + "</div>";
						formatted_html_email += "<div class='time phone'>" + getTimeDisplayString(date_time) + "</div>";
					formatted_html_email += "</div>";
      }
    }
  });
}

function reset_tree(){
  params = {}
  // todo add other things here ...  as needed
}

tree = {
  "show me emails":{ 
    "execute" : function( text ){ search(text) } ,
    "options":{ 
      "to" : {
        "autocomplete": mangosteen_people_search, 
        "action" : null
      },
      "from" : {
        "autocomplete": mangosteen_people_search, 
        "action" : null
      },
      "about" : { "terms": ["office now", "digital life & digital work"], "action" : null },
      "with links to" : { "terms" : ["yammer.com", "facebook.com"], "action":null},
      "sent before " : {"terms" : ["yesterday", "monday", "june"], "action": null},
      "sent after" : {"terms" : ["yesterday", "monday", "july"], "action" : null},
    }
  },
  "launch": {
    "execute" : function(){ params.exec(); },
    "options" : {
      "word" : { "action": function(){ params.exec = launch_word; }},
      "excel" : { "action": function(){ params.exec = launch_excel;}},
      "powerpoint" :{ "action": function(){ params.exec = launch_powerpoint;}},
      "onenote" : { "action": function(){ params.exec = launch_onenote; }},
    }
  },
  "create": {
    "execute": function(){ params.exec(); },
    "options": {
      "a new doc" : { "action": function(){ params.exec = launch_word; }},
      "a new spreadsheet" : { "action": function(){ params.exec = launch_excel;}},
      "a new slideshow" :{ "action": function(){ params.exec = launch_powerpoint;}},
      "a new note" : { "action": function(){ params.exec = launch_onenote; }},
    }
  },
  "schedule a meeting": {
    "execute": function(){ /* TODO */},
    "options" : {
      "with" : { 
        "autocomplete" : snapmeet_people_search,
        "action" : function(person){ params.person = person; }
      },
      "sometime" : { 
        "terms" : ["this week", "today", "tomorrow"],
        "action" : function(time){ params.time = time; }
      },
      "about" : { 
        "action" : function(subject){ params.time = subject; },
        "terms": ["office now", "one clip", "next", "loud mango", "revolve", "hiking", "bing ux", "DLW"] 
      }
    }
  },
  "find me documents":{ 
    "execute": function(){ 
      params = params || {};
      if (params.person && !params.about){
        find_documents_by(params.email);
      }
      if (params.about){
        fast_search(params.about + " " + (params.person || "" ) )
      }
    },
    "options":{
      "by": {
        "autocomplete" : snapmeet_people_search,
        "action" : function(person){ resolve_email(person, function(email){
            params.email = email;
          }); 
        }
      },
      "trending around" : {
        "autocomplete" : snapmeet_people_search,
        "action" : function(person){ resolve_email(person, function(email){
            params.email = email;
          }); 
        }
      },
      "about" : {
        "action" : function(about){ params.about = about; }
      }
    }
  },
  "who is": { 
    "execute": function(){ who_is(params.email) },
    "autocomplete" : snapmeet_people_search,
    "action" : function(person){ 
      resolve_email(person, function(email){
        params.email = email;
      }); 
    }
  },
  "search the web":{
    "execute": function(text){ search_the_web(text); }
  }
}