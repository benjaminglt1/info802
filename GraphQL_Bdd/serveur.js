var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const firebase = require('firebase');

const port = process.env.PORT || 3000;
 
const conf = {
    apiKey: "AIzaSyCoziNM4DIF74O5CTbGlvDArqmVohozOs8",
    authDomain: "baseinfo802.firebaseapp.com",
    databaseURL: "https://baseinfo802-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "baseinfo802"
};

firebase.initializeApp(conf);
var database = firebase.database();

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    type produit {
        id: String
        nom: String
        prix: String
        poid: String
        photo: String
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
        getProduit(id:String!): produit
        getClients: [client]
        getClient(id:String!): client
    }
    type Mutation {
        ajouterProduit(nom:String!,prix:String!,poid:String!,photo:String!): Boolean
        supprimerProduit(id:String!): Boolean
        ajouterClient(nom:String!,prenom:String!,login: String!,mdp: String!,vendeur: Boolean!): Boolean
        supprimerClient(id:String!): Boolean
    }
`);


// The root provides a resolver function for each API endpoint
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
        var newPostKey = firebase.database().ref('/produits').push().key;
        
        var postData = {
            id: newPostKey,
            nom: arg.nom,
            photo: arg.photo,
            poid: arg.poid,
            prix: arg.prix
          };
                
          // Write the new post's data simultaneously in the posts list and the user's post list.
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
                
          // Write the new post's data simultaneously in the posts list and the user's post list.
        var updates = {};
        updates['/utilisateurs/'+newPostKey] = postData;
        
        return firebase.database().ref().update(updates).then(() => {
            return true
        });
    },
    supprimerClient(arg) {
        return firebase.database().ref('/utilisateurs/'+arg.id).remove().then(() => {
            return true
        });
    },
};
 
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(port);
console.log('Running a GraphQL API server at http://localhost:3000/graphql');