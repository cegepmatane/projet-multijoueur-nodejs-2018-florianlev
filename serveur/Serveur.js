var http = require('http');
var io = require('socket.io');
Joueur = require('./Joueur.js');

var nombreClients;
var listeConnexion = [];
var listeJoueur = [];
var socket;
var debutPartie;
var partieEstCommencer;

function initialiser() {
    console.log("initialiser()");
    debutPartie = false;
    nombreClients = 0;
    var server = http.createServer(function (req, res) {
        // Send HTML headers and message
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Hello Socket Lover!</h1>');
    });

    server.listen(2000)

    var socket = io.listen(server);
    socket.on('connection', gererConnexion);
    setInterval(mettreAJourPosition, 1000 / 25);

}

console.log("Server started");


function gererConnexion(connexion) {
    nombreClients++;
    connexion.id = nombreClients;
    console.log("ID client : " + connexion.id);

    listeConnexion[connexion.id] = connexion;

    var joueur = new Joueur(connexion.id);

    listeJoueur[connexion.id] = joueur;

    for (idConnexion = 0; idConnexion < listeConnexion.length; idConnexion++) {
        if (listeConnexion[idConnexion]) {
            listeJoueurJSON = recupererListeJoueurJSON();
            listeConnexion[idConnexion].emit('connexionJoueur', listeJoueurJSON);

            //listeConnexion[idConnexion].emit('nombreJoueurPret', debutPartie);
            
        }
    }
    
    console.log("nombreJoueur" + nombreClients);

    connexion.on('toucheEnfoncee', gererToucheEnfoncee);
    connexion.on('disconnect', gererDeconnexionClient);
    connexion.on('etatConnexion', recevoirEtatConnexion);
    connexion.on('joueurEstPret', gererDebut);

}


function gererDebut(evenement)
{
    console.log("Un joueur est pret a jouer!");
    listeConnexion[this.id].emit('positionInitiale', {x : joueur.x, y: joueur.y});


    console.log(evenement);
    if(nombreClients >= 2 && evenement)
    {
        console.log("debut");
        debutPartie = true;
        //gererDebutDePartie(connexion);
        setVitesseListeJoueur(10);
        partieEstCommencer = true;
        for (var idConnexion in listeConnexion) {
            
            listeConnexion[idConnexion].emit('partieEstCommencer', partieEstCommencer);
        }
        
    } 
}

function setVitesseListeJoueur(vitesse)
{
    console.log("setVitesse");
    for (var idJoueur in listeJoueur) {
        console.log(listeJoueur[idJoueur].id);
        listeJoueur[idJoueur].maxVitesse = vitesse;
    } 
}

function recevoirEtatConnexion(estConnecter)
{
    listeJoueur[this.id].estCreer = estConnecter;
}

function gererDeconnexionClient(evenement) {
    console.log("gererDeconnexion" + this.id);
    var joueurDeconnecter = listeJoueur[this.id];
    listeConnexion[this.id].emit('logout', joueurDeconnecter);
    delete listeConnexion[this.id];
    delete listeJoueur[this.id];

}

function gererToucheEnfoncee(evenement) {
    
    listeJoueur[this.id].etatDirectionCourant = evenement.directionCourante;
        
}
function recupererListeJoueurJSON()
{
    var listeJoueurActif = [];
    for (var idJoueur in listeJoueur) {
        if (listeJoueur[idJoueur]) 
            listeJoueurActif.push(listeJoueur[idJoueur]);     
    }
    return JSON.stringify(listeJoueurActif);

}

function mettreAJourPosition() {
    var listeJoueurActif = [];
    for (var idJoueur in listeJoueur) {
        if (listeJoueur[idJoueur]) {
            joueur = listeJoueur[idJoueur];
            joueur.mettreAjourPosition();
            listeJoueurActif.push(joueur);     
        }
    }
    var listeJoueursJson = JSON.stringify(listeJoueurActif);
   
    //console.log(listeJoueursJson);
    for (var idConnexion in listeConnexion) {
        if (listeConnexion[idConnexion]) {
            listeConnexion[idConnexion].emit('nouvellesPositions', listeJoueursJson);
        }
    }
}

initialiser();