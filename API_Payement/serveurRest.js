/**
 * Fonctions à implementer
 * 
 * creer client -> nom
 * ajouter carte -> numero de carte /  code / client
 * supprimer carte -> numero de carte
 * 
 * simuler payement -> prix / carte
 */
var token = [];
function genererToken(){
    var tok;
    var end = false;
    while(!end){
        tok = strRandom({
            includeUpperCase: true,
            includeNumbers: true,
            length: 10
        });
        if(token.indexOf(tok) == -1){
            token.push(tok);
            end = true;
        }
    }
    return tok;

}

function supprToken(tok){
    token.splice(token.indexOf(tok),1);
    return true;
}

const clients = require('./clients.json');
const crediteurs = require('./crediteurs.json');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())

//Se connecter à l'api / obtenir un token
app.post('/api/login', (requete,reponse) => {
    var log = requete.params.log;
    var pass = requete.params.pass;
    var tok = genererToken();
    crediteurs.find(cred => cred.login === log && cred.mdp === pass).token = tok;

    var rep = JSON.stringify({
        status: "ok",
        token: tok
    });
    reponse.status(200).json(rep);
});

//Se deconnecter / supprimer le token
app.post('/api/logout', (requete,reponse) => {
    supprToken(requete.body.token);
    crediteurs.find(cred => cred.token === requete.body.token).token = "";
    var rep = JSON.stringify({
        status: "ok"
    });
    reponse.status(200).json(rep);
});




//Voir les clients
app.get('/api/clients', (requete,reponse) => {
    reponse.status(200).json(clients);
});

//Voir un client
app.get('/api/client/:id', (requete,reponse) => {
    var id = parseInt(requete.params.id);
    var client = clients.find(client => client.id === id);
    reponse.status(200).json(client);
});

//Creer client
app.post('/api/client', (requete,reponse) => {
    clients.push(requete.body);
    reponse.status(200).json(clients);
});

//ajouter carte
app.post('/api/client/:id/ajouterCarte', (requete,reponse) => {
    var id = parseInt(requete.params.id);
    clients.find(client => client.id === id).carte.push(requete.body);
    reponse.status(200).json(clients);
});

//supprimer carte
app.delete('/api/client/:id/supprimerCarte/:nom', (requete,reponse) => {
    var id = parseInt(requete.params.id);
    var num = parseInt(requete.params.nom);
    
    var d = clients.find(client => client.id === id).carte.findIndex(c=> c.numero === num);
    console.log(d);
    if(d>=0){
    clients.find(client => client.id === id).carte.splice(d,1);
    }
    reponse.status(200).json(clients);
});

//Voir operations
app.get('/api/client/:id/operations', (requete,reponse) => {
    var id = parseInt(requete.params.id);
    var client = clients.find(client => client.id === id);
    reponse.status(200).json(client.operations);
});

//Simuler payement
app.post('/api/simPayement/:idClient', (requete,reponse) => {
    var id = parseInt(requete.params.idClient);
    clients.find(client => client.id === id).operations.push(requete.body);

    reponse.status(200).json(requete.body);
});


app.listen(port, () => {
    console.log('Serveur démaré sur le port '+port);
})