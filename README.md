# webtask-sms-to-gist

![sms-to-gist-prewiew](/assets/preview.gif)

This webtask allows you to send an SMS message to a Twilio phone number and create a GitHub Gist with the contents of the message. 

## Uses

This webtask can be used as a "work-log" to track your work throughout the day.

## How it works

Send an SMS message to the Twilio phone number configured for the webtask. A GitHub Gist containing the contents of the SMS message will be created in the GitHub account specified in the webtask configuration. Once the Gist is created, the webtask will send an SMS message back to the requesting phone number with a link to the public Gist.

> NOTE: Basic [markdown](https://guides.github.com/features/mastering-markdown/) is supported, allowing for simple text formatting. 

## Demo

Send an SMS message to 864-920-1506 with markdown text such as: 
```
### What did I learn today?
Today I learned how to use webtasks using Webtask.io and **Auth0**!
```
The SMS will be sent to Twilio which will call the webtask. The webtask will then create a Gist and respond with a link to the Gist.

## Getting Started

1. Clone this repo
2. Create a Twilio account with a phone number that supports SMS
3. Find your Twilio SID and Auth Token for use when creating the webtask
4. Create a Github account
5. Create a Personal Access OAuth Token for use when creating the webtask (Settings > Developer Settings > Personal Access Tokens)
6. Deploy to [Webtask.io](https://webtask.io)
    * Create an account at [Webtask.io](https://webtask.io)
    * Install the Webtask CLI by running `npm install wt-cli -g`
    * Navigate to the `webtasks` directory
    * Run `wt init <YOUR_EMAIL_ADDRESS>` to create your Webtask account
    * Run the following to deploy the _sms-to-gist_ webtask: `wt create sms-to-gist.js -s GITHUB_TOKEN=<YOUR_GITHUB_TOKEN>_ -s TWILIO_AUTH_TOKEN=<YOUR_TWILIO_AUTH_TOKEN> -s TWILIO_ACCOUNT_SID=<YOUR_TWILIO_ACCOUNT_SID> -s TWILIO_NUMBER_=<YOUR_TWILIO_NUMBER>`
    * Capture the webtask Url
7. Update the Twilio incomming SMS webhook Url with the webtask Url