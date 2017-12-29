/**
 * Created by The Blakes on 6/16/2017.
 */

var $App = {

    examples:[],

    tutorials:[],

    walkSync : function(dir, filelist, type) {

        var __inst = this; // reference to scope

        type = type || "*";

        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function(file) {

            if (fs.statSync(dir + file).isDirectory()) {
                filelist = __inst.walkSync(dir + file + '/', filelist, type);
            }
            else if(type=="*" || [type.replace('.', '').toLowerCase()].indexOf(file.split('.')[file.split('.').length - 1].toLowerCase()) >= 0) {
                filelist.push(file);
            }
        });
        return filelist;
    },

    jstr:function(obj) // a clean, formatted JSON.stringify
    {
        return JSON.stringify(obj, null, 2);
    },

    Client_Files:
        {
            all_files:[] //contains everything from static directory, listed

        }//will contain a separate list for each file type

};


module.exports = function(openNow) {

    var fs = require('fs');

       var express = require('express');

       console.log("Initializing...");

       var bodyParser = require('body-parser');

       var app = express();

    this.server = require('http').Server(this.app);

    app.port = process.env.PORT || 3137;

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


    app.get('/test', function (req, res) {


           res.end('done');


       });

       function decodeBase64Image(dataString) {
           var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
               response = {};

           if (matches.length !== 3) {
               return new Error('Invalid input string');
           }

           response.type = matches[1];
           response.data = new Buffer(matches[2], 'base64');

           return response;
       }

       app.post('/save', function(req, res){

           var content = req.body.content, filename = req.body.filename, type = req.body.type;

           var relpath = 'client/assets/file_temp/' + filename;

           var dataString = content;

           if(filename.toLowerCase().indexOf('.mp3') >= 0)
           {
               var response = {};
               response.data = new Buffer(dataString, 'base64');

               response.type = "audo/mp3";

               // Save decoded binary image to disk
               try {
                   require('fs').writeFile(relpath, response.data,
                       function () {
                           console.log('DEBUG - feed:message: Saved to disk image attached by user:', relpath);

                           res.end(JSON.stringify({relpath: relpath, content: content}));

                       });
               }
               catch (error) {
                   console.log('ERROR:', error);

                   res.end('save-file: error:' + error);
               }


           }

           if(filename.indexOf('.json') >= 0)
           {
               // Save decoded binary image to disk
               try
               {
                   if(type && ['level', 'sprite', 'background', 'terrain', 'interactive', 'sound', 'animation', 'motion', 'gameimage', 'particle', 'proton'].indexOf(type.toLowerCase()) >= 0)
                   {
                       relpath = relpath.replace('/file_temp/', '/game/json/' + type.toLowerCase() + "/");

                       require('fs').writeFile(relpath, content,
                           function()
                           {
                               console.log('DEBUG - feed:message: Saved to disk json attached by user:', relpath);

                               var path = __dirname +  "/" + relpath;

                               res.end(JSON.stringify({action:"download", status:"complete", path:path}));

                               // res.end(JSON.stringify({relpath:relpath, content:content}));

                           });

                   }

               }
               catch(error)
               {
                   console.log('ERROR:', error);
               }

           }

           else {
               // Save base64 image to disk
               try {
                   // Decoding base-64 image
                   // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
                   function decodeBase64Image(dataString) {
                       var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                       var response = {};

                       if (matches.length !== 3) {
                           return false;
                       }

                       response.type = matches[1];
                       response.data = new Buffer(matches[2], 'base64');

                       return response;
                   }

                   // Regular expression for image type:
                   // This regular image extracts the "jpeg" from "image/jpeg"
                   var imageTypeRegularExpression = /\/(.*?)$/;

                   // Generate random string
                   var crypto = require('crypto');
                   var seed = crypto.randomBytes(20);
                   var uniqueSHA1String = crypto
                       .createHash('sha1')
                       .update(seed)
                       .digest('hex');

                   var base64Data = dataString;

                   var imageBuffer = decodeBase64Image(base64Data);

                   if (imageBuffer) {

                       var userUploadedFeedMessagesLocation = '../img/upload/feed/';

                       var uniqueRandomImageName = 'image-' + uniqueSHA1String;
                       // This variable is actually an array which has 5 values,
                       // The [1] value is the real image extension
                       var imageTypeDetected = imageBuffer
                           .type
                           .match(imageTypeRegularExpression);

                       var userUploadedImagePath = userUploadedFeedMessagesLocation +
                           uniqueRandomImageName +
                           '.' +
                           imageTypeDetected[1];


                       // Save decoded binary image to disk
                       try {
                           require('fs').writeFile(relpath, imageBuffer.data,
                               function () {
                                   console.log('DEBUG - feed:message: Saved to disk image attached by user:', relpath);

                                   res.end(JSON.stringify({relpath: relpath, content: content}));

                               });
                       }
                       catch (error) {
                           console.log('ERROR:', error);
                       }


                   }


               }
               catch (error) {
                   console.log('ERROR:', error);
               }


           }


       });

       var fs = require('fs');

       function copy(oldPath, newPath) {
           var readStream = fs.createReadStream(oldPath);
           var writeStream = fs.createWriteStream(newPath);

           readStream.on('error', callback);
           writeStream.on('error', callback);

           readStream.on('close', function () {
               fs.unlink(oldPath, callback);
           });

           readStream.pipe(writeStream);
       }

       app.post('/save-image-persistent', function(req, res){

           var content = req.body.content;

           var filename = req.body.filename;

           fs.rename('client/assets/file_temp/' + filename, 'client/assets/file_storage/' + filename, function (err) {
               if (err) {
                   if (err.code === 'EXDEV') {
                       copy(oldPath, newPath);

                       res.end(JSON.stringify({relpath: relpath, content: content}));

                   } else {

                       res.end(JSON.stringify({relpath: relpath, content: content}));


                   }
                   return;
               }
               callback();
           });


           setTimeout(function(){


               res.end(JSON.stringify({error:"time-out", relpath: relpath, content: content}));


           }, 10000);


       });

    //CLIENT-FILES:

    // Allow some files to be server over HTTP
    app.use(express.static(__dirname + '/client'));

    var files = $App.
        walkSync(__dirname + '/client/'), htmlFiles = [],

        $F = $App.Client_Files,

        examples = $App.
        walkSync(__dirname + '/client/examples/', [], 'html');


    function concatAll(lists)
    {
        var my_list = [];
        for(var x = 0; x < lists.length; x++) {
            my_list = my_list.concat(lists[x]);
        }
        return my_list;
    };

    function filterByString(list, fstring)
    {
        var my_list = [];
        for(var x = 0; x < list.length; x++) {
          if(list[x].indexOf(fstring) >= 0)
              my_list.push(list[x]);
        }
        return my_list;

    };

    for(var x = 0; x < files.length; x++)
    {
        var dotSplit = files[x].split('.'),

            fileType = dotSplit[dotSplit.length -1];

        $F.all_files.push(files[x]);

        var lcft = fileType.toLowerCase();

        if($F[lcft] instanceof Array)
        {

        }
        else
        {
            $F[lcft] = [];
        }

        //this is any file in the statically served client folder (LOCAL-TOOLS-ONLY)
        $F[lcft].push(files[x]);

    }

    var __inst = this; //reference in next scope


    //list all examples for Gamestack library

    app.get('/list-examples', function(req, res){

        res.end($App.jstr(examples
        ));
    });



    console.log('listening at:' + 'http://localhost:3137/main.html');

       app.listen(app.port);

       if(openNow) {

           var opn = require('opn');

           opn('http://localhost:3137/main.html', {app:"chrome"}) // Opens the url in the default browser

       }
};


module.exports(true);