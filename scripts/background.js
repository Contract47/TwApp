/*eslint-env webextensions, node, jquery*/
var _filtersChanged = false;

function filter(){
  
  var lines = getLines();
  
  // No new lines => no filter sync required
  if(lines.length > 0){
    chrome.storage.sync.get({filters:[],changed:false},function(data){
      
      // Filters were modified => reset change flag
      if(_filtersChanged === true){
        _filtersChanged = data.changed;
        chrome.storage.sync.set({changed:false});
      }
      
      console.log(_filtersChanged);
      // Loop over new lines
      lines.forEach(function(line){
      
        // If no filters were set => just show previous content
        if(data.filters.length === 0){
          $(line.element).show();
        
        // Otherwise loop over filters
        }else{
          var removed = false;
          
          data.filters.forEach(function(filterObj){
            
            // Filter for content or name matches: hide line
            if( filterObj.content && line.post.text.indexOf(filterObj.filter) != -1 ||
                filterObj.user    && line.user.text == filterObj.filter){
                  
                  // Auto-Reply to a post, but only if it has not been filtered already
                  if(filterObj.reply && $(line.element).attr('filtered') !== "true"){
                    console.log(filterObj.reply);
                  }else{
                    $(line.element).hide();
                    removed = true;
                  }
            }
            
            $(line.element).attr('filtered',true);
          });
          
          // Line is not shown but was not removed => show it again
          if(!$(line.element).is(":visible") && !removed){
            $(line.element).show();
          }
        }
      });
    });
  }
  
  // Check if filters changed
  chrome.storage.sync.get({changed:false},function(data){ _filtersChanged = data.changed; });
  
  // Check again in a few
  setTimeout(function(){filter();},500);
}

function getLines(){
  
  var lines = [];
  
  // Get all lines again if filters changed, otherwise skip those already checked
  var lineSelector = ".line" + ((_filtersChanged)? "":"[filtered!=true]");
  
  $(lineSelector).each(function(i,line){
    
    var lineObj = {};
    
    lineObj.element       = line;
    
    lineObj.user          = {};
    lineObj.user.element  = $(line).find('.user')[0];
    lineObj.user.text     = lineObj.user.element.innerHTML;
    
    lineObj.post          = {};
    lineObj.post.element  = $(line).find('.text')[0];
    lineObj.post.text     = lineObj.post.element.innerHTML;
    
    lines.push(lineObj);
  });
  
  return lines;
}

filter();