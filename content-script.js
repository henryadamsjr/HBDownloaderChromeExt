function HumbleLink(docType, linkURL) {
    this.docType = docType;
    this.linkURL = linkURL;
}

function HumbleItem(itemName, links) {
    this.itemName = itemName;
    this.links = links;
}

function getBundleName() {
    var title = document.title;
    var semicolonIndex = title.indexOf(":")
    var byIndex = title.lastIndexOf(" by ")
    var payIndex = title.lastIndexOf("(pay")
    var endIndex = title.length

    if (byIndex !== -1) {
        endIndex = byIndex
    }
    else if (payIndex !== -1) {
        endIndex = payIndex
    }

    return title.substring(semicolonIndex + 1, endIndex).trim()
}

function getLinks(buttons) {
    const downloadPriority = ["ZIP", "FLAC", "MP3", "PRC", "MOBI", "PDF(HQ)", "PDF", "EPUB", "CBR", "CBZ"]
    var links = []
    //A future version will allow this to be set by the user
    var downloadAll = false
    var previousPriority = -1
    var linkToPush = null;

    for (button of buttons) {
        let docType = button.getElementsByClassName("label").item(0).innerHTML;
        let linkURL = button.getElementsByTagName("a").item(0).getAttribute("href");
        let currentPriority = downloadPriority.indexOf(docType);

        if (downloadAll) {
            links.push(new HumbleLink(docType, linkURL));
        }
        else if (currentPriority === -1) {
            links.push(new HumbleLink(docType, linkURL));
        }
        else if (currentPriority > previousPriority) {
            linkToPush = new HumbleLink(docType, linkURL);
        }
        previousPriority = currentPriority;
    }

    if (!downloadAll) {
        links.push(linkToPush);
    }

    return links;
}


function run(allDownloadButtons) {

    var bundleName = getBundleName();
    var downloadItems = []

    for (downloadButtons of allDownloadButtons) {
        let item = downloadButtons.parentNode.parentNode;
        let itemName = item.getAttribute("data-human-name");

        let links = getLinks(downloadButtons.children)
        let humbleItem = new HumbleItem(itemName, links)
        downloadItems.push(humbleItem)
    }

    chrome.runtime.sendMessage({ bundleName: bundleName, downloadItems: downloadItems });

    /*(async () => {
        const response = await chrome.runtime.sendMessage(downloadItems);
        //console.log(response);
    })(); */
}

function waitForButtons() {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations, observer) => {
            const allDownloadButtons = document.getElementsByClassName("download-buttons");
            if (allDownloadButtons.length > 0) {
                observer.disconnect();
                resolve(allDownloadButtons);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

waitForButtons().then((allDownloadButtons) => {
    run(allDownloadButtons);
});

/* chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {

    //Find active tab
    chrome.tabs.query({ active: true }, function (tabs) {
        var activeTab = tabs[0];

        //Generate filepath
        var filepath = activeTab.title + "/" + item.filename;

        //TODO: Sanitize filepath.

        //Suggest filename for this download.
        __suggest({ filename: filepath });
    })

});   */