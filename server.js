var express= require("express");
var app = express();
var port = process.env.PORT || 8080 ;
// var imgur = require("imgur-node-api");
// const imgur = require('./services/imgur');
const request = require('request');
var mongoose = require("mongoose");
var querySearch = require("./models/query-search");

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/image-search');
mongoose.Promise = global.Promise;

var getImage = function(search, page) {
  return new Promise((resolve, reject) => {
    "use strict";
    // if (page===undefined) page =1 ;
    let options = {
      url: `https://api.imgur.com/3/gallery/search/${page}?q=${search}`,
      headers: { Authorization: 'Client-ID 9a8895dd02eb9e4' },
      json: true
    };
    // console.log(options);
    function getPics(err, response, body) {
      if (!err && response.statusCode == 200) {
        // body = body.data.filter(image => {
        //   if (!image.is_album) {
        //     return image;
        //   }
        // }).map(image => {
        //   return {
        //     url: image.link,
        //     snippet: image.title,
        //     context: `https://imgur.com/${image.id}`
        //   };
        // });
        // console.log(body);
        // resolve(body);
        // console.log(body.data[0]);
        var result = [];
        for(var i=0;i<body.data.length;i++){
          if(body.data[i].is_album) continue;
          var tmp = {
            url : body.data[i].link,
            snippet : body.data[i].title,
            context : 'https://imgur.com/'+body.data[i].id
          }
          result.push(tmp)
        }
        resolve(result);
        // console.log(result);
      }
    }
    request(options, getPics);
  });
};


"use strict";
app.get('/',function(req,res){
  res.sendfile('index.html', {root: __dirname });
});

app.get('/search/:q', (req, res) => {
  var offset = req.query.offset;
  var data = new querySearch({
    "term": req.params.q,
    "when": new Date()
  });
  data.save(err=>{
    if(err)  return res.send("Something error");
  })
    // if(offset===undefined) offset =1 ;
    getImage(req.params.q, offset).then(ans => {
    
    res.json(ans);
    
  });
 
  
});

app.get('/latest/search',(req,res)=>{
  querySearch.find({},function(err,data){
      if(err) throw err ;
      var length =data.length;
      // console.log(length);
  
      var dataShow = [];
      if(length<10) {
        for(var i=length-1;i>=0;i--)
        dataShow.push({"term":data[i].term,"when":data[i].when});
      }
      else {
        for(var i=length-1;i>=0;i--)
        dataShow.push({"term":data[i].term,"when":data[i].when});
  }
  res.json(dataShow);
  })
});


app.listen(port,function(){
  console.log("Server is running");
})