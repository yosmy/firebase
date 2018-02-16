"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var firebase = require("firebase/app");
require("firebase/auth");

var initialize = function initialize(config, signedIn, // (token, user)
notSignedIn) {
    var language = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'es';

    firebase.initializeApp(config);

    firebase.auth().languageCode = language;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            user.getIdToken().then(function (token) {
                signedIn(token, user);
            }).catch(function (error) {
                console.log(error.message);

                throw error;
            });
        } else {
            notSignedIn();
        }
    });
};

var signInWithFacebook = function signInWithFacebook() {
    firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
};

var execAfterRedirect = function execAfterRedirect(onCredential) // ()
{
    var onNoCredential = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    firebase.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            firebase.auth().currentUser.getIdToken().then(function (token) {
                onCredential(token, {
                    id: result.user.providerData[0].uid,
                    name: typeof result.user.providerData[0].displayName !== 'undefined' ? result.user.providerData[0].displayName : null,
                    email: typeof result.user.providerData[0].email !== 'undefined' ? result.user.providerData[0].email : null,
                    picture: typeof result.user.providerData[0].photoURL !== 'undefined' ? result.user.providerData[0].photoURL : null
                });
            }).catch(function (error) {
                console.error(error);

                throw error;
            });
        } else {
            if (onNoCredential) {
                onNoCredential();
            }
        }
    }).catch(function (error) {
        console.error(error);

        throw error;
    });
};

var signInWithPhone = function signInWithPhone(number, captcha, success, // (confirmationResult)
failure // (error)
) {
    firebase.auth().signInWithPhoneNumber(number, captcha).then(function (confirmationResult) {
        success(confirmationResult);
    }).catch(failure);
};

// const login = (success, refresh) => {
//     verify(
//         (token, user) => {
//             success(token, user);
//         },
//         () => {
//             firebase.auth().signInWithRedirect(
//                 new firebase.auth.FacebookAuthProvider()
//             );
//         },
//         refresh
//     );
// };

var signInWithToken = function signInWithToken(token, failure // (error)
) {
    firebase.auth().signInWithCustomToken(token).then(function () {
        // Handle it on initialize method (signedIn parameter function)
    }).catch(function (_ref) {
        var code = _ref.code,
            message = _ref.message;

        failure(code, message);
    });
};

var logout = function logout() {
    firebase.auth().signOut().then(function () {
        // TODO
        // It does not logout from facebook
    }).catch(function (error) {});
};

var captcha = function captcha(button, _callback) {
    return new firebase.auth.RecaptchaVerifier(button, {
        'size': 'invisible',
        'callback': function callback(response) {
            _callback();
        }
    });
};

exports.initialize = initialize;
exports.signInWithFacebook = signInWithFacebook;
exports.execAfterRedirect = execAfterRedirect;
exports.signInWithPhone = signInWithPhone;
exports.signInWithToken = signInWithToken;
exports.logout = logout;
exports.captcha = captcha;
