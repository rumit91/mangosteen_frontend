Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
            return dat;
}

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

function pipe_to_search_engine(raw, source){
  
  query = raw;
  
  if (raw.indexOf("search the web for") == 0){
    query = raw.substring("search the web for".length)
  }
  
  if (raw.indexOf("search sharepoint for") == 0){
    query = raw.substring("search sharepoint for".length)
  }
  
  if (source === "bing"){
    window.location.href= ("http://bing.com/search?q=" + query);
  }
  else if (source === "sharepoint"){
    window.location.href= ("https://msft.spoppe.com/search/Pages/results.aspx?k=" + query);
  }
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
  search_query = search_query.toLowerCase();
  if (search_query.indexOf("show me emails") == 0){
    search_query = search_query.substring("show me emails".length);
  }

  search(search_query);
}

function suggest_meeting_times(params){
   
   var ticks = null;
   var today = new Date();
   if (!params.time || params.time === "today"){
     ticks = get_start_and_end_ticks(today, 0)
   }
   else if (params.time === "next week"){
     ticks = get_start_and_end_ticks(today.addDays(7), 0)
   }
   else if (params.time === "tomorrow"){
     ticks = get_start_and_end_ticks(today.addDays(1), 0)
   }
    
    if (!ticks) {
      return;
    }

   $.ajax({
      type: "POST",
      url: "https://snapmeet.azurewebsites.net/SetupMeeting/Suggest?alias=saahm",
      contentType:"application/json; charset=utf-8",
      data: JSON.stringify({ SearchStartTime: ticks[0],
          SearchEndTime: ticks[1],
          Duration: "60",
          AttendeeNames: [params.person],
          AttendeeAddresses: [params.email],
          HasConferenceRoom: true}),
      dataType: "json"
      }).done( function( data ){ 
        console.log(data);
      });
}

function get_start_and_end_ticks(date, date_offset) {
  var current_time = new Date();
  var selected_date = date;
  selected_date = new Date(selected_date.getTime() + (date_offset * 86400000));
  console.log(selected_date);
  var start_time;
  var end_time;
  if(current_time > selected_date) {
    if(current_time.getHours() >= 9 && current_time.getHours() < 16){
      //start with today
      start_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate(), current_time.getHours()+1, 0, 0, 0);
      end_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate(), 17, 0, 0, 0);
    }
    else if(current_time.getHours() <= 9) {
      //start with today
      start_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate(), 9, 0, 0, 0);
      end_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate(), 17, 0, 0, 0);
    }
    else {
      //start with tomorrow
      start_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate()+1, 9, 0, 0, 0);
      end_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate()+1, 17, 0, 0, 0);
      //TODO: check if it's the weekend
      //TODO: reset the dropdown to tomorrow
    }
  }
  else {
    start_time = new Date(selected_date.getFullYear(), selected_date.getMonth(), selected_date.getDate(), 9, 0, 0, 0);
    end_time = new Date(selected_date.getFullYear(), selected_date.getMonth(), selected_date.getDate(), 17, 0, 0, 0);
  }
  var start_ticks = start_time.getTime() + (start_time.getTimezoneOffset()*60);
  var end_ticks = end_time.getTime() + (end_time.getTimezoneOffset()*60);
  return [start_ticks, end_ticks];
}

function reset_tree(){
  params = {}
  // todo add other things here ...  as needed
}

tree = {
  "show me emails":{ 
    "execute" : function( text ){ show_me_emails(text) } ,
    "options":{ 
      "to" : {
        "autocomplete": mangosteen_people_search, 
        "action" :  function( text ){ show_me_emails(getSearchQuery()) } 
      },
      "from" : {
        "autocomplete": mangosteen_people_search, 
        "action" :  function( text ){ show_me_emails(getSearchQuery()) } 
      },
      "about" : { "terms": ["office now", "digital life & digital work"], "action" :  function( text ){ show_me_emails(getSearchQuery()) }  },
      "with links to" : { "terms" : ["yammer.com", "bing.com", "xbox.com", "twitter.com", "flickr.com", "ifttt.com", "wikipedia.org", "facebook.com"], "action": function( text ){ show_me_emails(getSearchQuery()) } },
      "sent before " : {"terms" : ["yesterday", "monday", "june", "august"], "action":  function( text ){ show_me_emails(getSearchQuery()) } },
      "sent after" : {"terms" : ["yesterday", "monday", "july"], "action" :  function( text ){ show_me_emails(getSearchQuery()) } },
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
    "execute": function(){ /*suggest_meeting_times(params)*/ },
    "options" : {
      "with" : { 
        "autocomplete" : snapmeet_people_search,
        "action" : function(person){ params.person = person; resolve_email(person, function(email) {params.email = email;} ) }
      },
      "sometime" : { 
        "terms" : ["next week", "today", "tomorrow"],
        "action" : function(time){ params.time = time; }
      },
      "about" : { 
        "action" : function(subject){ params.time = subject; },
        "terms": ["office now", "one clip", "next", "loud mango", "revolve", "hiking", "bing ux", "DLW", "photography", "nikon", "hiking", "overclocked"] 
      }
    }
  },
  "show me documents":{ 
    "execute": function(){ 
      params = params || {};
      if (params.email && !params.about){
        find_documents_by(params.email);
      }
      if (params.about){
        fast_search(params.about + " " + (params.email || "" ) )
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
  "search sharepoint for": {
    "execute" : function(text){ pipe_to_search_engine(text, "sharepoint");}
  },
  "search the web for":{
    "execute": function(text){ pipe_to_search_engine(text, "bing"); }
  }
}
