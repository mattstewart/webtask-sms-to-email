> NOTE: THIS PROJECT IS CURRENTLY A WORK IN PROGRESS

# webtask-sms-to-gist

Send an SMS message to Twilio and create a GitHub Gist with the the content of the message. 

## Uses

This webtask can be used as a "work-log" to track your work throughout the day.

## How it works

Send an SMS message to the phone number configured in your Twilio account and for the WebTask (864-920-1506). A GitHub Gist will be created in the GitHub account specified in the Webtask configuration [mattstewart](https://github.com/mattstewart/).

A new Gist will be created for each day. If a Gist already exists for the current day the content in the SMS message will be appended to the end of the current Gist. 

Once the Gist is created, or updated, the Webtask will send a message back to the requsting phone number with a link to the public Gist.

## Demo
