var user       = require('../modelos/usuario'),
	dataAccess = require('../accesoDatos/persistencia');

//enviar usuario, password a la capa de acceso a datos para guardar
module.exports.saveUser = function(socket, message){
	var user; 
	var pass;
	for(var i = 0; i < message.msg.length; i++){
	    user = message.msg[i].username;
	    pass = message.msg[i].password;
	}
	dataAccess.saveUser(socket, user, pass);
};
//enviar usuario a la capa de acceso a datos para validar
module.exports.logIn = function(socket, message){
	var user;
	var pass;
	for(var i = 0; i < message.msg.length; i++){
	    user = message.msg[i].username;
	    pass = message.msg[i].password;
	}
	dataAccess.logIn(socket, user, pass);
};

//obtener los botos de una parte en un versus
module.exports.allVotos = function(socket, part){
	console.log('en server'+part.msg);
	dataAccess.contarVotos(socket, part.msg);
};

module.exports.allVersus = function(socket){
	dataAccess.todosVersus(socket);
};


//obtener la historia de los comentarios
module.exports.allComments = function(socket, message){
	var versusnam = message.msg;
	dataAccess.historyComments(socket, versusnam);
};

//enviar el mensaje a la capa de acceso a datos
module.exports.sendVoto = function(socket, message){
	var autor;
	var partvoto;
	for(var i = 0; i < message.msg.length; i++){
		autor = message.msg[i].autor;
	    partvoto = message.msg[i].votoescog;
	}
	dataAccess.saveVoto(socket, autor, partvoto);
	socket.broadcast.emit('RESPONSE', message);
};
/*
	*Send message from dataaccess
*/
module.exports.sendComment = function(socket, message){
	var enfrentamiento;
	var emisor;
	var privateMessage;
	for(var i = 0; i < message.msg.length; i++){
		emisor         = message.msg[i].autor;
	    privateMessage = message.msg[i].note;
		enfrentamiento = message.msg[i].versusname;
	}
	dataAccess.saveComment(socket, emisor, enfrentamiento, privateMessage);
	socket.broadcast.emit('RESPONSE', message);
};
// envia la informacion de un enfrentamiento para almacenar en la base de datos
module.exports.sendVersus = function(socket, message){
	var ganadorActual;
	var creadorVs;
	var partesNames=[];
	for(var i = 0; i < message.msg.length; i++){
		creadorVs         = message.msg[i].emisor;
	    ganadorActual = message.msg[i].ganador;
		partesNames.push({nombre:message.msg[i].name, parte1: message.msg[i].namepart1, parte2: message.msg[i].namepart2});
	}
	
	dataAccess.saveVersus(socket, creadorVs, partesNames , ganadorActual);
};