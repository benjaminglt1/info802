/**
 * # Documentation du service Soap
 * 
 * ## Écriture du fichier wsdl
 * 
 * Ce service nécessite l'écriture à la main du fichier wsdl
 * 
 */

/**
 * ## Création de la fonction de calcul des frais
 * Définition de la fonction soap par rapport au document wsdl
 * 
 * ```javascript
 *  var calc = {
 *      calcFrais: {
 *          port: {
 *              calc: function(args) {
 *                  // On récupère les deux argument passés en paramètre
 *                  poid = Number(args.poid);
 *                  distance = Number(args.distance);
 *                     
 *                  // On effectue le traitement voulu
 *                  res = poid + distance * 0.1;
 * 
 *                  // On retourne le résultat attendu
 *                  return {
 *                      resultat: res
 *                  };
 *              }
 *          }
 *      }
 *  };
 * ```
 */
var calc = {
    calcFrais: {
        port: {
            calc: function(args) {
                poid = Number(args.poid);
                distance = Number(args.distance);
                res = poid + distance * 0.1;
                console.log("[LOG] Fonction calc"+res);
                return {
                    resultat: res
                };
            }
        }
    }
};

/**
 * ## Lancement du service soap
 * 
 * ### Récuperation du fichier wsdl
 * ```javascript
 *  //Récupération du fichier wsdl
 *  var xml = require('fs').readFileSync(__dirname+'/wsdl/calcFrais.wsdl', 'utf8');
 * ```
 * 
 * ### Le service
 * 
 * Utilisation du package 'soap'
 * 
 * ```javascript
 *  // On lance le service soap avec :
 *  // - Sont endpoint (ici '/wsdl')
 *  // - la fonction définie précédement
 *  // - le fichier wsdl 
 *  soap.listen(app, '/wsdl', calc, xml, function(){
 *      console.log('service soap lancé');
 *  });
 * ```
 */
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