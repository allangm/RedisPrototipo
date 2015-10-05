var nohm             = require('nohm').Nohm,
	user             = require('../modelos/usuario'),
	comment          = require('../modelos/comentario'),
	votoCount        = require('../modelos/voto'),
	redis            = require('redis').createClient(),
	versus           = require('../modelos/versus')
	db               = require('./conexion');

//guardar un nuevo usuario en la bd
module.exports.saveUser = function(socket, usernam, pass){
	redis.select(db.database());
	nohm.setClient(redis);
	var user = nohm.factory('User');
	user.p({ username: usernam, password: pass});

	user.save(function(err){
	    if(err === 'invalid'){
	    	console.log('Properties were invalid: ', user.errors);
	    	socket.emit('ERROR', {msg: "Username are invalid"});
	    }
	    else if(err){
	        console.log(err); 
	        socket.emit('ERROR', {msg: "Database connexion refused"});
	    } 
	    else{
	      	console.log('Saved user into redis database!');
			console.log(user.allProperties());
	      	var message = {msgType: 'SAVE_USER', msg: 'Ha sido registrado de forma exitosa'}
	      	socket.emit('RESPONSE', message);
	    }
	});
};
//validar usuario en la bd
module.exports.logIn = function(socket, username, pass){
	redis.select(db.database());
	nohm.setClient(redis);
	user.find(function(err, ids){
	    if(err){
	    	return next(err);
	    }
	    var validUser = false;
	    var len = ids.length;
	    var count = 0;
	    if(len === 0){
	      console.log(len);
	    }
	    ids.forEach(function(id){
	    var userFind = nohm.factory('User');
	    userFind.load(id, function(err, props){
		    if(err){
		        return next(err);
		    }
		    if((props.username === username) && (props.password === pass)){
		        validUser = true;
		    }  
		    if(++count === len){
		    	if(validUser === true){
		    	    socket.emit('RESPONSE', {msgType: 'LOG_IN', msg: username});
		    	}
		        else{
		        	socket.emit('ERROR', {msg: "El usuario no esta registrado!"});
		        }
	    	}
	      });
	    });
    });
};
//obtener la historia de mensajes de la bd
module.exports.historyComments = function(socket, versusname){
	redis.select(db.database());
	nohm.setClient(redis);
	comment.find(function(err, ids){
	    if(err){
	    	return next(err);
	    }
	    var allComments = [];
	    var len = ids.length;
	    var count = 0;
	    if(len === 0){
	      console.log(len);
	    }
	    ids.forEach(function(id){
	    var commentsFind = nohm.factory('Comentario');
	    commentsFind.load(id, function(err, props){
		    if(err){
		        return next(err);
		    }
		    if(props.versus === versusname){
		        allComments.push({emisor: props.autor, texto: props.note});// falta cambiar esta linea
		    }  
		    if(++count === len){
		    	if(allComments.length !== 0){
		    	    socket.emit('RESPONSE', {msgType: 'HISTORY_MESSAGES', msg: allComments});
		    	}
		        else{
		        	console.log('No hay comentarios para este enfrentamiento');
		        }
	    	}
	      });
	    });
    });
};
//guarda un nuevo voto en la base de datos
module.exports.saveComment = function(socket, emisor, versusname, comment){

		redis.select(db.database());
		nohm.setClient(redis);
		var comentario = nohm.factory('Comentario');
		comentario.p({autor: emisor, note: comment, versus: versusname}); //cambiar esto

		comentario.save(function(err){
		    if(err === 'invalid'){
		    	console.log('Properties were invalid: ', message.errors);
		    	socket.emit('ERROR', {msg: "Comment are invalid"});
		    } 
		    else if(err){
		        console.log(err); 
		        socket.emit('ERROR', {msg: "Database connexion refused"});
		    } 
		    else{
		      	console.log('Comentario guardado en Redis!');
				console.log(comentario.allProperties());
				socket.emit('RESPONSE', {msgType: 'SEND_MESSAGE', msg: comentario.allProperties()});
		    }
		});
};

//guardar un nuevo enfrentamiento en la base de datos
module.exports.saveVoto = function(socket, user, votoselec){
	redis.select(db.database());
	nohm.setClient(redis);
	var voto = nohm.factory('Voto');
	voto.p({ username: user, parte: votoselec});

	voto.save(function(err){
	    if(err === 'invalid'){
	    	console.log('Properties were invalid: ', note.errors);
	    	socket.emit('ERROR', {msg: "vote are invalid"});
	    } 
	    else if(err){
	        console.log(err); 
	        socket.emit('ERROR', {msg: "Database connexion refused"});
	    } 
	    else{
	    	console.log(voto.allProperties());
	      	console.log('voto salvado en redis database!');
	    }
	});
};

//guardar un nuevo enfrentamiento en la base de datos
module.exports.saveVersus = function(socket, creador, involucrados, win){
	redis.select(db.database());
	nohm.setClient(redis);
	var vers = nohm.factory('Versus');
	vers.p({ nombre: involucrados[0].nombre, parte1: involucrados[0].parte1, parte2: involucrados[0].parte2, ganador: win, usuario:creador });

	vers.save(function(err){
	    if(err === 'invalid'){
	    	console.log('Properties were invalid: ', note.errors);
	    	socket.emit('ERROR', {msg: "Versus are invalid"});
	    } 
	    else if(err){
	        console.log(err); 
	        socket.emit('ERROR', {msg: "Database connexion refused"});
	    } 
	    else{
	    	console.log(vers.allProperties());
	      	console.log('Salvado en Redis!');
			socket.emit('RESPONSE', {msgType: "SEND_VERSUS", msg:vers.allProperties()});
	    }
	});
};

// se encarga de contar cuantos votos tiene una parte
module.exports.contarVotos = function(socket, parteSite){ //conectar
	redis.select(db.database());
	nohm.setClient(redis);
	votoCount.find(function(err, ids){
	    if(err){
	    	return next(err);
	    }
	    var allvotos = [];
	    var len = ids.length;
	    var count = 0;
	    if(len === 0){
	      console.log(len);
	    }
	    ids.forEach(function(id){
	    var votosFind = nohm.factory('Voto');
	    votosFind.load(id, function(err, props){
		    if(err){
		        return next(err);
		    }
		    if(props.parte === parteSite){
		        allvotos.push({username: props.username, parte: props.parte}); 
		    }
		    if(++count === len){
		    	if(allvotos.length !== 0){
					console.log('los votos son'+allvotos.length);
		    	    socket.emit('RESPONSE', {msgType: 'ALL_VOTOS', msg: {votos: allvotos.length, parte: parteSite}});
		    	}
		        else{
		        	console.log('Does not exist votes in the database for this user');
		        }
	    	}
	      });
	    });
    });
};

module.exports.todosVersus = function(socket){
	redis.select(db.database());
	nohm.setClient(redis);
	versus.find(function(err, ids){
	    if(err){
	    	return next(err);
	    }
	    var allversus = [];
	    var len = ids.length;
	    var count = 0;
	    if(len === 0){
	      console.log(len);
	    }
	    ids.forEach(function(id){
	    var versusFind = nohm.factory('Versus');
	    versusFind.load(id, function(err, props){
		    if(err){
		        return next(err);
		    }
		    if(props.nombre.length > 0){
		        allversus.push({name: props.nombre, part1: props.parte1, part2: props.parte2, ganador:props.ganador, emisor:props.usuario }); 
				console.log(props);
		    }
		    if(++count === len){
		    	if(allversus.length !== 0){
		    	    socket.emit('RESPONSE', {msgType: 'ALL_VERSUS', msg: allversus});
		    	}
		        else{
		        	console.log('Does not exist notes in the database for this user');
		        }
	    	}
	      });
	    });
    });
}