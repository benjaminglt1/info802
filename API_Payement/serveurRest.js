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

//Permet de générer un token pour pouvoir utiliser les differents endpoints de l'api
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

//Permet de supprimer un token
function supprToken(tok){
    token.splice(token.indexOf(tok),1);
    return true;
}

const clients = require('./clients.json');
const vendeurs = require('./vendeurs.json');
const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const Str = require('@supercharge/strings');

app.use(express.json());

//Se connecter à l'api / obtenir un token
app.post('/api/login', (requete,reponse) => {
    var log = requete.body.login;
    var pass = requete.body.pass;
    if(vendeurs.indexOf(vendeurs.find(cred=>cred.login===log && cred.mdp===pass))>-1){
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




//Voir les clients
app.get('/api/clients', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        reponse.status(200).json(clients);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

//Voir un client
app.get('/api/client/:id', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = parseInt(requete.params.id);
        var client = clients.find(client => client.id === id);
        reponse.status(200).json(client);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

//Creer client
app.post('/api/client', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        clients.push(requete.body);

        fs.writeFile('clients1.json', JSON.stringify(clients), (err) => {
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

//ajouter carte
app.post('/api/client/:id/ajouterCarte', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = parseInt(requete.params.id);
        clients.find(client => client.id === id).carte.push(requete.body);
        
        fs.writeFile('clients1.json', JSON.stringify(clients), (err) => {
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

//supprimer carte
app.delete('/api/client/:id/supprimerCarte/:nom', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = parseInt(requete.params.id);
        var num = parseInt(requete.params.nom);
        
        var d = clients.find(client => client.id === id).carte.findIndex(c=> c.numero === num);
        console.log(d);
        if(d>=0){
            clients.find(client => client.id === id).carte.splice(d,1);
        }
        
        fs.writeFile('clients1.json', JSON.stringify(clients), (err) => {
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

//Voir operations
app.get('/api/client/:id/operations', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = parseInt(requete.params.id);
        var client = clients.find(client => client.id === id);
        reponse.status(200).json(client.operations);
    }else{
        reponse.status(401).json({"status":"Il faut se connecter"});
    }
});

//Simuler payement
app.post('/api/simPayement/:idClient', (requete,reponse) => {
    if(token.indexOf(requete.headers.token)>-1){
        var id = parseInt(requete.params.idClient);
        clients.find(client => client.id === id).operations.push(requete.body);
        
        fs.writeFile('clients1.json', JSON.stringify(clients), (err) => {
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