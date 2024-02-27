chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('twitter.com')) {
    // We can't do much if this isn't Twitter.
    console.warn('Wrong tab, sorry!');
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [],
    func: async () => {

      const scrollMargin = 600;
      const profileButton = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
      profileButton.click();

      // Sleep
      await new Promise(r => setTimeout(r, 2500));

      const scrollToBottom = async () => {
        let scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight
        while (Math.round(window.scrollY) < scrollableHeight) {
          // Scroll down.
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(r => setTimeout(r, 5000));  // Sleep
          scrollableHeight =
              document.documentElement.scrollHeight - window.innerHeight
        }
        // Re-scroll up a tiny bit so we can better see what's happening.
        window.scrollTo(0, document.body.scrollHeight - scrollMargin);
      };

      console.log('Scrolling to the bottom...');
      await scrollToBottom();

      let deletedCount = 0;
      const deleteOldestTweet = async () => {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        if (!tweets.length) {
          alert('I did not find any Tweets here.');
          return;
        }
        const oldestTweet = tweets[tweets.length - 1];

        // Let's see if this is a retweet.
        const unretweetButton = oldestTweet.querySelector('[data-testid="unretweet"]');
        if (unretweetButton) {
          unretweetButton.click();
          await new Promise(r => setTimeout(r, 1000));  // Sleep
          const confirm = document.querySelector('[data-testid="unretweetConfirm"]');
          confirm.click();
          deletedCount++;
          await new Promise(r => setTimeout(r, 1000));  // Sleep
          return;  // Done with this Tweet
        }

        let moreMenu = oldestTweet.querySelector('[data-testid="caret"]');
        if (moreMenu) {
          moreMenu.click();
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          if (!menuItems.length) {
            return;  // Give up on this Tweet
          }
          // To avoid having to handle translations, assume the item we want
          // is always the first one.
          menuItems[0].click();
          await new Promise(r => setTimeout(r, 1000));  // Sleep
          const buttons = document.querySelectorAll('[role="button"]');
          if (!buttons.length) {
            return;  // Give up on this Tweet
          }
          // The Delete button is the first one.
          buttons[0].click();
          deletedCount++;
          await new Promise(r => setTimeout(r, 1000));  // Sleep
        } else {
          console.log('Could not find a more menu');
        }
      };

      const deleteAllReachableTweets = async () => {
        let remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
        while (remainingTweets.length > 0) {
          deleteOldestTweet();
          await scrollToBottom();
          // Sleep
          await new Promise(r => setTimeout(r, 2500));
          remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
          console.log('Deleted ' + deletedCount + ' Tweets so far.');
        }
      };

      deleteAllReachableTweets();

      // Assume we have delete everything we could in here. Now try the
      // "replies" tab.
      const tabs = document.querySelectorAll('[role="tab"]');
      if (tabs && tabs[1]) {
        tabs[1].click();
        await new Promise(r => setTimeout(r, 2500));
        deleteAllReachableTweets();
      }
  }});
});
