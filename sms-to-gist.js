/**
 * Description:
 *  Webtask.io task that takes SMS messages received by Twilio
 *  and creates GitHub Gists with the the content of the message.
 *  Please see https://www.github.com/mattstewart/webtask-sms-to-gist/ for more details.
 * Author: Matt Stewart
 * Created: 20170802
 */
var request = require('request');
var githubApi = require('github@0.2.4');
var moment = require('moment@2.11.2');

const TWILIO_MESSAGE_URL = 'https://api.twilio.com/2010-04-01/Accounts/{0}/Messages';
const RESPONSE = {
    CREATED: {
        statusCode: 201,
        message: 'Gist created successfully!',
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: 'Something went wrong. Please check your request and try again.'
    },
    ERROR: {
        statusCode: 500,
        message: 'An unknown error was encountered.'
    }
};
const SMS_RESPONSE = {
    CREATED: "Gist created successfully!\nGist Url: {0}",
    ERROR: 'Oh, no! Something went wrong! :-(\nPlease try again.'
}

// Create GitHub API client
var githubClient = new githubApi({
    version: '3.0.0',
    debug: true,
    protocol: 'https',
    host: 'api.github.com',
    pathPrefix: '',
    timeout: 5000,
    headers: {
        'user-agent': 'webtask.io'
    }
});

/**
 * Webtask entry function.
 */
module.exports = function (ctx, callback) {
    console.log('Webtask request received.');

    // Check that all required parameters have been provided
    var data = ctx.data;
    var required = ['GITHUB_TOKEN', 'TWILIO_AUTH_TOKEN', 'TWILIO_ACCOUNT_SID', 'TWILIO_NUMBER', 'Body', 'From'];
    for (var param in required) {
        if (data[required[param]] === null || isStringNullOrEmpty(data[required[param]])) {
            console.log('Bad Request: The `%s` parameter is required!', required[param]);
            return callback(null, RESPONSE.BAD_REQUEST);
        }
    }

    console.log('From: %s\nBody: %s', data.From, data.Body);

    // Create GitHub Gist WorkLog entry
    createWorkLog(data, callback);
}

/**
 * Creates a "Work Log" Gist on Github with the content of the SMS message
 * @param {Object} data  - request context data object
 * @param {requestCallback} callback - callback to handle the request response 
 */
function createWorkLog(data, callback) {
    // Create file name and description for the gist using today's date
    var currentDateTime = moment().format('YYYYMMDD-HH_mm_ss');
    var gistFileName = 'work-log-{0}.md'.format(currentDateTime);
    var gistDescription = 'Work Log: {0}'.format(currentDateTime);

    createGist(data, gistFileName, gistDescription, callback);
}

/**
 * Creates a GitHub Gist using the GitHub Developer API.
 * @param {Object} data - request context data object
 * @param {requestCallback} callback - callback to handle the request response 
 */
function createGist(data, gistFileName, gistDescription, callback) {
    console.log('Preparing Gist...');

    var timestamp = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
    var gistHeader = '# {0}'.format(timestamp);

    // Add timestamp to Gist
    var content = gistHeader + '\n' + data.Body;

    var gistParams = {
        gitHubToken: data.GITHUB_TOKEN,
        public: true, // set to true for demo
        description: gistDescription,
        fileName: gistFileName,
        content: content
    };

    console.log('Creating Gist via GitHub API...');

    githubClient.authenticate({
        type: 'oauth',
        token: gistParams.gitHubToken
    });

    var payload = {
        description: gistParams.description,
        public: gistParams.public,
        files: {}
    };

    var content = {
        content: gistParams.content
    };

    payload.files[gistParams.fileName] = content;

    console.log('Gist Payload: ' + JSON.stringify(payload));

    githubClient.gists.create(payload, function (err, gist) {
        if (err || isStringNullOrEmpty(gist)) {
            // Cannot create a gist for this user. Invalid token? Proceed with an anonymous gist.
            console.log('Error: Unable to create Gist.');
            callback(RESPONSE.ERROR);
        } else {
            console.log('Gist created: %s', JSON.stringify(gist));

            // Send SMS
            var gistUrl = gist.html_url;
            if (isStringNullOrEmpty(gistUrl)) {
                smsResponse = SMS_RESPONSE.ERROR;
                sendTwilioSms(data, smsResponse, callback)
            } else {
                smsResponse = SMS_RESPONSE.CREATED.format(gistUrl);
                sendTwilioSms(data, smsResponse, callback)
            }
        }
    });
}

/**
 * Sends an SMS message using the Twilio Rest API.
 * @param {Object} data - request context data object
 * @param {String} smsResponse - Text to send in response SMS message
 * @param {requestCallback} callback - callback to handle the request response
 */
function sendTwilioSms(data, smsResponse, callback) {
    // Prepare Twilio SMS message
    console.log('Preparing SMS message...');
    var twilioParams = {
        twilioAccountSid: data.TWILIO_ACCOUNT_SID,
        twilioAuthToken: data.TWILIO_AUTH_TOKEN,
        twilioNumber: data.TWILIO_NUMBER,
        to: data.From,
        message: smsResponse
    }

    console.log('Sending SMS message...');
    request({
        url: TWILIO_MESSAGE_URL.format(twilioParams.twilioAccountSid),
        method: 'POST',
        auth: {
            user: twilioParams.twilioAccountSid,
            pass: twilioParams.twilioAuthToken
        },
        form: {
            From: twilioParams.twilioNumber,
            To: twilioParams.to,
            Body: twilioParams.message
        }
    }, function (error, res, body) {
        if (!isStringNullOrEmpty(error)) {
            callback(RESPONSE.ERROR, body);
        } else {
            if (smsResponse === SMS_RESPONSE.CREATED) {
                callback(null, RESPONSE.CREATED);
            } else {
                callback(null, RESPONSE.ERROR);
            }   
        }
    });
}

/**
 * Check if a sting has a value.
 * @param {String} str - String to check value of
 */
function isStringNullOrEmpty(str) {
    return str === null || str === undefined || str.length === 0;
}

/**
 * Add a .format() method to the String Object to add C#-like
 * String.format() capabilities.
 */
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}