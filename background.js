chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('twitter.com')) {
    // We can't do much if this isn't Twitter.
    console.warn('Wrong tab, sorry!');
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [],
    func: async () => {

      const scrollMargin = 500;
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
          // Sleep
          await new Promise(r => setTimeout(r, 5000));
          scrollableHeight =
              document.documentElement.scrollHeight - window.innerHeight
        }
        // Re-scroll up a tiny bit so we can see what's happening.
        window.scrollTo(0, document.body.scrollHeight - scrollMargin);
      };

      await scrollToBottom();

      const deleteOldestTweet = async () => {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        const oldestTweet = tweets[tweets.length - 1];
        let moreMenu = oldestTweet.querySelector('[data-testid="caret"]');
        if (!tweets.length) {
          alert('I did not find any Tweets here. Please load your profile page first.');
          return;
        }

        if (moreMenu) {
          moreMenu.click();
          let foundDelete = false;
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          for (const item of menuItems) {
            if (item.innerText === 'Delete' || item.innerText === 'Supprimer') {
              foundDelete = true;
              item.click();
              break;
            }
          }
          if (!foundDelete) {
            // This is probably a reTweet.
            // Dismiss the dialog
            document.body.dispatchEvent(new KeyboardEvent('keypress'), {'key': 'Escape'});
            const retweetButton = oldestTweet.querySelector('[data-testid="unretweet"]');
            retweetButton.click();
            await new Promise(r => setTimeout(r, 1000));  // Sleep
            const confirm = document.querySelector('[data-testid="unretweetConfirm"]');
            confirm.click();
            await new Promise(r => setTimeout(r, 1000));  // Sleep
          } else {
            const buttons = document.querySelectorAll('[role="button"]');
            for (const button of buttons) {
              if (button.innerText === 'Delete' || button.innerText === 'Supprimer') {
                button.click();
                break;
              }
            }
          }
        } else {
          console.log('Could not find a more menu');
        }
      };

      let remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      while (remainingTweets.length > 0) {
        deleteOldestTweet();
        await scrollToBottom();
        // Sleep
        await new Promise(r => setTimeout(r, 2500));
        remainingTweets = document.querySelectorAll('[data-testid="tweet"]');
      }
  }});
});
