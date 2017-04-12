function postResponse(channel, userName, newAccount, account, link) {
  
  // if the account already exists
  var insertedText = "updated";
  
  // if we made a new one
  if (newAccount === true) {
    insertedText = "created";
  }
  
  var payload = {
    "channel": "#" + channel,
    "link_names": 1,
    "attachments":[
       {
          "fallback": "Something went wrong.",
          "pretext": "<" + link + "|" + account + " - Ad History> " + "was " + insertedText + " successfully.",
       }
    ]
  };

var url = 'https://hooks.slack.com/services/AAAAAAAAA/AAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAA';
var options = {
  'method': 'post',
  'payload': JSON.stringify(payload)
};

var response = UrlFetchApp.fetch(url,options);
}
