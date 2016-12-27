var params = "";
var newAccount = false;
var textRaw = "";
var textAccount = "Unknown Account";
var account = "Unknown Account";
var messageText = "Unknown changes";
var changeCount = 0;



function doPost(request) {
  params = request.parameters;
  newAccount = false;
  
  // make sure this came from us (Slack authentication token)
  if (params.token == "HxQjg2tCqOIzVIxX1v7OUMD3") {
    
    segmentText();
    
    // don't do anything if there wasn't a semicolon
    if (changeCount > 0) {
      
      // this is the Ad History folder in Google Drive
      var folder = DriveApp.getFolderById("0B7vBh6lfLDj6V2ZMVjhIMmVfOHc");
      var files = folder.getFiles();
      
      // see if a file already exists by this name
      var testString = account + " - Ad History";
      
      while (files.hasNext()) {
        var file = files.next();
        
        // regex test to make sure the search is case insensitive
        var string1 = testString;
        var string2 = file;
        var regex = new RegExp('^' + string1 + '$', 'i');
        
        // if it does, open it, we'll use this one (doc)
        if (regex.test(string2)) {
          var doc = DocumentApp.openById(file.getId());
          var body = doc.getBody();
          var text = body.editAsText();
          var link = file.getUrl();
          break;
        }
        
        // if there isn't a file with the Account Name, make a new one
        if (!files.hasNext()) {
          var doc = DocumentApp.create(testString);
          var body = doc.getBody();
          var text = body.editAsText();
          
          // this is the title of the document
          body.insertParagraph(0, account).setAttributes(style3);
          body.appendParagraph("").setAttributes(style1);
          newAccount = true;
        }
      }
      
      // make an array of changes
      var changes = new Array();
      
      for (var i = 0; i < changeCount; i++) {
        changes[i] = messageText[i] || "No change provided";
      }
      
      // convert Slack usernames into real names
      var editorRaw = String(params.user_name);
      var editor = "Unknown User";
      
      if (editorRaw === "dj") {
        editor = "Daniel James";
      }
      else if (editorRaw === "jwilson") {
        editor = "Jack Wilson";
      }
      else if (editorRaw === "jlundy") {
        editor = "Justin Lundy";
      }
      else if (editorRaw === "kmckillop") {
        editor = "Kevin McKillop";
      }
      
      // add a timestamp
      var date = Utilities.formatDate(new Date(), "America/Toronto", "EEEE, MMMM d, yyyy");
      var time = Utilities.formatDate(new Date(), "America/Toronto", "h:mm a");
      
      // this is the slightly grey line above the changes
      var textToAppend = editor + ' made the following edits on ' + date + " at " + time + "\n";
      body.appendParagraph(textToAppend).setAttributes(style1);
      
      // add the changes as bullets
      for (var i = 0; i < changes.length; i++) {
        body.appendListItem(changes[i]).setGlyphType(DocumentApp.GlyphType.BULLET).setAttributes(style2);
      }
      
      // new line and horizontal rule to make it cleaner
      text.appendText('\n');
      doc.appendHorizontalRule();
      text.appendText('\n');
      
      // we're done editing
      doc.saveAndClose();
      
      // if we created a new document, we need to move it into the Ad History folder by copying and
      // then deleting it because Google Apps Script doesn't have a move function for some stupid reason
      if (newAccount === true) {
        var files = DriveApp.getRootFolder().getFiles();
        while (files.hasNext()) {
          var file = files.next();
          
          // regex test to make sure the search is case insensitive
          var string1 = testString;
          var string2 = file;
          var regex = new RegExp('^' + string1 + '$', 'i');
          
          if (regex.test(string2)) {
            folder.addFile(file);
            var pull = DriveApp.getRootFolder();
            pull.removeFile(file);
            break;
          }
        }
        // so we can link to the document in the confirmation
        var link = file.getUrl();
      }
      
      // send a confirmation into Slack
      postResponse("history", params.user_name, newAccount, account, link);
    }
    
  } else {
    return;
  }
  
}

function segmentText() {
  
  // assign the raw text to a variable
  textRaw = String(params.text);
  
  // split it into Account - Changes;
  // textAccount = textRaw.split(/\s{1}-\s{1}/g);
  var indexOfDash = textRaw.indexOf(" - ");
  account = textRaw.slice(0, indexOfDash);
  
  // account name (left of the " - ")
  // account = textAccount[0] || "No account found with this name";
  
  messageText = textRaw.slice(indexOfDash + 3).split(/\s*;\s*/g);
  
  // changes (split by semicolons)
  // messageText = textAccount[1].split(/\s*;\s*/g);
  
  // the number of semicolons
  changeCount = (textAccount[1].match(/;/g) || []).length;
  
}


var style1 = {};// style example 1
style1[DocumentApp.Attribute.FONT_SIZE] = 10;
style1[DocumentApp.Attribute.FONT_FAMILY] = DocumentApp.FontFamily.CALIBRI;
style1[DocumentApp.Attribute.FOREGROUND_COLOR] = "#555555";
style1[DocumentApp.Attribute.BOLD] = false;

var style2 = {};// style example 2
style2[DocumentApp.Attribute.FONT_SIZE] = 10;
style2[DocumentApp.Attribute.FONT_FAMILY] =DocumentApp.FontFamily.PROXIMA_NOVA;
style2[DocumentApp.Attribute.FOREGROUND_COLOR] = "#111111";
style2[DocumentApp.Attribute.BOLD] = false;

var style3 = {};// style example 3
style3[DocumentApp.Attribute.FONT_SIZE] = 30;
style3[DocumentApp.Attribute.FONT_FAMILY] = DocumentApp.FontFamily.ARIAL;
style3[DocumentApp.Attribute.FOREGROUND_COLOR] = "#000000";
style3[DocumentApp.Attribute.BOLD] = true;