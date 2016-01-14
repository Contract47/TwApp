function filter(){
  
  var lines = getUnfilteredLines();
  
  if(lines.length > 0){
    chrome.storage.sync.get({filters:[]},function(data){
      lines.forEach(function(line){
        data.filters.forEach(function(filterObj){
          
          if( filterObj.content && line.post.text.indexOf(filterObj.filter) != -1 ||
              filterObj.user    && line.user.text == filterObj.filter){
                $(line.element).hide();
          }
          
          $(line.element).attr('filtered',true);
        });
      });
    });
  }
  
  setTimeout(function(){filter();},500);
}

function getUnfilteredLines(){
  var lines = [];
  $(".line[filtered!=true]").each(function(i,line){
    
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