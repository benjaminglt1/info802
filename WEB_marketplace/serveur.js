var express = require('express');
var app = express();
var port = 8080;
var path = require('path');
var options = { 
    root: path.join(__dirname) 
};//obtention du path
app.use(express.static(__dirname));
app.listen(port,function (){
    console.log("Le serveur tourne sur http://localhost:"+port);
});