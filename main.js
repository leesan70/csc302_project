const clientConfig = require('./webpack.dev.config');
const serverConfig = require('./webpack.server.config');
const webpack = require('webpack');

webpack(serverConfig, (err, stats) => {
    if (err || stats.hasErrors()){
        console.error("Error building server");
        console.error(err);
        console.error(stats);
        console.error(stats.error);
        return;
    }

    webpack(clientConfig, (err, stats) => {
        if (err || stats.hasErrors()){            
            console.error("Error building client");
            console.error(err);
            console.error(stats);
            console.error(stats.error);
            return;
        }

        require("./dist/server");
    });
});