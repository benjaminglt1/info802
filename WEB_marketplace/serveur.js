var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var soap = require('soap');
var soapUrl = "https://benjamingltsoap.herokuapp.com/wsdl?wsdl";
var graphqlUrl = "https://benjamingltgraphql.herokuapp.com/graphql";
var axios = require('axios')
var restUrl = "https://benjamingltrestapi.herokuapp.com/api";
var { request, gql } = require('graphql-request')

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

app.get("/transactions",(req, res) => {
    //récup des transacrtions du client courant
    axios.get(restUrl+'/client/'+variables.clientCourant['id']+'/operations', 
    {
        headers:{
            token: variables.token
        }
    })
    .then(resultat => {
        console.log(`statusCode: ${resultat.statusCode}`)
        console.log(resultat.data);
        res.render('transactions', {operations: resultat.data});
    })
    .catch(error => {
        console.error(error)
    });
});

app.get("/cartes",(req, res) => {
    //récup des transacrtions du client courant
    axios.get(restUrl+'/client/'+variables.clientCourant['id']+'/voirCartes', 
    {
        headers:{
            token: variables.token
        }
    })
    .then(resultat => {
        console.log(`statusCode: ${resultat.statusCode}`)
        console.log(resultat.data);
        variables.cartes = resultat.data
        res.render('cartes', {cartes: resultat.data});
    })
    .catch(error => {
        console.error(error)
    });
});

app.post("/ajoutCarte",(req, res) => {
    //récup des transacrtions du client courant
    axios.post(restUrl+'/client/'+variables.clientCourant["id"]+'/ajouterCarte', 
    {
        nom:req.body.nomCarte,
        numero: req.body.numCarte,
        validite: req.body.dateExpire,
        cvv: req.body.cvv
  },{
    headers:{
        token: variables.token
    }
})
  .then(resultat => {
    console.log(`statusCode: ${resultat.statusCode}`)
    console.log(resultat);
    res.redirect("/cartes")
  })
  .catch(error => {
    console.error(error)
  })
});

app.get("/supprimerCarte/:num",(req, res) => {
    //récup des transacrtions du client courant
    axios.delete(restUrl+'/client/'+variables.clientCourant["id"]+'/supprimerCarte/'+req.params.num, 
    {
        headers:{
            token: variables.token
        }
    })
  .then(resultat => {
    console.log(`statusCode: ${resultat.statusCode}`)
    console.log(resultat);
    res.redirect("/cartes")
  })
  .catch(error => {
    console.error(error)
  })
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
                    //recupération du token pour l'api
                    axios.post(restUrl+'/login', 
                    {
                        login: "logMarket",
                        pass: "mdpMarket"
                    })
                    .then(resultat => {
                        console.log(`statusCode: ${resultat.statusCode}`)
                        console.log(JSON.parse(resultat.data).token);
                        variables.token = JSON.parse(resultat.data).token;

                        //Infos récupérée on peut afficher la page d'accueil
                        res.render('accueil', {produits: variables.produits,client: variables.clientCourant});
                    })
                    .catch(error => {
                        console.error(error)
                    })
                    
                }); 
            }
        }
        
        //sinon retourner vers connexion
        if(!trouve){
            res.render('connexion',{erreur: "Mauvais identifiants"});
        }
    });
});

app.get("/accueil",(req, res) => {
    res.render('accueil', {produits: variables.produits,client: variables.clientCourant});
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
        if(!vendeur){
            //ajouter si client à l'api
            axios.post(restUrl+'/client', 
            {
                id: data['ajouterClient'],
                carte:[],
                operations:[]
            },{
                headers: {
                token: variables.token,
                }
            })
            .then(resultat => {
                console.log(`statusCode: ${resultat.statusCode}`)
                    console.log(resultat);
            })
            .catch(error => {
                console.error(error)
            })
        }else{
            //ajouter si vendeur à l'api
            var boutique = req.body.nomBoutique
        }
    })

    

    
    //renvoyer vers la page de connexion
    res.render('connexion');
});

app.get("/deconnexion",(req, res) => {
    //supprimer client courant

    //déco api
    axios.get(restUrl+'/logout', 
    {
    },{
        headers:{
        token: variables.token
        }
    })
    .then(resultat => {
        console.log(`statusCode: ${resultat.statusCode}`)
        console.log(JSON.parse(resultat.data).token);
        variables.token = JSON.parse(resultat.data).token;
    })
    .catch(error => {
        console.error(error)
    });

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
                    variables.qte = qte;
                    variables.prixTotal = parseInt(variables.produitCourant["prix"])*parseInt(qte)+parseInt(rep.resultat);
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
    axios.get(restUrl+'/client/'+variables.clientCourant['id']+'/voirCartes', 
    {
        headers:{
            token: variables.token
        }
    })
    .then(resultat => {
        console.log(`statusCode: ${resultat.statusCode}`)
        console.log(resultat.data);
        variables.cartes = resultat.data;

        //renvoyer vers le recap pré payement
        res.render('payement', {prix: "90", cartes: variables.cartes});
    })
    .catch(error => {
        console.error(error)
    });  
});

app.post("/payer",(req, res) => {
    
    axios.post(restUrl+'/simPayement/'+variables.clientCourant['id'], 
    {
        date: date(),
        montant: variables.prixTotal,
        produit: variables.produitCourant["nom"],
        qte: variables.qte,
        carte: req.body.carte,
        crediteur: "marketplace"
    },{
        headers:{
            token: variables.token
        }
    })
  .then(resultat => {
    res.redirect('/transactions');
  })
  .catch(error => {
    console.error(error)
  })
    
});

app.listen(port,function (){
    console.log("Le serveur tourne sur http://localhost:"+port);
});


function date(){
    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);

    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    let year = date_ob.getFullYear();

    let hours = date_ob.getHours();

    let minutes = date_ob.getMinutes();

    let seconds = date_ob.getSeconds();

    console.log(year + "-" + month + "-" + date);

    return date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
}