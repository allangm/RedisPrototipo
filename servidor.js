//dependencias de la aplicacion
require('./servidor/modelos/mensaje');
var express       = require("express"),
    app           = express(),
    server        = require('http').createServer(app),
    bodyParser    = require('body-parser'),
    controller    = require('./servidor/controladores/controladores.js'),
    io            = require('socket.io').listen(server);  
//Variablees globales
//lista de clientes conectados
PLAYERS = [];

app.use(bodyParser.urlencoded({ 
	extended: false 
}));
app.use(bodyParser.json());

//recibe una solicitud y envia la pagina por defecto como respuesta
app.get('/', function(req, res){
	res.sendFile(__dirname + '/cliente/vistas/index.html');
});

app.use('/', express.static(__dirname + '/cliente/'));

server.listen(process.env.PORT || 8080, function(){
	console.log('Listening at port 8080...');
})

//manejo de peticiones por parte de los clientes
io.sockets.on('connection', function(socket){	
	socket.on('SOLICITUDE', function(message){

		if(message.msgType == 'CONNECTED'){
           PLAYERS.push(message.msg);
           socket.username = message.msg;
           console.log('Online username are:' + PLAYERS);
           io.sockets.emit('RESPONSE', {msgType: 'ONLINE_USER', msg: PLAYERS});       
        }
        if(message.msgType == 'SAVE_USER'){
            controller.saveUser(socket, message);
        }
        if(message.msgType == 'LOG_IN'){
           controller.logIn(socket, message);
        }
        if(message.msgType == 'SEND_MESSAGE'){
           controller.sendComment(socket, message);
        }
        if(message.msgType == 'SEND_VOTO'){
           controller.sendVoto(socket, message);
           io.sockets.emit('RESPONSE', message);       
        }
        if(message.msgType == 'HISTORY_MESSAGES'){
           controller.allComments(socket, message);
        }
        if(message.msgType == 'ALL_VOTOS'){
           controller.allVotos(socket, message);
        }
		if(message.msgType == 'SEND_VERSUS'){
			controller.sendVersus(socket, message);
			io.sockets.emit('RESPONSE', message);       
		}
		if(message.msgType == 'ALL_VERSUS'){
			controller.allVersus(socket);
		}		
	});
	
	socket.on('disconnect', function(code, reason){
		if(!socket.username){
			return;
		}
		if(PLAYERS.indexOf(socket.username) > -1){
			PLAYERS.splice(PLAYERS.indexOf(socket.username), 1);
		}
		if(PLAYERS.length === 0){
			console.log('Nadie esta conectado!');	
		}
		else{
			console.log('Online username are:' + PLAYERS);
		}
		io.sockets.emit('RESPONSE', {msgType: 'ONLINE_USER', msg: PLAYERS});  
	
	});	
});
