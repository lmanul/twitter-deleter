chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('twitter.com')) {
    // We can't do much if this isn't Twitter.
    console.warn('Wrong tab, sorry!');
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [],
    func: async () => {

      const loadProfile = () => {
        const profileButton = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
        profileButton.click();
      };

      loadProfile();
      // Sleep
      await new Promise(r => setTimeout(r, 2500));

      const scrollToBottom = async () => {
        let scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight
        while (Math.round(window.scrollY) < scrollableHeight) {
          console.log('Scrolling down...');
          window.scrollTo(0, document.body.scrollHeight);
          // Sleep
          await new Promise(r => setTimeout(r, 5000));
          scrollableHeight =
              document.documentElement.scrollHeight - window.innerHeight
        }
        console.log('Done');
      };

      await scrollToBottom();

      let cantDeleteTweetCount = 0;

      const deleteOldestTweet = async () => {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        let moreMenu = tweets[tweets.length - 1 - cantDeleteTweetCount].querySelector('[data-testid="caret"]');
        if (!tweets.length) {
          alert('I did not find any Tweets here. Please load your profile page first.');
          return;
        }

        if (moreMenu) {
          moreMenu.click();
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          for (const item of menuItems) {
            if (item.innerText === 'Delete' || item.innerText === 'Supprimer') {
              item.click();
              break;
            }
          }
          const buttons = document.querySelectorAll('[role="button"]');
          for (const button of buttons) {
            if (button.innerText === 'Delete' || button.innerText === 'Supprimer') {
              button.click();
              break;
            }
            // Assume we can't delete this.
            cantDeleteTweetCount++;
          }
        } else {
          console.log('Could not find a more menu');
        }
      };

      let remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      while (remainingTweets.length > cantDeleteTweetCount) {
        deleteOldestTweet();
        // Sleep
        await new Promise(r => setTimeout(r, 2500));
        remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      }
  }});
});
