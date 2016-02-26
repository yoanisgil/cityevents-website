/**
 * Created by brujitos on 16-02-05.
 */

var passport = require('passport');
var request = require('request');
var BearerStrategy = require('passport-http-bearer').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

//facebook auth setup
options = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ["id", "first_name", "email", "last_name"]
};


passport.use(
    new FacebookStrategy(
        options,
        function (accessToken, refreshToken, profile, done) {
            request(
                {
                    url: 'http://localhost:3001/auth/facebook',
                    method: 'POST',
                    json: {access_token: accessToken}
                }, function (err, response, body) {
                    if (err) {
                        done(err, body);
                    }

                    switch (response.statusCode) {
                        case 200:
                            done(null, {token: body.token});
                            break;
                        default:
                            var data = {
                                email: profile.emails[0].value,
                                providers: [{'name': 'facebook', data: profile._raw}]
                            };

                            request({
                                url: 'http://localhost:3001/user',
                                method: 'POST',
                                json: data
                            }, function (err, response, body) {
                                if (err) {
                                    done(err, body)
                                }

                                request({
                                    url: 'http://localhost:300/auth/facebook',
                                    method: 'POST',
                                    json: {access_token: accessToken}
                                }, function (err, response, body) {
                                    if (err) {
                                        done(err, body);
                                    }

                                    done(null, {token: body.token});
                                });

                            });
                    }
                }
            );
        }
    )
);
