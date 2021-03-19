# Documentation du service Soap

## Écriture du fichier wsdl

Ce service nécessite l'écriture à la main du fichier wsdl



## Création de la fonction de calcul des frais
Définition de la fonction soap par rapport au document wsdl

```javascript
 var calc = {
     calcFrais: {
         port: {
             calc: function(args) {
                 // On récupère les deux argument passés en paramètre
                 poid = Number(args.poid);
                 distance = Number(args.distance);
                    
                 // On effectue le traitement voulu
                 res = poid + distance * 0.1;

                 // On retourne le résultat attendu
                 return {
                     resultat: res
                 };
             }
         }
     }
 };
```


## Lancement du service soap

### Récuperation du fichier wsdl
```javascript
 //Récupération du fichier wsdl
 var xml = require('fs').readFileSync(__dirname+'/wsdl/calcFrais.wsdl', 'utf8');
```

### Le service

Utilisation du package 'soap'

```javascript
 // On lance le service soap avec :
 // - Sont endpoint (ici '/wsdl')
 // - la fonction définie précédement
 // - le fichier wsdl 
 soap.listen(app, '/wsdl', calc, xml, function(){
     console.log('service soap lancé');
 });
```


# Documentation du service graphQL



## Configuration de la bdd firebase

Toutes les informations ci-dessous sont trouvables dans le panneaux d'administration firebase

```javascript
 const conf = {
     apiKey: clé de connexion a l'api firebase,
     authDomain: ulr du projet firebase,
     databaseURL: url de la base de données voulu,
     projectId: id du projet
 }
```
/ 


## Contruction des schema pour notre base

```javascript
 var schema = buildSchema(`{
     // on met tous les schema dont on à besoin
         type ... { ... }

     // On ajoute les requêtes possibles
     type Query{
         //get...
     }  

     // On ajoute les mutations
     type Mutation{
         //ajouter/supprimer/modifier
     }  
 }`)
```


## Construction des resolvers

```javascript
 var root = {
     // On va definir tous les endpoint définis dans 'Query' et  'Mutation'
     // Exemple :
     getProduits:() => {
         //on va chercher dans la bdd ce que l'on veut. Ici les produits dans la base
         return firebase.database().ref('/produit')...
     }
 }
```


## Configuration de graphQL

```javascript
 // On spécifie le chemin d'accès à graphQL (/graphql)
 // Ensuite on donne à notre application les schemas et les resolvers qui vont permettre la manipulation des données
 app.use('/graphql', graphqlHTTP({
     schema: schema,
     rootValue: root,
     graphiql: true,
 }));
```


# Documentation de l'API de paiement

Cette documentation permet de pouvoir utiliser l'API de paiement, tous les endpoints y sont détaillés avec leur structure ainsi que ce qu'ils retournent. On retrouve donc pour chaque endpoint :

- Son URL pour y accéder
- Un description pour savoir à quoi il sert
- Les données du header et du body nécessaires pour effectuer la requête
- Ce que va retourner l'appel à cet endpoint

## Les fonction pour les token :



Permet de générer un token pour cette api



**Returns**:  {string} Un token de connexion à l'api


Permet de supprimer un token pour supprimer sont accès à l'api



**Param**:  {string} tok Token permettant la connexion


**Returns**:  {boolean} Retourne si le token à été supprimé ou non


## Les endpoints :


# /api/login

## URL :

<url_serveur>/api/login

## Description :

Permet de se connecter à un compte via l'api

## Body
```json
 {
     login: login du compte de la personne à connecter,
     pass: mot de passe du compte à connecter
 }
```


**Returns**:  {json} On retourne le status de la connexion ainsi que le token qui permet de pouvoir utiliser les autres endpoints


# /api/logout

## URL :

<url_serveur>/api/logout

## Description :

Permet de se déconnecter de l'api

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne le status de la déconnexion


# /api/clients

## URL :

<url_serveur>/api/clients

## Description :

Permet de récuperer les clients

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne un tableau de client


# /api/client/:id

## URL :

<url_serveur>/api/client/<id_du_client>

## Description :

Permet de récuperer un client spécifique via sont id

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne le client


# /api/client

## URL :

<url_serveur>/api/client

## Description :

Permet de créer un nouveau client et de l'ajouter à la base

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
     id: id du client,
     carte: tableau avec les cartes du client,
     operations: tableau des opérations réalisées par le client
 }
```


**Returns**:  {json} On retourne les clients avec le nouveau client ajouté


# /api/client/:id/ajouterCarte

## URL :

<url_serveur>/api/client/<id_du_client>/ajouterCarte

## Description :

Permet d'ajouter une nouvelle carte au client voulu

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
     nom: nom que l'on veut donner à cette carte,
     numero: numéro de la carte,
     validite: validité de la carte "mm/aaaa",
     cvv: cryptogramme visuel de la carte à ajouter
 }
```


**Returns**:  {json} On retourne un tableau de client


# /api/client/:id/supprimerCarte/:nom

## URL :

<url_serveur>/api/client/<id_du_client>/supprimerCarte/<num_carte>

## Description :

Permet de supprimer une carte d'un client

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne un tableau de client


# /api/client/:id/voirCartes

## URL :

<url_serveur>/api/client/<id_du_client>/voirCartes

## Description :

Permet de voir les cartes d'un client

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne un tableau contenant les cartes du client voulu


# /api/client/:id/operations

## URL :

<url_serveur>/api/client/<id_du_client>/operations

## Description :

Permet de voir les opérations faites par un client

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
 }
```


**Returns**:  {json} On retourne un tableau contenant les opérations du client


# /api/simPayement/:idClient

## URL :

<url_serveur>/api/simPayement/<id_du_client>

## Description :

Permet simuler un paiement

## Header
```
 {
     token: le token de connexion à l'api
 }
```

## Body
```json
 {
     date: Date heure du jour,
     montant: montant de la transaction,
     produit: nom du produit commandé,
     qte: quantité commandée,
     carte: nom de la carte utilisé,
     crediteur: nom du créditeur
 }
```


**Returns**:  {json} On retourne le body de la requete


# Documentation site web

## Utilisation du service soap

```javascript
 var soap = require('soap');

 // On met dans un tableau les argument nécessaire à la requête
 args = {poid:poidt,distance:dist};
 
     // On crée un client soap avec l'url de notre service
     soap.createClient(soapUrl, function(err, client) {
	    if(err) {
		    console.error(err);
	    }else {

             // Avec le client on va appeler la fonction soap voulu et lui passer les arguments si elle en a
             // on recoit ensuite le résultat de l'appel ou une erreur si la fonction n'est pas définie par exemple
		    client.calc(args, function(err, rep) {
			    if(err) {
				    console.error("[ERREUR] Problème requête vers le serveur :"+err);
			    }else{
				    console.log("[LOG] Requête réussie\n Résultat = "+rep.resultat);
			    }
     	    });
         }
     });
```

## Utilisation du service graphQL
Utilisation du package graphql-request pour communiquer avec notre service 

```javascript
 var { request, gql } = require('graphql-request')
```

### Query
```javascript
 // On construit une requete avec l'une des fonctions du Schema défini par le service graphQL
 const query = gql`
 {
     getProduitsVendeur(vendeur:"`+variables.clientCourant['id']+`"){
	    id
	    nom
         photo
         prix
         poid
         vendeur
     }
 }`

 // on execute la requête en passant en paramètre l'url du service et la requête
 request(graphqlUrl, query).then((data) => {
     //on obtient alors le résultat de la requete dans la variable data
     variables.produitsVendeur = data["getProduitsVendeur"];
 })
```

### Mutation

De la même manièrre que pour le requête on va dans un premier temps créer notre mutation qui sera dans un second temps executée via la request graphQL 

```javascript
 const mutation = gql`
      mutation {
          ajouterProduit(nom:"nom",prix:"prix",poid:"poid",photo:"url_photo",vendeur:"booléen")
     }`
 request(graphqlUrl, mutation).then((data) => {
     console.log(data);
 })
```

## Utilisation de l'api rest

Utilisation du package axios qui permet l'envoi/reception de requête http
 ```javascript
 // Pour effectuer une requête post on utilise axios.post(<endpoint api>,{<body>},{<headers>});
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
         // on récupère le résultat de la requête dans la variable resultat
     })
     .catch(error => {
         // on recupère l'erreur dans la variable error
     });
```

# Utilisation du site
## URL
https://benjamingltweb.herokuapp.com

## Compte déjà créés
### Client
```
Login : client   
Pass : client
```
### Vendeur
```
Login : vendeur
Pass : vendeur
```
## Les pages du site

## Côté client
### Page de création de compte
![creation_compte](/Images_doc/1.png)
### Page de connexion
![connexion](/Images_doc/2.png)
### Page d'accueil
![accueil](/Images_doc/3.png)
### Page d'un produit
![produit](/Images_doc/4.png)
### Page de validation de la commande
![validation_commande](/Images_doc/5.png)
### Page de payement
![payement](/Images_doc/6.png)
### Page du récapitulatif des précédentes transactions
![recap_transactions](/Images_doc/7.png)
### Page récapitulatif/ajout de cartes bancaires
![recap_cartes](/Images_doc/8.png)

## Côté vendeur
### Page d'ajout/suppression de produits
![ajout_produits](/Images_doc/9.png)

