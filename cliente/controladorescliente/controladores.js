

//Controlador de la pagina
app.controller('indexController', ['$scope', '$http', 'socket', function ($scope, $http, socket){
	//Variables de instancia logica
	$scope.CONNECTED    = false;
	$scope.USER         = '';
	$scope.ONLINE_USERS = [];
	$scope.mensajes     = [];
	$scope.listaVersus  = [];
	$scope.mensajesChat = '';
	$scope.historiaChat = '';
	$scope.nombreVersus = '';
	$scope.parteEscogida= '';
	$scope.votosparte1  = 0;
	$scope.votosparte2  = 0;

	//Variables de instancia grafica
	$scope.verRegistro = false;
	$scope.verSesion   = false;
    $scope.verMenu     = true;
    $scope.verUsuarios = false;
    $scope.verVotacion = false;
    $scope.verPortada  = true;
    $scope.verInicio   = false;

	//funciones que esperan las respuestas del servidor
	socket.on('ERROR', function(message){
		alert(message.msg);
  	});

  	socket.on('RESPONSE', function(message){
	    if(message.msgType == 'SAVE_USER'){
	    	alert(message.msg);
	    }
	    if(message.msgType == 'LOG_IN'){
	        $scope.CONNECTED   = true;
	        $scope.USER        = message.msg;
	        $scope.verSesion   = !$scope.verSesion;
	        $scope.verMenu     = false;
	        $scope.verUsuarios = true;
	        $scope.verPortada  = false;
            $scope.verInicio   = true;
	        var message = {msgType: 'CONNECTED', msg: message.msg}
	        socket.emit('SOLICITUDE', message);
	    }
	    if(message.msgType == 'ONLINE_USER'){
	    	$scope.ONLINE_USERS.length = 0;  
	    	for(var i = 0; i < message.msg.length; i++){
	    		if($scope.USER != message.msg[i]){
	    			$scope.ONLINE_USERS.push({username: message.msg[i]});
	    		}
	        }
	        var message = {msgType: 'ALL_VERSUS', msg: ''}
	        socket.emit('SOLICITUDE', message); 
	    }
	    if(message.msgType == 'SEND_VERSUS'){
	    	//$scope.listaVersus.length = 0;  
	    	for(var i = 0; i < message.msg.length; i++){
	    		$scope.listaVersus.push(message.msg[i]);
			//
	        } 
	    }
	    if(message.msgType == 'ALL_VOTOS'){
	    	if(message.msg.parte === $scope.nombreVersus.split(' vs ')[0] ){
				$scope.votosparte1=message.msg.votos;
			}
			else{
				$scope.votosparte2=message.msg.votos;
			}
	    }		
	    if(message.msgType == 'HISTORY_MESSAGES'){
	        for(var i = 0; i < message.msg.length; i++){
				$scope.mensajesChat =  $scope.mensajesChat + message.msg[i].emisor+':'+message.msg[i].texto+'\n';   
	        }
	    }
	     if(message.msgType == 'ALL_VERSUS'){
	        $scope.listaVersus.length = 0;  
	    	for(var i = 0; i < message.msg.length; i++){
	    		$scope.listaVersus.push(message.msg[i]);
				//alert(JSON.stringify(message.msg[i]));
	        } 
	    }
	     if(message.msgType == 'SEND_VOTO'){
	    	for(var i = 0; i < message.msg.length; i++){
				//alert(JSON.stringify(message.msg[i]));
				if(message.msg[i].votoescog === $scope.nombreVersus.split(' vs ')[0] ){
					$scope.votosparte1+=1;
				}
				else if(message.msg[i].votoescog === $scope.nombreVersus.split(' vs ')[1] ){
					$scope.votosparte2++;
				}		
	    		//$scope.listaVersus.push(message.msg[i]);
	        } 
	    }		
	    if(message.msgType == 'SEND_MESSAGE'){
	    	var emisor;
			var privateMessage;
			//alert(JSON.stringify(message.msg));
			if(message.msg.autor == $scope.USER){
				emisor         = message.msg.autor;
			    privateMessage = message.msg.note;
			}
			else{
				emisor         = message.msg[0].autor;
			    privateMessage = message.msg[0].note;
			}
				
	        $scope.mensajesChat =  $scope.mensajesChat + emisor+':'+privateMessage+'\n';   
	    }
    });

  	//funciones del cliente
    $scope.registrarUsuario = function(){
    	var message = {};
    	var params  = [];
    	if($scope.modPassword == $scope.modVerPassword){
    		params.push({username: $scope.modUsuario, password: $scope.modPassword});
		    message.msgType = 'SAVE_USER';
		    message.msg = params;
			socket.emit('SOLICITUDE', message);
		    $scope.modUsuario  = '';
			$scope.modPassword = '';
		    $scope.modVerificarPassword  = '';
		    $scope.verRegistro = !$scope.verRegistro;
    	}
    	else{
    		alert('Los password son distinos!');
    	}	
	};

	$scope.iniciarSesion = function(){
		var message = {};
    	var params  = [];
		params.push({username: $scope.modLoginUser, password: $scope.modLoginPass});
		message.msgType = 'LOG_IN';
		message.msg = params;
		socket.emit('SOLICITUDE', message);
	    $scope.modLoginUser  = '';
	    $scope.modLoginPass = '';


    }; 

	$scope.enviarComentario = function(){
		var message = {};
    	var params  = [];
    	params.push({autor: $scope.USER, note: $scope.modMensajeEnviar, versusname: $scope.nombreVersus});
    	message.msgType = 'SEND_MESSAGE';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
        $scope.modMensajeEnviar = '';
  	};  

  	$scope.agregarVoto = function(){
		var message = {};
    	var params  = [];
  		params.push({autor: $scope.USER, votoescog: $scope.parteEscogida});
    	message.msgType = 'SEND_VOTO';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
	    //$scope.listaVersus.push({tarea: $scope.modTarea, done:false});
	    $scope.parteEscogida = '';
    };
	
	$scope.contarVotos = function(parte){
		var message = {};
		message.msgType = 'ALL_VOTOS';
		//alert('en contar votos'+parte);
		message.msg = parte;
		socket.emit('SOLICITUDE', message);
	};

    $scope.versusActuales = function(){ 
	    var count = 0;
		count= $scope.listaVersus.length;
	    // angular.forEach($scope.listaVersus, function(tarea){
	    	// count += 
	    // });
	    return count;
    };

    $scope.actualizarTareas = function(index, namevs){
		$scope.nombreVersus=namevs;
		$scope.mensajesChat='';
		$scope.mostrarHistoria();
		console.log(index);
    };
	
	$scope.agregarVersus = function(){  //agregar al index
		var message = {};
    	var params  = [];
  		params.push({emisor: $scope.USER, ganador:$scope.resultado, name: $scope.modVersus,  namepart1: $scope.modVersus.split(' vs ')[0], namepart2: $scope.modVersus.split(' vs ')[1]});
    	message.msgType = 'SEND_VERSUS';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
	    $scope.modVersus = '';
    };


    //funciones de interfaz grafica
	$scope.getMensaje = function(){
		socket.emit('SOLICITUDE', {msgType: 'getUser', msg: $scope.buscar});
	};

	$scope.mostrarRegistro = function(){

	    if($scope.CONNECTED != true){
	    	$scope.verRegistro = !$scope.verRegistro;
		}
	};

   $scope.mostrarSesion = function(){
	    if($scope.CONNECTED != true){
	      $scope.verSesion = !$scope.verSesion;
	    }
	};

	$scope.mostrarHistoria = function(){
		$scope.historiaChat = '';
		if($scope.nombreVersus === ''){
			$scope.mensajesChat='';
			alert('Seleccione un versus');
		}
		else{
			//alert('pasa por aqui '+ $scope.nombreVersus);
			var message = {msgType: 'HISTORY_MESSAGES', msg: $scope.nombreVersus};
			socket.emit('SOLICITUDE', message);
		}
	};
	
	$scope.mostrarVotacion = function(){
		if($scope.nombreVersus === ''){
			alert('Seleccione un Versus primero');
		}
		else{
			//alert('pasa por aqui '+ $scope.nombreVersus);
			$scope.verVotacion = !$scope.verVotacion;	
			$scope.contarVotos($scope.nombreVersus.split(' vs ')[0]);
			$scope.contarVotos($scope.nombreVersus.split(' vs ')[1]);
			//alert('conto los votos');
		}
	};
	
}]);