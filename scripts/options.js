$("#saveButton").click(function(){ save(); });
$(".removeButton").click(function(event){ removeFilter(event); });

$("#addButton").click(function(){ addFilter(); });

const FILTER_STRUCT = [
  {field:"filter",  tag:"input",content:"value"},
  {field:"user",    tag:"input",content:"checked",type:"checkbox"},
  {field:"content", tag:"input",content:"checked",type:"checkbox"},
  {field:"hide",    tag:"input",content:"checked",type:"checkbox"},
  {field:"collect", tag:"input",content:"checked",type:"checkbox"},
  {field:"reply",   tag:"input",content:"value"}
];

var row = $('#filterTab')[0].insertRow();

FILTER_STRUCT.forEach(function (filter){
  var cell = document.createElement("th");
  cell.innerHTML = filter.field;
  row.appendChild(cell);
});

function addFilter(){
  var filterStr = '<tr>';
  
  FILTER_STRUCT.forEach(function(filter){
    filterStr += '<td><'+filter.tag+((filter.type)? ' type="'+filter.type+'"':'')+' class="'+filter.field+'"></'+filter.tag+'></td>';
  });
  
  // Add new filter line
  var filter = 
  $(filterStr+
    '<td><button class="removeButton">-</button></td></tr>').
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
    
    var filter = {};
    
    for(var j=0; j<FILTER_STRUCT.length; j++){
      filter[FILTER_STRUCT[j].field] = cells[j].childNodes[0][FILTER_STRUCT[j].content];
    }
    
    filters.push(filter);
  });
  console.log(filters);
  return filters;
}

function save(){
  chrome.storage.sync.set({filters:getFilters(),voting:{filter:$("#votingFilter")[0].value,active:$("#filterActive")[0].checked},changed:true});
}

function load(){
  chrome.storage.sync.get({filters:getFilters(),voting:"!cd"},function(data){
    data.filters.forEach(function(filterObj){
      var filterLine = addFilter();
      
      FILTER_STRUCT.forEach(function(filter){
        filterLine.find('.'+filter.field)[0][filter.content] = filterObj[filter.field];
      });
    });
    
    $("#votingFilter")[0].value   = data.voting.filter;
    $("#filterActive")[0].checked = data.voting.active;
  });
}

load();