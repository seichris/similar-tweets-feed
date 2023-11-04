function extractTweetData(tweetElement) {
  // Clear the inline styles and return the HTML of a tweet element
  tweetElement.style = "";
  return tweetElement.outerHTML;
}

function waitForImagesToLoad(tweetElement) {
  return new Promise((resolve) => {
    const images = tweetElement.querySelectorAll("img");
    let loaded = images.length; // Counter for loaded images

    if (loaded === 0) {
      resolve(); // Resolve immediately if there are no images
    } else {
      images.forEach((img) => {
        if (img.complete) {
          loaded--;
          if (loaded === 0) resolve();
        } else {
          img.addEventListener("load", () => {
            loaded--;
            if (loaded === 0) resolve();
          });
          img.addEventListener("error", () => {
            loaded--;
            if (loaded === 0) resolve(); // Even on error, we proceed
          });
        }
      });
    }
  });
}

function simulateScroll(tweetElement) {
  return new Promise((resolve) => {
    // Find the scrollable parent of the tweetElement, might require specific selectors
    const scrollableParent = document.querySelector("main");
    if (scrollableParent) {
      let lastScrollTop = scrollableParent.scrollTop;
      scrollableParent.scrollTop += 500; // Scroll down 500px

      // Wait for a moment to let the images load
      setTimeout(() => {
        // Scroll back up
        scrollableParent.scrollTop = lastScrollTop;

        // Wait another moment after scrolling back up
        setTimeout(() => {
          resolve();
        }, 1000);
      }, 1000);
    } else {
      resolve(); // Resolve if there's no scrollable parent
    }
  });
}

async function checkForTweets() {
  const tweets = [];
  const tweetElements = document.querySelectorAll(
    'div[data-testid="cellInnerDiv"]:nth-child(-n+10)'
  );

  if (tweetElements.length > 0) {
    console.log(`Found ${tweetElements.length} tweets on the page.`);
    for (const tweetEl of tweetElements) {
      // Try to get images by scrolling or waiting for images to load before extracting data
    //   await simulateScroll(tweetEl);
    //   await waitForImagesToLoad(tweetEl);
      const tweetData = extractTweetData(tweetEl);
      console.log("Extracted Tweet Data:", tweetData);
      tweets.push(tweetData);
    }

    // Send the tweets back to your background script
    chrome.runtime.sendMessage(
      { action: "extractedTweets", data: tweets },
      function (response) {
        console.log("Tweets sent to the background script");
      }
    );

    clearInterval(pollingInterval); // Clear the interval once the tweets are found
  } else {
    console.log("No tweets found, retrying...");
  }
}

// Start polling for tweets
const pollingInterval = setInterval(checkForTweets, 1000); // Check every second

// Optional: set a limit for how long to poll
const startTime = Date.now();
const timeout = 10000; // Stop after 10 seconds

const timeoutInterval = setInterval(() => {
  if (Date.now() - startTime > timeout) {
    console.log(
      "No tweets found after waiting 10 seconds. Stopping the polling."
    );
    clearInterval(pollingInterval);
    clearInterval(timeoutInterval);
  }
}, 1000);

// Alternative version simply waits for two seconds before getting result:

// setTimeout(() => {
//   // Print the entire DOM after a 5-second delay
//   const allDOM = document.documentElement.outerHTML;
//   console.log(allDOM);

//   // Continue with the extraction process
//   const tweets = [];
//   // Use the selector that targets the first two tweets
//   const tweetElements = document.querySelectorAll(
//     'div[data-testid="cellInnerDiv"]:nth-child(-n+2)'
//   );

//   console.log(`Found ${tweetElements.length} tweets on the page.`);

//   tweetElements.forEach((tweetEl) => {
//     const tweetData = extractTweetData(tweetEl);
//     console.log("Extracted Tweet Data:", tweetData);
//     tweets.push(tweetData);
//   });

//   // Send the tweets back to your background script
//   chrome.runtime.sendMessage(
//     { action: "extractedTweets", data: tweets },
//     function (response) {
//       console.log("Tweets sent to the background script");
//       // No need to close the tab here, it will be done by the background script
//     }
//   );
// }, 2000); // wait 2 seconds before exectuing script
