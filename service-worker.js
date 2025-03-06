const nameMap = new Map();
const replaceRegex = /[^a-z0-9 \-_&,]/gi;
var bundleName;

chrome.runtime.onMessage.addListener(
    function (items, sender, sendResponse) {
        bundleName = items.bundleName.replace(replaceRegex, "");

        for (humbleItem of items.downloadItems) {
            
            for (link of humbleItem.links) {
                let itemName = humbleItem.itemName
                chrome.downloads.download({
                    url: link.linkURL,
                    conflictAction: "overwrite", 
                    saveAs: false
                }, function(id){
                    nameMap.set(id, itemName.replace(replaceRegex, ""));
                });
            }
        }
    }
);

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    var splitFilename = downloadItem.filename.split(".")
    var extension = splitFilename[splitFilename.length - 1]
    var newFilename = bundleName + "/" + nameMap.get(downloadItem.id) + "." + extension
    suggest({ filename: newFilename, conflictAction: "overwrite"});
});