var http = require('http');
var express = require('express');
var ig = require('instagram-node').instagram();
var app = express();

var access_token;

app.set('port', (process.env.PORT || 5001));

ig.use({
  client_id: 'afb68423905c4e87a3607eb5fceecfbd',
  client_secret: '29e1083172394f068de85c3b1148b460'
});

var redirect_uri = 'http://localhost:5001/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes', 'public_content'], state: 'a state' }));
};

exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      ig.use({ access_token: result.access_token });
      // result has User Id
      access_token = result.access_token; 
      res.send(result);
    }
  });
};

// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is your redirect URI
app.get('/handleauth', exports.handleauth);

app.get('/user', function(req, res){
  ig.user('30806423', function(err, result, remaining, limit) {
    console.log('err: ', err)
    console.log('user: ', result)
    res.json(result);
  });
});
app.get('/token', function(req, res){
  res.json({token: access_token});
});

app.get('/user_search', function(req, res){
  //deprecated
  ig.user_search('stephen_tvedt', {}, function(err, users, remaining, limit) {
    console.log('search err:', err);
    console.log('users: ', users);
    res.json(users);
  });
});

app.get('/tag', function(req, res){
  // returns number of posts to a hashtag
  ig.tag('njspots', function(err, result, remaining, limit) {
    console.log(result);
  });
});

app.get('/tag_media_recent', function(req, res){
  // gets media a user as used with a particular hashtag
  ig.tag_media_recent('njspots', {}, function(err, medias, pagination, remaining, limit) {
    console.log('err: ', err);
    console.log('medias: ', medias);
    console.log('pagination: ', pagination);
    console.log('remaining: ', remaining);
    console.log('limit: ', limit);
    res.json(medias);
  });
});

app.get('/tag_search', function(req, res){
  // searches for hashtag with query and return results with # of posts
  ig.tag_search('njspots', function(err, result, remaining, limit) {
    console.log(result);
  });
});

app.get('/self_media', function(req, res){
  ig.user_self_media_recent({ count: 10}, function(err, medias, pagination, remaining, limit) {

    res.json(medias);
  });
});

app.get('/location', function(req, res){
  ig.media_search(48.4335645654, 2.345645645, { distance: 1000}, function(err, medias, remaining, limit) {
    console.log('/location err:', err);
    console.log(medias);
    res.send(medias);
  });
});
// NYC 40.7128°, 74.0060°

app.get('/media_popular', function(req, res){
  ig.media_popular(function(err, medias, remaining, limit) {
    console.log('/media_popular err: ', err)
    res.send(medias);
  });
})


// ig.tag_media_recent('#st30days', {},function(err, medias, pagination, remaining, limit) {
//   console.log(medias);
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
