// load in puppeteer
const { exit } = require('process')
const chalk = require('chalk');
const puppeteer = require('puppeteer')

// Load config variables from file
const config = require('./config.js');
const line_break = ("=").repeat(50);


// this wrapper means immediately execute this code
void (async () => {
  // wrapper to catch errors
  try {
    // create a new browser instance
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })

    // create a page inside the browser
    const page = (await browser.pages())[0]; //await browser.newPage()

    //set viewport for the autoscroll function
    await page.setViewport({
      width: 1200,
      height: 800
    });

    //navigate to twitter's login page
    await page.goto("https://twitter.com/login", { waitUntil: 'networkidle0' })
    await page.waitFor(config.wait_after_pageload);

    //get usename, password and loginbutton handles
    const usernameHandle = await page.$('input[autocapitalize="none"][autocomplete="on"][autocorrect="off"][name="session[username_or_email]"][spellcheck="false"][type="text"][dir="auto"][data-focusable="true"]');
    const passwordHandle = await page.$('input[autocapitalize="none"][autocomplete="on"][autocorrect="off"][name="session[password]"][spellcheck="false"][type="password"][dir="auto"][data-focusable="true"]');
    const loginButtonHandle = await page.$('div[data-testid="LoginForm_Login_Button"]')

    // use config credentials to input and log into the website
    await usernameHandle.type(config.login_username_or_email);
    await passwordHandle.type(config.login_password);
    await loginButtonHandle.click();

    // Wait until no more than 2 requests are sent over network
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Wait for div element with id 'react-root' to load
    await page.waitForSelector("div#react-root");

    // Wait for div element with 'Account Switcher' to load, which shows that we are logged in
    await page.waitForSelector('div[role="button"][data-focusable="true"][tabindex="0"][data-testid="SideNav_AccountSwitcher_Button"]');

    // Normal wait after page load
    await page.waitFor(config.wait_after_pageload);

    // Variable to store News Account, URL, Number of Likes and Tweet URL of the Highest Number of Likes Tweet
    let highestLikesDetails = ["", "", 0, ""];

    // Traverse each of the News Account 
    for( let news_acccount_handle of config.news_acccounts_handles ) {
      console.log("Navigating to Twitter Account: "+news_acccount_handle)

      // Navigate to a twitter account and wait until no more than 2 requests are sent over network
      await page.goto("https://twitter.com/" + news_acccount_handle, { waitUntil: 'networkidle2' })
      
      // Wait for div element with id 'react-root' to load
      await page.waitForSelector("div#react-root");

      // Normal wait after page load
      await page.waitFor(config.wait_after_pageload);

      // get the <main> tag from the page
      const mainElementHandle = await page.$('main');

      // get the <div data-testid="primaryColumn"> tag from the tag above
      // primaryColumn is the newsfeed column of the website, it's the middle column of the 3 columnar design of the website
      const primaryColumnElementHandle = await mainElementHandle.$('div[data-testid="primaryColumn"]');

      // get the <section> tag with specific attributes from the tag above
      const sectionElementHandle = await primaryColumnElementHandle.$('section[aria-labelledby="accessible-list-0"][role="region"]');

      // get the <article> tag with specific attributes from the tag above
      // each <article> is a twitter post
      const articleElementHandle = await sectionElementHandle.$('article[data-focusable="true"][tabindex="0"]');

      // get the <div data-testid="tweet"> tag from the tag above
      const divTweetElementHandle = await articleElementHandle.$('div[data-testid="tweet"]');

      // Get requied values/attributes/text from the tweet's tag
      // Get text of the tweet navigating to the <span> tag inside <div lang="en" dir="auto">
      const tweetTextSpanElementHandle = await divTweetElementHandle.$('div[lang="en"][dir="auto"] > span');
      // Compare whether the tag exists or not, in case of blank text tweet which just contains a link to youtube or article, the above statement witll return null
      const tweetTextSpanValue = tweetTextSpanElementHandle == null ? "" : await (await tweetTextSpanElementHandle.getProperty('innerHTML')).jsonValue();
      
      // Get the <div data-testid="like"> tag from divTweetElementHandle, 
      // Get its 'aria-label' attribute value to extract the exact number, the innerHTML oftern returns ambigious figures like 1K, 20K+
      const tweetLikeSpanElementHandle = await divTweetElementHandle.$$eval('div[role="button"][data-focusable="true"][tabindex="0"][data-testid="like"]', el => el.map(x => x.getAttribute("aria-label")));

      // Replace additional text in the 'aria-label' attribute of the tag
      const tweetLikeSpanValue = tweetLikeSpanElementHandle[0].replace(" Likes. Like", "").replace(" Like. Like", "");

      // Get the <div role="link"> tag from divTweetElementHandle, further extract its 'href' attribute value to extract the URL of the tweet,
      const tweetURLElementHandle = await divTweetElementHandle.$$eval('a[dir="auto"][aria-label][role="link"][data-focusable="true"]', el => el.map(x => x.getAttribute("href")));
      const tweetURLSpanValue = tweetURLElementHandle[0];

      
      // Print particular tweet extracted details
      console.log(chalk.bgWhite.blue("Account: " + news_acccount_handle));
      console.log("Tweet Text:" + tweetTextSpanValue);
      console.log("Tweet Likes: " + tweetLikeSpanValue);
      console.log("Tweet URL: " + tweetURLSpanValue);
      console.log(line_break)

      // If current's likes is greater than the current highest values, update the highestLikesDetails array data accordingly 
      if (highestLikesDetails[2] < parseInt(tweetLikeSpanValue))
      {
        highestLikesDetails[0] = news_acccount_handle
        highestLikesDetails[1] = tweetTextSpanValue
        highestLikesDetails[2] = tweetLikeSpanValue
        highestLikesDetails[3] = tweetURLSpanValue
      }
    }

    // Print the highest likes details
    console.log(chalk.bgWhite.black("Account/Tweet with the Highest Likes is:"));
    console.log(chalk.greenBright("Account: " + highestLikesDetails[0]));
    console.log(chalk.green("Tweet Text:" + highestLikesDetails[1]));
    console.log(chalk.green("Tweet Likes: " + highestLikesDetails[2]));
    console.log(chalk.green("Tweet URL: " + highestLikesDetails[3]));
    console.log(line_break)

    // Navigate to a twitter post which has the highest likes
    await page.goto("https://twitter.com/" + highestLikesDetails[3], { waitUntil: 'networkidle2' })

    // Wait for div element with id 'react-root' to load
    await page.waitForSelector("div#react-root");
   
    // Wait for <div aria-label="Share Tweet"> to load, which shows that all components of the post are displayed
    // We didn't check for like, comment, retweet button as the attributes values change if you like, retweet.
    // However that's not the case with "Share Tweet" button
    await page.waitForSelector('div[aria-expanded="false"][aria-haspopup="true"][aria-label="Share Tweet"][role="button"][data-focusable="true"][tabindex="0"]');

    // Normal wait after page load
    await page.waitFor(config.wait_after_pageload);
    
    // Get the Tweet button status, using the 'data-testid' attribute text of the Retweet div.
    // In normal situation it will "retweet", post retweeting it changes to "unretweet"
    const divButtonsRetweetElementHandle = await page.$$eval('article[data-focusable="true"][tabindex="0"] > div > div > div > div:nth-child(3) div[role="group"] > div:nth-child(2) > div', el => el.map(x => x.getAttribute("data-testid")));
    const retweetStatus = divButtonsRetweetElementHandle[0];

    // Check if tweet already retweeted
    if (retweetStatus == "unretweet") {
      console.log(chalk.yellow("You have already re-tweeted this tweet."))
    } else {
      // Get the Tweet button using <div data-testid="retweet"> and click it
      const retweetElementHandle = await page.$('div[aria-haspopup="true"][role="button"][data-focusable="true"][tabindex="0"][data-testid="retweet"]');
      await retweetElementHandle.click();
      
      // Wait for popup to load which contains retweet option
      await page.waitForSelector('div[role="menuitem"][data-focusable="true"][tabindex="0"][data-testid="retweetConfirm"]');

      // Normal wait after page load
      await page.waitFor(config.wait_after_pageload);
      
      // Get the Retweet option from the Retweet popup and click it
      const retweetConfirmElementHandle = await page.$('div[role="menuitem"][data-focusable="true"][tabindex="0"][data-testid="retweetConfirm"]');
      await retweetConfirmElementHandle.click();
      
      // Confirm whether the 'data-testid' attribute text of the Retweet div has changed to "unretweet"
      let postRetweetStatus = "retweet"
      while (postRetweetStatus != "unretweet") {
        // Get the Tweet button status, using the 'data-testid' attribute text of the Retweet div.
        const divButtonsPostRetweetElementHandle = await page.$$eval('article[data-focusable="true"][tabindex="0"] > div > div > div > div:nth-child(3) div[role="group"] > div:nth-child(2) > div', el => el.map(x => x.getAttribute("data-testid")));
        postRetweetStatus = divButtonsPostRetweetElementHandle[0]; 

        // Wait for 20ms to poll again to check
        await page.waitFor(20); 
      }

      // Normal wait after page load
      await page.waitFor(config.wait_after_pageload);

      console.log(chalk.bgWhite.greenBright("Tweet successfully retweeted."))
    }

    // Close the browser for cleanup and clearing up any leaks.
    await browser.close()
  } catch (error) {
    // if something goes wrong
    // display the error message in console
    console.log(error)
  }
})()