chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('twitter.com')) {
    // We can't do much if this isn't Twitter.
    console.warn('Wrong tab, sorry!');
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [],
    func: async () => {

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

      const deleteOldestTweet = async () => {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        const moreMenu = tweets[tweets.length - 1].querySelector('[aria-label="More"]');
        // const moreMenus = document.querySelectorAll('[aria-label="More"]');
        if (!tweets.length) {
          alert('I did not find any Tweets here. Please load your profile page first.');
          return;
        }

        if (moreMenu) {
          moreMenu.click();
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          for (const item of menuItems) {
            if (item.innerText === 'Delete') {
              item.click();
              break;
            }
          }
          const buttons = document.querySelectorAll('[role="button"]');
          for (const button of buttons) {
            if (button.innerText === 'Delete') {
              button.click();
              break;
            }
          }
        }
      };

      let remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      while (remainingTweets.length) {
        deleteOldestTweet();
        // Sleep
        await new Promise(r => setTimeout(r, 2500));
        remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      }
  }});
});
