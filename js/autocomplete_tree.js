var tree = {
  "show me emails":{
    "from" : {"autcomplete":true },
    "about" : { "terms": ["office now", "digital life & digital work"] },
    "with links to" : { "terms" : ["yammer.com", "facebook.com"]},
    "sent before " : {"terms" : ["yesterday", "monday", "june"]},
    "sent after" : {"terms" : ["yesterday", "monday", "july"]}
  },
  "launch": {
    "word" : {},
    "excel" : {},
    "powerpoint" :{},
    "onenote" : {},
  },
  "create"{
    "a new" : { "terms" : ["doc", "spreadsheet", "presentation", "note"] },
  },
  "schedule a meeting": {
    "with" : { "autocomplete" : true }
    "sometime" : { "terms" : ["this week", "today", "tomorrow"]
    }
  }
  "find me documents":{
    "by": {
      "autocomplete" : true
    },
    "trending around" : {
      {"autocomplete" : true }
    },
    "about" : {}
  },
  "who is": { "autocomplete" : true },
  "search the web":{},
}
