var calc = {
    calcFrais: {
        port: {
            calc: function(args) {
                poid = Number(args.poid);
                distance = Number(args.distance);
                res = poid + distance;
                console.log("[LOG] Fonction calc"+res);
                return {
                    resultat: res
                };
            }
        }
    }
};

var xml = require('fs').readFileSync(__dirname+'/wsdl/calcFrais.wsdl', 'utf8');
var express = require('express');
var bodyParser = require('body-parser')
var soap = require('soap')
var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.listen(port, function(){
    console.log(`Serveur démaré sur le port ${port}!`);
    soap.listen(app, '/wsdl', calc, xml, function(){
      console.log('service soap lancé');
    });
});