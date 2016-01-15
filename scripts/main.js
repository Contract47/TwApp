$("body")[0].style.display = "";

var _filtersChanged = false;

$('<div id="collectedLines" style="border-style:solid;"></div>').insertBefore(".chat-lines");

var votingCount = 0;
var votingData  = {};
var votingUsers = {};
var chartPrep = {
  title: {
      text: "Voting:",
      fontFamily: "Verdana",
      fontColor: "Peru",
      fontSize: 28
  },
  animationEnabled: false,
  data: [
    {
        toolTipContent: "<span style='\"'color: {color};'\"'><strong>{indexLabel}</strong></span><span style='\"'font-size: 20px; color:peru '\"'><strong>{y}</strong></span>",

        indexLabelPlacement: "inside",
        indexLabelFontColor: "white",
        indexLabelFontWeight: 600,
        indexLabelFontFamily: "Verdana",
        color: "#62C9C3",
        type: "bar",
        dataPoints: []
    }
  ]
};
  
function filter(){
  
  var lines       = getLines();
  
  // No new lines => no filter sync required
  if(lines.length > 0){
    chrome.storage.sync.get({filters:[],voting:{},changed:false},function(data){
      
      if(data.voting.active){ 
        $('<button id="votingChartClear">Clear</button>').insertBefore(".chat-lines");
        $("#votingChartClear").click(function(){ clearVoting(); });
        $('<div id="votingChart" style="border-style:solid;"></div>').insertBefore(".chat-lines");
      }else{
        if($("#votingChart")[0]){
          $("#votingChart").remove();
          $("#votingChartClear").remove();
          clearVoting();
        }
      }
      
      // Loop over new lines
      lines.forEach(function(line){
        
        // If no filters were set => just show previous content
        if(data.filters.length === 0 && (!data.voting || !data.voting.active) ){
          $(line.element).show();
        
        // Otherwise loop over filters
        }else{
          var removed = false;
          
          data.filters.forEach(function(filterObj){
            
            // Filter for content or name matches: hide line
            if( filterObj.content && line.post.text &&  line.post.text.toLowerCase().indexOf(filterObj.filter.toLowerCase()) != -1 ||
                filterObj.user    && line.user.text &&  line.user.text.toLowerCase() == filterObj.filter.toLowerCase()){
                  
                  // Auto-Reply to a post, but only if it has not been filtered already
                  if(filterObj.reply && $(line.element).attr('filtered') !== "true"){
                    // ===============================================================
                    // ===============================================================
                    //                            REPLY
                    // ===============================================================
                    // ===============================================================
                    console.log(filterObj.reply);
                    // ===============================================================
                  }
                  
                  if(filterObj.collect && $(line.element).attr('cloned') !== "true"){
                    $(line.element).show();
                    $("#collectedLines").append($(line.element).clone());
                    $(line.element).attr('cloned',true);
                  }
                  
                  if(filterObj.hide){
                    $(line.element).hide();
                    removed = true;
                  }
            }
          });
          
          if(data.voting && data.voting.active && !votingUsers[line.user.text] && line.post.text && line.post.text.toLowerCase().indexOf(votingFilter) != -1 ){
            
            var votingFilter  = data.voting.filter.toLowerCase();
            var lineText = line.post.text.toLowerCase().replace(votingFilter,'').replace(/\s/g, '');
            
            if(!votingData[lineText]){ votingData[lineText] = 0; }
            
            votingCount++;
            votingData[lineText]++;
            votingUsers[line.user.text] = true;
          }
          
          $(line.element).attr('filtered',true);
          
          // Line is not shown but was not removed => show it again
          if(!$(line.element).is(":visible") && !removed){
            $(line.element).show();
          }
        }
      });
      
      if(data.voting.active){
        chartPrep.title.text      = "Voting ("+data.voting.filter+"):";
        chartPrep.data[0].dataPoints = [];
        
        for(var k=0; k<Object.keys(votingData).length;k++){
          var votingKey   = Object.keys(votingData)[k];
          var percentage  = Math.round((votingData[votingKey]/votingCount)*100);
          
          chartPrep.data[0].dataPoints.push({ y: percentage, label: ""+percentage, indexLabel: votingKey });
        }
        
        chartPrep.data[0].dataPoints.sort(compare);
        new CanvasJS.Chart("votingChart", chartPrep).render();
      }
    });
  }
  
  _filtersChanged = false;
      
  // Check if filters changed
  chrome.storage.sync.get({changed:false},function(data){ 
    
    _filtersChanged = data.changed; 
    
    // Filters were modified => reset change flag
    if(_filtersChanged === true){
      chrome.storage.sync.set({changed:false});
    }
  });
  
  // Check again in a few
  setTimeout(function(){filter();},500);
}

function getLines(){
  
  var lines = [];
  
  // Get all lines again if filters changed, otherwise skip those already checked
  var lineSelector = ".chat-line" + ((_filtersChanged)? "":"[filtered!=true]");
  
  $(".chat-lines").find(lineSelector).each(function(i,line){
    
    var lineObj = {};
    
    lineObj.element       = line;
    
    lineObj.user          = {};
    lineObj.user.element  = $(line).find('.from')[0];
    lineObj.user.text     = lineObj.user.element.innerHTML;
    
    lineObj.post          = {};
    lineObj.post.element  = $(line).find('.message')[0];
    
    if(lineObj.post.element){
      lineObj.post.text     = lineObj.post.element.innerHTML;
    }
    
    lines.push(lineObj);
  });
  
  return lines;
}

function clearVoting(){
  votingCount = 0;
  votingData  = {};
  votingUsers = {};
  chartPrep.data[0].dataPoints = [];
  
  if($("#votingChart")[0]){
    new CanvasJS.Chart("votingChart", chartPrep).render();
  }
}

function compare(a,b) {
  if (a.y < b.y)
    return -1;
  else if (a.y > b.y)
    return 1;
  else 
    return 0;
}

filter();