var express = require('express');
var app = express();
var port = 8080;
var path = require('path');
var token;
var options = { 
    root: path.join(__dirname) 
};//obtention du path
app.use(express.static(__dirname));
app.set('view engine', 'pug');

app.get("/",(req, res) => {
    res.render('connexion');
});

app.get("/creerCompte",(req, res) => {
    res.render('creerCompte');
});

app.post("/connexion",(req, res) => {
    //verification des info en base -> graphql
        //si log = log & mdp=pass --> stocker le client comme client courant/connecté
            //connexion api
                //stockage token
            //passer à la suite

        //sinon retourner vers connexion
    var produits = ["a","b","c"];

    //appel graphql pour récuperer l'ensemble des produits puis renvoie vers l'accueil pour les afficher
    res.render('accueil', {produits: produits});
});

app.post("/creer",(req, res) => {
    //ajouter le client à la bdd via graphql

    //ajouter si client à l'api

    //ajouter si vendeur à l'api

    //renvoyer vers la page de connexion
    res.render('connexion');
});

app.get("/deconnexion",(req, res) => {
    //supprimer client courant

    //déco api
    res.render('connexion');
});

app.get("/prod",(req, res) => {
    //recup l'id

    //recup les infos produits via l'id

    //déco api
    res.render('produit', {nomProduit: "ordinateur", prixProduit: "10",poidProduit: "5", idProduit:"0",url: "https://image.darty.com/informatique/ordinateur_portable-portable/portable/asus_s712fa-au391i7_8_12_s1911144741366A_104842555.jpg"});
});

app.post("/commander",(req, res) => {
    //recup elements requete
    console.log(req.body)

    //calculer le prix de livraison via le service soap

    //renvoyer vers le recap pré payement
    res.render('commande', {nomProduit: "ordinateur", prix: "10",poid: "5", qte:"5",prixLivraison:"40"});
});

app.post("/payement",(req, res) => {
    //recup elements requete (prix total)
    console.log(req.body)

    //recup carte api rest
    var cartes = [["id","a"],["id","b"]];
    console.log(cartes.length)

    //renvoyer vers le recap pré payement
    res.render('payement', {prix: "90", cartes: cartes});
});


app.listen(port,function (){
    console.log("Le serveur tourne sur http://localhost:"+port);
});