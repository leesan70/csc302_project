module.exports = {
    "plugins": [ /*"react"*/ ],
    "extends": [
        "eslint:recommended"/*,
        "plugin:react/recommended"*/
    ],
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jquery": true
    },
    "globals": {
        "Promise": "on",
        "process": "readonly"
    },
    "rules": {
        "semi" : 0,
        "no-console": 0,
        "no-unused-vars": 1
    }
};
