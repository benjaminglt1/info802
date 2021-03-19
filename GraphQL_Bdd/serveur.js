/**
 * # Documentation du service graphQL
 * 
*/

var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const firebase = require('firebase');

const port = process.env.PORT || 3000;


/**
 * ## Configuration de la bdd firebase
 * 
 * Toutes les informations ci-dessous sont trouvables dans le panneaux d'administration firebase
 * 
 * ```javascript
 *  const conf = {
 *      apiKey: clé de connexion a l'api firebase,
 *      authDomain: ulr du projet firebase,
 *      databaseURL: url de la base de données voulu,
 *      projectId: id du projet
 *  }
 * ```
 */ 
const conf = {
    apiKey: "AIzaSyCoziNM4DIF74O5CTbGlvDArqmVohozOs8",
    authDomain: "baseinfo802.firebaseapp.com",
    databaseURL: "https://baseinfo802-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "baseinfo802"
};

firebase.initializeApp(conf);

/**
 * ## Contruction des schema pour notre base
 * 
 * ```javascript
 *  var schema = buildSchema(`{
 *      // on met tous les schema dont on à besoin
 *          type ... { ... }
 * 
 *      // On ajoute les requêtes possibles
 *      type Query{
 *          //get...
 *      }  
 * 
 *      // On ajoute les mutations
 *      type Mutation{
 *          //ajouter/supprimer/modifier
 *      }  
 *  }`)
 * ```
 */
var schema = buildSchema(`
    type produit {
        id: String
        nom: String
        prix: String
        poid: String
        photo: String
        vendeur: String
    }
    type client {
        id: String
        nom: String
        prenom: String
        login: String
        mdp: String
        vendeur: Boolean
    }
    type Query {
        getProduits: [produit]
        getProduitsVendeur(vendeur:String!): [produit]
        getProduit(id:String!): produit
        getClients: [client]
        getClient(id:String!): client
    }
    type Mutation {
        ajouterProduit(nom:String!,prix:String!,poid:String!,photo:String!,vendeur:String!): Boolean
        supprimerProduit(id:String!): Boolean
        ajouterClient(nom:String!,prenom:String!,login: String!,mdp: String!,vendeur: Boolean!): String
        supprimerClient(id:String!): Boolean
    }
`);


/**
 * ## Construction des resolvers
 * 
 * ```javascript
 *  var root = {
 *      // On va definir tous les endpoint définis dans 'Query' et  'Mutation'
 *      // Exemple :
 *      getProduits:() => {
 *          //on va chercher dans la bdd ce que l'on veut. Ici les produits dans la base
 *          return firebase.database().ref('/produit')...
 *      }
 *  }
 * ```
 */
var root = {
    getProduits:() => {
        return firebase.database().ref('/produits').once('value').then((res) => {
            var tabRes = []; 
            res.forEach(function(item) {
            
                console.log(item.val());
                
                tabRes.push(item.val());
                
            }); 
            return tabRes; 
        });
    },getProduitsVendeur:(arg) => {
        return firebase.database().ref('/produits').once('value').then((res) => {
            var tabRes = []; 
            res.forEach(function(item) {
            
                console.log(item.val());
                if(item.val().vendeur === arg.vendeur){
                    tabRes.push(item.val());
                }
                
                
            }); 
            return tabRes; 
        });
    },
    getProduit:(arg) => {
        return firebase.database().ref('/produits/'+arg.id).once('value').then((res) => {
            return res.val(); 
        });
    },
    getClients:() => {
        return firebase.database().ref('/utilisateurs').once('value').then((res) => {
            var tabRes = []; 
            res.forEach(function(item) {
            
                console.log(item.val());
                
                tabRes.push(item.val());
                
            }); 
            return tabRes; 
        });
    },
    getClient:(arg) => {
        return firebase.database().ref('/utilisateurs/'+arg.id).once('value').then((res) => {
            return res.val(); 
        });
    },
    ajouterProduit:(arg) => {
        // Pemet de générer une clé pour insérer des données dans la base
        var newPostKey = firebase.database().ref('/produits').push().key;
        
        var postData = {
            id: newPostKey,
            nom: arg.nom,
            photo: arg.photo,
            poid: arg.poid,
            prix: arg.prix,
            vendeur: arg.vendeur
          };
                
        var updates = {};
        updates['/produits/'+newPostKey] = postData;
        
        return firebase.database().ref().update(updates).then(() => {
            return true
        });
    },
    supprimerProduit(arg) {
        return firebase.database().ref('/produits/'+arg.id).remove().then(() => {
            return true
        });
    },
    ajouterClient:(arg) => {
        var newPostKey = firebase.database().ref('/utilisateurs').push().key;
        
        var postData = {
            id: newPostKey,
            nom: arg.nom,
            prenom: arg.prenom,
            login: arg.login,
            mdp: arg.mdp,
            vendeur: arg.vendeur
          };
                
        var updates = {};
        updates['/utilisateurs/'+newPostKey] = postData;
        
        return firebase.database().ref().update(updates).then(() => {
            return newPostKey
        });
    },
    supprimerClient(arg) {
        return firebase.database().ref('/utilisateurs/'+arg.id).remove().then(() => {
            return true
        });
    },
};
 
var app = express();

/**
 * ## Configuration de graphQL
 * 
 * ```javascript
 *  // On spécifie le chemin d'accès à graphQL (/graphql)
 *  // Ensuite on donne à notre application les schemas et les resolvers qui vont permettre la manipulation des données
 *  app.use('/graphql', graphqlHTTP({
 *      schema: schema,
 *      rootValue: root,
 *      graphiql: true,
 *  }));
 * ```
 */
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(port);
console.log('Running a GraphQL API server at http://localhost:3000/graphql');