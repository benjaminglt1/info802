var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var soap = require('soap');
var soapUrl = "https://benjamingltsoap.herokuapp.com/wsdl?wsdl"
var graphqlUrl = "https://benjamingltgraphql.herokuapp.com/graphql"
var { request, gql } = require('graphql-request')

var token;
var variables = {};
var options = { 
    root: path.join(__dirname) 
};//obtention du path
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded());

app.set('view engine', 'pug');

app.get("/",(req, res) => {
    res.render('connexion');
});

app.get("/creerCompte",(req, res) => {
    res.render('creerCompte');
});

app.post("/connexion",(req, res) => {
    //verification des info en base -> graphql
    const query = gql`
    {
        getClients{
		    id
		    login
            mdp
            nom
            prenom
            vendeur
        }
    }`
    request(graphqlUrl, query).then((data) => {
        variables.clients = data["getClients"];
        console.log(variables.clients);
    }).then(() => {
        trouve = false;
        for(client of variables.clients){
            //si log = log & mdp=pass --> stocker le client comme client courant/connecté
            console.log(client)
            if(client['login'] == req.body.log && client['mdp'] == req.body.pass){
                trouve = true;
                variables.clientCourant  = client;
                //appel graphql pour récuperer l'ensemble des produits puis renvoie vers l'accueil pour les afficher
                const query = gql`
                {
                    getProduits{
                        id
                        nom
                        photo
                        prix
                    }
                }`
                request(graphqlUrl, query).then((data) => {
                    variables.produits = data["getProduits"];
                    console.log(variables.produits);

                    res.render('accueil', {produits: variables.produits,client: variables.clientCourant});
                }); 
            }
        }
        
        //sinon retourner vers connexion
        if(!trouve){
            res.render('connexion',{erreur: "Mauvais identifiants"});
        }
    });
       
            
            

        

    
    
});

app.post("/creer",(req, res) => {
    //ajouter le client à la bdd via graphql
    var nom = req.body.nom;
    var prenom = req.body.pnom;
    var login = req.body.log;
    var pass = req.body.pass;
    var vendeur = false;
    if(req.body.vendeur == "true"){
        vendeur = true;
    }

    const mutation = gql`
    mutation {
        ajouterClient(nom:"`+nom+`",prenom:"`+prenom+`",login:"`+login+`",mdp:"`+pass+`",vendeur:`+vendeur+`)
    }`
    request(graphqlUrl, mutation).then((data) => {
        console.log(data);
    })

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

app.get("/prod/:id",(req, res) => {
    //recup l'id
    var id = req.params.id;

    //recup les infos produits via l'id
    const query = gql`
    {
        getProduit(id:"`+id+`"){
		    id
		    nom
            photo
            poid
            prix
        }
    }`
    request(graphqlUrl, query).then((data) => {
        variables.produitCourant = data["getProduit"];
        console.log(variables.produitCourant);

        //afficher le produit
        res.render('produit', {nomProduit: variables.produitCourant['nom'], prixProduit: variables.produitCourant['prix'],poidProduit: variables.produitCourant['poid'], idProduit:id,url: variables.produitCourant['photo']});
    }); 
});

app.post("/commander",(req, res) => {
    //recup elements requete
    var qte = req.body.qte;
	var dist = req.body.distance;
    console.log(parseInt(qte))
    console.log(parseInt(variables.produitCourant["poid"]))
    var poidt = parseInt(qte)*variables.produitCourant["poid"];
    console.log(dist)
    console.log(poidt)

    //calculer le prix de livraison via le service soap
    
	args = {poid:poidt,distance:dist};
	soap.createClient(soapUrl, function(err, client) {
		if(err) {
			console.error(err);
		}else {
			client.calc(args, function(err, rep) {
				if(err) {
					console.error("[ERREUR] Problème requête vers le serveur :"+err);
				} else {
					console.log("[LOG] Requête réussie\n Résultat = "+rep.resultat);
					//renvoyer vers le recap pré payement
                    res.render('commande', {nomProduit: variables.produitCourant["nom"], prix: variables.produitCourant["prix"],poid: variables.produitCourant["poid"], qte: qte,prixLivraison:rep.resultat});

				}
        	});
    	}
    });

    
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