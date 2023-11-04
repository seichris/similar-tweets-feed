//       btn.innerHTML = `
//         <img src="chrome-extension://cedkgfpchfhodchgaciiejgebhoimjnh/images/K.png" alt="K" style="width: 24px; height: 24px;">
//       `;

// Function to add buttons to tweets
function addButtonToTweets() {
  // Select all tweet action divs
  const tweetActionDivs = document.querySelectorAll('div[role="group"]');
  tweetActionDivs.forEach((div) => {
    // Check if our button is already added
    if (!div.querySelector(".my-custom-button")) {
      // Create the button
      const btn = document.createElement("div");
      btn.className = "my-custom-button css-1dbjc4n";
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.margin = "auto";
      btn.innerHTML = `
      <div dir="ltr" class="css-901oao r-1awozwy r-1bwzh9t r-6koalj r-37j5jr r-a023e6 r-16dba41 r-1h0z5md r-rjixqe r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0" style="text-overflow: unset;"><div class="css-1dbjc4n r-xoduu5"><div class="css-1dbjc4n r-1niwhzg r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-1ny4l3l r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div><svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"><g>            <path d="M7.323 2h11.443l-3 5h6.648L6.586 22.83 7.847 14H2.523l4.8-12zm1.354 2l-3.2 8h4.676l-.739 5.17L17.586 9h-5.352l3-5H8.677z"></path>
      </g></svg></div></div>
      `;

      // Function to handle hover state
      function handleHover(event) {
        const isHovered = event.type === "mouseenter"; // Check if the mouse is entering or leaving

        // Find elements with the classes and change styles accordingly
        const elementWithR1bwzh9t = btn.querySelector(".css-901oao");
        if (elementWithR1bwzh9t) {
          if (isHovered) {
            elementWithR1bwzh9t.classList.remove("r-1bwzh9t");
            elementWithR1bwzh9t.style.color = "rgb(29, 155, 240)";
          } else {
            // Re-add class when not hovered
            elementWithR1bwzh9t.classList.add("r-1bwzh9t");
            elementWithR1bwzh9t.style.color = ""; // Reset to CSS-defined color
          }
        }

        const elementWithR1niwhzg = btn.querySelector(".r-4qtqp9");
        if (elementWithR1niwhzg) {
          if (isHovered) {
            elementWithR1niwhzg.classList.remove("r-1niwhzg");
            elementWithR1niwhzg.style.color = "rgb(29, 155, 240)";
          } else {
            // Re-add class when not hovered
            elementWithR1niwhzg.classList.add("r-1niwhzg");
            elementWithR1niwhzg.style.color = ""; // Reset to CSS-defined color
          }
        }
      }

      // Attach hover event listeners to the button
      btn.addEventListener("mouseenter", handleHover);
      btn.addEventListener("mouseleave", handleHover);

      // Apply the margin-left style always
      btn.style.marginLeft = "10px";

      btn.onclick = function (event) {
        // Prevent the event from bubbling up to parent elements
        event.stopPropagation();
        event.preventDefault(); // Stop the default action as well, just in case

        console.log("Button clicked!"); // Confirm that the click event is registered

        // Send a message to the background script to register the current tab as the original tab
        chrome.runtime.sendMessage({ action: "registerOriginalTab" });

        // Initialize tweetId and username outside of the if block
        let tweetId;
        let username;

        // Traverse up to the top-level div of the tweet
        let topLevelDiv = this.closest(
          ".css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu"
        );
        if (topLevelDiv) {
          console.log("Top-level tweet div found.");

          // Find the <a> tag with the href attribute containing "/status/"
          let statusLink = topLevelDiv.querySelector('a[href*="/status/"]');
          if (statusLink) {
            console.log("Status link found.");

            // Extract the username and tweet ID from the href attribute
            const href = statusLink.getAttribute("href");
            const tweetDetailsMatch = href.match(/\/(\w+)\/status\/(\d+)/);
            if (
              tweetDetailsMatch &&
              tweetDetailsMatch[1] &&
              tweetDetailsMatch[2]
            ) {
              username = tweetDetailsMatch[1]; // Assign the username here
              tweetId = tweetDetailsMatch[2];
              console.log(`Username: ${username}`); // Log the username
              console.log(`Tweet ID: ${tweetId}`); // Log the tweet ID
            } else {
              console.log("Username and Tweet ID not found in the link.");
            }
          } else {
            console.log("Status link not found within the top-level div.");
          }
        } else {
          console.log("Top-level tweet div not found.");
        }

        // Check if tweetId and username were successfully retrieved before sending the message
        if (tweetId && username) {
          let similarTweetsUrl = `https://twitter.com/${username}/status/${tweetId}/similar`;
          console.log(
            `Requesting to fetch similar tweets from: ${similarTweetsUrl}`
          );
          chrome.runtime.sendMessage(
            { action: "fetchSimilarTweets", url: similarTweetsUrl },
            function (response) {
              console.log(`Opened tab with ID: ${response.tabId}`);
            }
          );
        } else {
          console.log(
            "Cannot fetch similar tweets without a tweet ID and username."
          );
        }
      };

      // Append the custom button to the tweet action div
      div.appendChild(btn);
    }
  });
}

// Run the function at a set interval to accommodate dynamically loaded content
setInterval(addButtonToTweets, 2000);

function findSectionToReplace() {
  for (let i = 0; i <= 6; i++) {
    const sectionId = `accessible-list-${i}`;
    const section = document.querySelector(
      `section[aria-labelledby="${sectionId}"]`
    );
    if (section) {
      // Apply styles to make the section scrollable
      section.style.overflowY = "auto"; // Enables vertical scrolling
      section.style.maxHeight = "100vh"; // Sets the maximum height to the viewport height
      section.style.position = "relative"; // Ensures the section flows within the layout
      return section;
    }
  }
  return null; // Return null if no section was found
}

function applyStylesToSidebar() {
  // Find the sidebar element by its data-testid attribute
  const sidebar = document.querySelector('[data-testid="sidebarColumn"]');

  if (sidebar) {
    const innerDiv = sidebar.querySelector("div");

    if (innerDiv) {
      // Apply the fixed position to the inner div
      innerDiv.style.position = "fixed";
      innerDiv.style.top = "0";
      innerDiv.style.paddingRight = "15%";

      console.log("Inner div of sidebar is now fixed.");
    } else {
      console.error("Inner div not found in sidebar.");
    }

    // Apply the desired styles to the sidebar
    sidebar.style.width = "560px";
    sidebar.style.marginLeft = "10px";
    // sidebar.style.position = 'fixed';
    // sidebar.style.top = '0';

    // Remove the .r-1hycxz class from the sidebar
    sidebar.classList.remove("r-1hycxz");

    // Find the next div with .r-1hycxz class and remove the class
    const nextDivWithClass = sidebar.closest("div").querySelector(".r-1hycxz");
    if (nextDivWithClass) {
      nextDivWithClass.classList.remove("r-1hycxz");
    }

    console.log("Styles applied and class removed from sidebar and next div.");
  } else {
    console.error("Sidebar not found.");
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "displayExtractedTweets") {
    console.log("Received message to display extracted tweets", request.data);

    // Locate the section where you want to display the tweets
    const sectionToReplace = findSectionToReplace();

    if (sectionToReplace) {
      console.log("Section found. Updating HTML.");
      // Define the header HTML
      const headerHTML = `
        <div class="css-1dbjc4n r-1wtj0ep r-1ny4l3l r-ymttw5 r-1f1sjgu">
          <h2 aria-level="2" role="heading" class="css-4rbku5 css-1dbjc4n r-18u37iz">
            <div dir="ltr" class="css-cens5h r-1kihuf0 r-1nao33i r-37j5jr r-adyw6z r-1vr29t4 r-135wba7 r-bcqeeo r-qvutc0" style="-webkit-line-clamp: 3; text-overflow: unset;">
              <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" style="text-overflow: unset;">Similar tweets</span>
            </div>
            <div class="css-1dbjc4n r-1kihuf0 r-18u37iz r-16y2uox r-17s6mgv"></div>
          </h2>
        </div>
      `;

      // Update the HTML of the found section
      sectionToReplace.innerHTML = headerHTML + request.data.join(""); // Add the header before the tweets
      applyStylesToSidebar(); // Call the function to apply styles to the sidebar

      sendResponse({ status: "Tweets displayed" });
    } else {
      console.error("Section to replace tweets not found.");
      sendResponse({ status: "Section not found" });
    }
  }
});
