
/*Static-Express
 *
 * -Serves static assets
 * -provides file info for what files are in certain folders
 *
 * */

/*global module:false*/

module.exports = function(portNumber, callback) {

    var module = {

        express: require('express'),

        isInit: false,

        app: {},

        port: portNumber,

        server: false,

        callback: callback,

        //get all files from a given folder / deep directory list

        walkSync : function(dir, filelist) {

            var __inst = this; // reference to scope

            var fs = fs || require('fs'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function(file) {
                if (fs.statSync(dir + file).isDirectory()) {
                    filelist = __inst.walkSync(dir + file + '/', filelist);
                }
                else {
                    filelist.push(file);
                }
            });
            return filelist;
        },

        jstr:function(obj) // a clean, formatted JSON.stringify
        {
            return JSON.stringify(obj, null, 2);
        },

        //create express server

        expressInit: function () {

            this.app = this.express();

            this.server = require('http').Server(this.app);

        }


    };

    module.expressInit();

    module.app.port = module.port;

    //run callback with reference to app

    if (typeof(callback) == 'function') {
        callback(false, app.app)
    }
    ;

    //return the express app
    return module.app;

}





