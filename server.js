const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const urlExists = require('url-exists');
const url = require("url");
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://test:test@ds157559.mlab.com:57559/linkurl')

var urlSchema = new mongoose.Schema({
    url_code: Number,
    orginal_url: String,
    short_url: String
    })

var Urls = mongoose.model('redirCollection', urlSchema);

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.get('/', function(req, res){
      res.render('index');
});

app.get('/new/:url(*)', function(req, res){
    var num = Math.floor(Math.random() * 90000) + 10000;
    var clientHeader = req.headers;
    var result = url.parse(req.params.url);
    var web = req.params.url;
    if(result['protocol'] == null){
        web = 'http://' + web;
    }
    urlExists(web, function(error, exists){
        if(exists){
    		Urls.findOneAndUpdate({type: 'web'}, {url_code: num, orginal_url: web, short_url: 'http://' + clientHeader['host'] + '/' + num}).then(function(){
                Urls.findOne({url_code: num}).then(function(result){
                    var urlObj = { orginal_url: result['orginal_url'], short_url: result['short_url']};
                    res.send(urlObj);
                    app.get('/'+ result['url_code'], function(req, res){
                        res.redirect(result['orginal_url']);
                    })
                })
    		})
        }else{
            var errorUrl = {error: "website error"};
            res.send(errorUrl);
        }
    });
});

app.listen(port, function () {
  console.log('Example app listening on port 8080!')
})



