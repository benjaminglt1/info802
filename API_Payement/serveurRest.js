/**
 * # Documentation de l'API de paiement
 * 
 * Cette documentation permet de pouvoir utiliser l'API de paiement, tous les endpoints y sont détaillés avec leur structure ainsi que ce qu'ils retournent. On retrouve donc pour chaque endpoint :
 * 
 * - Son URL pour y accéder
 * - Un description pour savoir à quoi il sert
 * - Les données du header et du body nécessaires pour effectuer la requête
 * - Ce que va retourner l'appel à cet endpoint
 * 
 * ## Les fonction pour les token :
 * 
*/

var token = [];

/**
 * Permet de générer un token pour cette api
 * 
 * @returns {string} Un token de connexion à l'api
 */
function genererToken(){
    var tok;
    var end = false;
    while(!end){
        tok = Str.random(10);
        if(token.indexOf(tok) == -1){
            token.push(tok);
            end = true;
        }
    }
    return tok;

}

/**
 * Permet de supprimer un token pour supprimer sont accès à l'api
 * 
 * @param {string} tok Token permettant la connexion
 * @returns {boolean} Retourne si le token à été supprimé ou non
 */
function supprToken(tok){
    token.splice(token.indexOf(tok),1);
    return true;
}

/**
 * ## Les endpoints :
 */


//Bdd des clients
const clients = require('./clients.json');

const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//Pour la génération d'une chaine de caractères random
const Str = require('@supercharge/strings');

app.use(express.json());

/**
 * # /api/login
 * 
 * ## URL :
 * 
 * <url_serveur>/api/login
 * 
 * ## Description :
 * 
 * Permet de se connecter à un compte via l'api
 * 
 * ## Body
 * ```json
 *  {
 *      login: login du compte de la personne à connecter,
 *      pass: mot de passe du compte à connecter
 *  }
 * ```
 * @returns {json} On retourne le status de la connexion ainsi que le token qui permet de pouvoir utiliser les autres endpoints
 */
app.post('/api/login', (requete,reponse) => {
    var log = requete.body.login;
    var pass = requete.body.pass;
    if("logMarket"===log && "mdpMarket"===pass){
        var tok = genererToken();
        var rep = JSON.stringify({
            status: "ok",
            token: tok
        });
        reponse.status(200).json(rep);
    }else{
        var rep = JSON.stringify({
            status: "Mauvais identifiants"
        });
        reponse.status(401).json(rep);
    }
    
});

//Se deconnecter / supprimer le token
/**
 * # /api/logout
 * 
 * ## URL :
 * 
 * <url_serveur>/api/logout
 * 
 * ## Description :
 * 
 * Permet de se déconnecter de l'api
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne le status de la déconnexion
 */
app.get('/api/logout', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        supprToken(requete.headers.token);
        var rep = JSON.stringify({
            status: "ok"
        });
        reponse.status(200).json(rep);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});




/**
 * # /api/clients
 * 
 * ## URL :
 * 
 * <url_serveur>/api/clients
 * 
 * ## Description :
 * 
 * Permet de récuperer les clients
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne un tableau de client
 */
app.get('/api/clients', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        reponse.status(200).json(clients);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client/:id
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client/<id_du_client>
 * 
 * ## Description :
 * 
 * Permet de récuperer un client spécifique via sont id
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne le client
 */
app.get('/api/client/:id', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.id;
        var client = clients.find(client => client.id === id);
        reponse.status(200).json(client);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client
 * 
 * ## Description :
 * 
 * Permet de créer un nouveau client et de l'ajouter à la base
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *      id: id du client,
 *      carte: tableau avec les cartes du client,
 *      operations: tableau des opérations réalisées par le client
 *  }
 * ```
 * @returns {json} On retourne les clients avec le nouveau client ajouté
 */
app.post('/api/client', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        clients.push(requete.body);

        fs.writeFile('clients.json', JSON.stringify(clients), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON sauvegardé");
        });

        reponse.status(200).json(clients);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client/:id/ajouterCarte
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client/<id_du_client>/ajouterCarte
 * 
 * ## Description :
 * 
 * Permet d'ajouter une nouvelle carte au client voulu
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *      nom: nom que l'on veut donner à cette carte,
 *      numero: numéro de la carte,
 *      validite: validité de la carte "mm/aaaa",
 *      cvv: cryptogramme visuel de la carte à ajouter
 *  }
 * ```
 * @returns {json} On retourne un tableau de client
 */
app.post('/api/client/:id/ajouterCarte', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.id;
        clients.find(client => client.id === id).carte.push(requete.body);
        
        fs.writeFile('clients.json', JSON.stringify(clients), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON sauvegardé");
        });

        reponse.status(200).json(clients);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client/:id/supprimerCarte/:nom
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client/<id_du_client>/supprimerCarte/<num_carte>
 * 
 * ## Description :
 * 
 * Permet de supprimer une carte d'un client
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne un tableau de client
 */
app.delete('/api/client/:id/supprimerCarte/:nom', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.id;
        var num = requete.params.nom;
        
        var d = clients.find(client => client.id === id).carte.findIndex(c=> c.numero === num);
        console.log(d);
        if(d>=0){
            clients.find(client => client.id === id).carte.splice(d,1);
        }
        
        fs.writeFile('clients.json', JSON.stringify(clients), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON sauvegardé");
        });
        
        reponse.status(200).json(clients);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client/:id/voirCartes
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client/<id_du_client>/voirCartes
 * 
 * ## Description :
 * 
 * Permet de voir les cartes d'un client
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne un tableau contenant les cartes du client voulu
 */
app.get('/api/client/:id/voirCartes', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.id;
        var client = clients.find(client => client.id === id);
        if(client.carte.length>0){
            reponse.status(200).json(client.carte);
        }else{
            reponse.status(200).json('{carte:"pas de carte"}')
        }
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/client/:id/operations
 * 
 * ## URL :
 * 
 * <url_serveur>/api/client/<id_du_client>/operations
 * 
 * ## Description :
 * 
 * Permet de voir les opérations faites par un client
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *  }
 * ```
 * @returns {json} On retourne un tableau contenant les opérations du client
 */
app.get('/api/client/:id/operations', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.id;
        var client = clients.find(client => client.id === id);
        reponse.status(200).json(client.operations);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

/**
 * # /api/simPayement/:idClient
 * 
 * ## URL :
 * 
 * <url_serveur>/api/simPayement/<id_du_client>
 * 
 * ## Description :
 * 
 * Permet simuler un paiement
 * 
 * ## Header
 * ```
 *  {
 *      token: le token de connexion à l'api
 *  }
 * ```
 * 
 * ## Body
 * ```json
 *  {
 *      date: Date heure du jour,
 *      montant: montant de la transaction,
 *      produit: nom du produit commandé,
 *      qte: quantité commandée,
 *      carte: nom de la carte utilisé,
 *      crediteur: nom du créditeur
 *  }
 * ```
 * @returns {json} On retourne le body de la requete
 */
app.post('/api/simPayement/:idClient', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = requete.params.idClient;
        clients.find(client => client.id === id).operations.push(requete.body);
        
        fs.writeFile('clients.json', JSON.stringify(clients), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON sauvegardé");
        });
        
        reponse.status(200).json(requete.body);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});


app.listen(port, () => {
    console.log('Serveur démaré sur le port '+port);
})