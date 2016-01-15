chrome.contextMenus.onClicked.addListener(function(info, tab) {
  
  var user, content;
  
  switch(info.menuItemId){
    case 'addUserFilter':     user    = true; break;
    case 'addContentFilter':  content = true; break;
    case 'addFullFilter':     user    = true; 
                              content = true; break;
  }
  
  var filter = {
    filter:   info.selectionText,
    user:     user,
    content:  content,
    hide:     true,
    reply:    ''
  };
  
  chrome.storage.sync.get({filters:[]},function(data){
    var filters = data.filters;
    filters.push(filter);
    
    chrome.storage.sync.set({filters: filters,changed:true});
  });
  
});

chrome.contextMenus.create({
  id: 'addFilter',
  title: chrome.i18n.getMessage('addFilterTitle'),
  contexts: ['selection']
});

chrome.contextMenus.create({
  id: 'addUserFilter',
  parentId: 'addFilter',
  title: chrome.i18n.getMessage('addUserFilterTitle'),
  contexts: ['selection']
});

chrome.contextMenus.create({
  id: 'addContentFilter',
  parentId: 'addFilter',
  title: chrome.i18n.getMessage('addContentFilterTitle'),
  contexts: ['selection']
});

chrome.contextMenus.create({
  id: 'addFullFilter',
  parentId: 'addFilter',
  title: chrome.i18n.getMessage('addFullFilterTitle'),
  contexts: ['selection']
});