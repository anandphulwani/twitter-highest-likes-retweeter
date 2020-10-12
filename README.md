# Twitter-Highest-Likes-Retweeter
Browse multiple twitter handles and get the first tweet from each, 
finds out which tweet has the maximum likes and retweet it.

## Features ##

- :white_check_mark: Logs-in to twitter.
- :white_check_mark: Reads multiple twitter handles topmost tweet on the wall.
- :white_check_mark: Displays tweet's text, no of likes, unique URL of the tweet.
- :white_check_mark: Calculate the tweet's with highest number of likes.
- :white_check_mark: Retweet the above found tweet.
- :white_check_mark: Check whether the tweet is already retweeted.
- :white_large_square: Check whether the twitter handle exists.
- :white_check_mark: Windowless/headless (hidden) mode
- :white_check_mark: Colorful console messages

## Screenshot ##

![Run Window](https://raw.githubusercontent.com/anandphulwani/twitter-highest-likes-retweeter/master/run.png)
![Results Window](https://raw.githubusercontent.com/anandphulwani/twitter-highest-likes-retweeter/master/results.png)

## Requirements ##

- Node v8+
- puppeteer v1.8.0+
- chalk v2.3.0+

Tested on Windows 7 with Node v12.19.0 ,puppeteer v1.20.0 and chalk v2.4.2

## Installation ##

- Clone this repository. `git clone https://github.com/anandphulwani/twitter-highest-likes-retweeter.git`
- Type `npm install`
- In config.js, set username by configuring `login_username_or_email`, you need to replace '<< TWITTER USERNAME / EMAIL HERE >>' with your twitter username (without quotes).
- In config.js, set password by configuring `login_password`, you need to replace '<< TWITTER PASSWORD HERE >>' with your twitter password (without quotes).
- Type `node index.js` (case-sensitive)

## Options ##

You can set various options in `config.js` file.

## Disclaimer ##

This project is not affiliated with official twitter in any sense.
