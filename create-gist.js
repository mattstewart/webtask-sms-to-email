// refer to for response types: https://github.com/auth0-blog/serverless-stories/blob/master/webtasks/newsletter.js
// https://github.com/Verlic/Gist-This/blob/master/webtasks/gist-this.js
// https://github.com/lalyos/webtask-samples/tree/master/sms-sender

var GitHubApi = require('github@0.2.4'),
var gitHub = new GitHubApi({
    version: "3.0.0",
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "",
    timeout: 5000,
    headers: {
        "user-agent": "webtask.io"
    }
});

const RESPONSE = {
    CREATED: {
        statusCode: 201,
        message: "Gist created successfully!",
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: "Something went wrong. Please check your request and try again."
    },
    UNAUTHORIZED: {
        statusCode: 401,
        message: "You must be logged in to access this resource."
    }
};

module.exports = function (ctx, callback) {
    var smsBody = ctx.data.Body;
    var senderPhoneNumber = ctx.data;

    // Check for invalid body and phone number arguments.
    if (isStringNullOrEmpty(body) || isStringNullOrEmpty(senderPhoneNumber)) {
        console.log('')
        callback(null, RESPONSE.BAD_REQUEST);
        return;
    }

    // Create the gist file object
    gist.file[gist.filename] = { content: command.replace(gist.filename, '').trim() };
    console.log('Gist Data: ' + JSON.stringify(gist.file[gist.filename]));

    createGist(gistUser, gist, callback);
}

function sendTwilioSms(url, gist, callback) {
    console.log('TODO');
}

function createGist(gist, callback) {
    console.log('Gist: ' + JSON.stringify(gist));
    gitHub.authenticate({
        type: 'oauth',
        token: gistUser.gistToken
    });

    var payload = {
        description: 'Generated gist from Slack',
        public: 'true', // set to true for the purpose of this demo
        files: gist.file
    };

    github.gists.create(payload, function (err, body) {
        if (err) {
            // Cannot create a gist for this user. Invalid token? Proceed with an anonymous gist.
            console.log('Unable to create Gist. Check OAuth token');
        } else if (!body) {
            callback('Unable to parse body from Gist');
        } else {
            console.log('Gist created: ' + JSON.stringify(body));
            sendTwilioSms(body.html_url, gist, callback);
        }
    });
}

function isStringNullOrEmpty(str) {
    return str === null || str === undefined || str.length === 0;
}