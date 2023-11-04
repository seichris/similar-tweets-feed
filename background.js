let originalTabId;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "registerOriginalTab") {
    // Save the tab ID from the sender
    originalTabId = sender.tab.id;
    console.log(`Original tab registered with ID: ${originalTabId}`);

    sendResponse({ status: "Original tab registered", tabId: originalTabId });
  }
  // ... other message handling
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "fetchSimilarTweets") {
    console.log(
      `Received request to fetch similar tweets from: ${request.url}`
    );

    // Open a new tab in the background
    chrome.tabs.create({ url: request.url, active: false }, function (tab) {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          // Use chrome.scripting.executeScript for Manifest V3
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ["extractTweets.js"],
            },
            function (results) {
              // The results are now in the results array
              if (chrome.runtime.lastError) {
                console.error(
                  `Script injection failed: ${chrome.runtime.lastError.message}`
                );
              } else {
                console.log("Script executed in the new tab.");
                // Optionally, close the tab after you're done with it
                // chrome.tabs.remove(tab.id);
              }
            }
          );
        }
      });
    });

    return true; // indicates you wish to send a response asynchronously
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "extractedTweets") {
    const extractedTweets = request.data;
    console.log("Extracted tweets:", extractedTweets);

    // Check if originalTabId is defined
    if (originalTabId != null) {
        console.log(`Sending extracted tweets to original tab with ID: ${originalTabId}`);

      chrome.tabs.sendMessage(originalTabId, {
        action: "displayExtractedTweets",
        data: request.data,
      });
    } else {
      console.error("Original tab ID not defined.");
    }

    // Close the tab after the data has been received
    if (sender.tab) {
      chrome.tabs.remove(sender.tab.id, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Failed to close tab: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log("Tab closed after extracting tweets");
        }
      });
    }

    sendResponse({ status: "Tweets received" });
    return true; // indicates you wish to send a response asynchronously
  }
});
