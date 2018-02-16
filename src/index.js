const firebase = require("firebase/app");
require("firebase/auth");

const initialize = (
    config,
    signedIn, // (token, user)
    notSignedIn,
    language = 'es',
) => {
    firebase.initializeApp(config);

    firebase.auth().languageCode = language;

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            user.getIdToken()
                .then((token) => {
                    signedIn(token, user);
                })
                .catch((error) => {
                    console.log(error.message);

                    throw error;
                });
        } else {
            notSignedIn();
        }
    });
};

const signInWithFacebook = () => {
    firebase.auth().signInWithRedirect(
        new firebase.auth.FacebookAuthProvider()
    );
};

const execAfterRedirect = (
    onCredential,  // (token, user)
    onNoCredential = null, // ()
) => {
    firebase.auth().getRedirectResult()
        .then((result) => {
            if (result.credential) {
                firebase.auth().currentUser.getIdToken().then((token) => {
                    onCredential(
                        token,
                        {
                            id: result.user.providerData[0].uid,
                            name: typeof result.user.providerData[0].displayName !== 'undefined'
                                ? result.user.providerData[0].displayName
                                : null,
                            email: typeof result.user.providerData[0].email !== 'undefined'
                                ? result.user.providerData[0].email
                                : null,
                            picture: typeof result.user.providerData[0].photoURL !== 'undefined'
                                ? result.user.providerData[0].photoURL
                                : null
                        }
                    );
                }).catch((error) => {
                    console.error(error);

                    throw error;
                });
            } else {
                if (onNoCredential) {
                    onNoCredential();
                }
            }
        })
        .catch((error) => {
            console.error(error);

            throw error;
        });
};

const signInWithPhone = (
    number,
    captcha,
    success, // (confirmationResult)
    failure // (error)
) => {
    firebase.auth().signInWithPhoneNumber(number, captcha)
        .then((confirmationResult) => {
            success(confirmationResult);
        })
        .catch(failure)
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

const signInWithToken = (
    token,
    failure // (error)
) => {
    firebase.auth().signInWithCustomToken(token)
        .then(() => {
            // Handle it on initialize method (signedIn parameter function)
        })
        .catch(({code, message}) => {
            failure(code, message)
        })
};

const logout = () => {
    firebase.auth().signOut().then(() => {
        // TODO
        // It does not logout from facebook
    }).catch((error) => {
    });
};

const captcha = (
    button,
    callback
) => {
    return new firebase.auth.RecaptchaVerifier(button, {
        'size': 'invisible',
        'callback': (response) => {
            callback();
        }
    });
};

export {
    initialize,
    signInWithFacebook,
    execAfterRedirect,
    signInWithPhone,
    signInWithToken,
    logout,
    captcha
};