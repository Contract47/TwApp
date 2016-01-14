$("#saveButton").click(function(){ save(); });
$(".removeButton").click(function(event){ removeFilter(event); });

$("#addButton").click(function(){ addFilter(); });

function addFilter(){
  // Add new filter line
  var filter = 
  $('<tr><td><input class="filter"></input></td>  <td><input type="checkbox" class="user"></input></td>  <td><input type="checkbox" class="content"></input></td><td><button class="removeButton">-</button></td></tr>').
  appendTo("#filterTab");
  
  // Add remove-event
  filter.find(".removeButton").click(function(event){ removeFilter(event); });
  
  return filter;
}

function removeFilter(event){
  $(event.target.parentNode.parentNode).remove();
}

function getFilters(){
  var filters = [];
  
  $("#filterTab > tbody > tr").each(function(i,child){
    if(i===0){ return true; } // Skip header line
    
    var cells   = child.cells;
    
    var filter = {
      filter:   cells[0].childNodes[0].value,
      user:     cells[1].childNodes[0].checked,
      content:  cells[2].childNodes[0].checked
    };
    
    filters.push(filter);
  });
  
  return filters;
}

function save(){
  chrome.storage.sync.set({filters:getFilters()});
}

function load(){
  chrome.storage.sync.get({filters:getFilters()},function(data){
    data.filters.forEach(function(filterObj){
      var filterLine = addFilter();
      filterLine.find('.filter').val(filterObj.filter);
      filterLine.find('.user').prop('checked',filterObj.user);
      filterLine.find('.content').prop('checked',filterObj.content);
    });
  });
}

load();