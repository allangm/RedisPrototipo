

//Controlador de la pagina
app.controller('indexController3', ['$scope', '$http', 'socket', function ($scope, $http, socket){
	//Variables de instancia logica
	$scope.CONNECTED    = false;
	$scope.USER         = 'por el momento';
	$scope.ONLINE_USERS = [];
	$scope.mensajes     = [];
	$scope.listaVersus  = [];
	$scope.mensajesChat = '';
	$scope.historiaChat = '';
	$scope.nombreVersus = '';

	//Variables de instancia grafica
	$scope.verRegistro = false;
	$scope.verSesion   = false;
    $scope.verMenu     = true;
    $scope.verUsuarios = false;
    $scope.verHistoria = false;
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
	        var message = {msgType: 'AL_VOTOS', msg: $scope.USER}
	        socket.emit('SOLICITUDE', message); 
	    }
	    if(message.msgType == 'SEND_VERSUS'){
	    	//$scope.listaVersus.length = 0;  
	    	for(var i = 0; i < message.msg.length; i++){
	    		$scope.listaVersus.push(message.msg[i]);
	        } 
	    }
	    if(message.msgType == 'HISTORY_MESSAGES'){
	        for(var i = 0; i < message.msg.length; i++){
			    $scope.historiaChat =  $scope.historiaChat+message.msg[i].emisor+':'+message.msg[i].texto+'\n';  
	        }
	    }
	     if(message.msgType == 'ALL_VERSUS'){
	        $scope.listaVersus.length = 0;  
	    	for(var i = 0; i < message.msg.length; i++){
	    		$scope.listaVersus.push(message.msg[i]);
	        } 
	    }
	    if(message.msgType == 'SEND_MESSAGE'){
	    	var emisor;
			var privateMessage;
			for(var i = 0; i < message.msg.length; i++){
				emisor         = message.msg[i].emisor;
			    privateMessage = message.msg[i].texto;
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

	$scope.enviarComentario = function(){//agregar al index
		var message = {};
    	var params  = [];
    	params.push({emisor: $scope.USER, texto: $scope.modMensajeEnviar, versusname=$scope.nombreVersus});
    	message.msgType = 'SEND_MESSAGE';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
        $scope.modMensajeEnviar = '';
  	};  

  	$scope.agregarVoto = function(){  //agregar al index
		var message = {};
    	var params  = [];
  		params.push({autor: $scope.USER, votoescog: $scope.modTarea});
    	message.msgType = 'SEND_VOTO';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
	    //$scope.listaVersus.push({tarea: $scope.modTarea, done:false});
	    $scope.modTarea = '';
    };

    $scope.versusActuales = function(){ //probar en index
	    var count = 0;
		count= $scope.listaVersus.length;
	    // angular.forEach($scope.listaVersus, function(tarea){
	    	// count += 
	    // });
	    return count;
    };

    $scope.actualizarTareas = function(index){
	   console.log(index);
    };
	
	$scope.agregarVersus = function(){  //agregar al index
		var message = {};
    	var params  = [];
  		params.push({emisor: $scope.USER, ganador:$scope.resultado, name: $scope.nombreVersus,  namepart1: $scope.nombreVersus.split(' vs ')[0], namepart2: $scope.nombreVersus.split(' vs ')[2]});
    	message.msgType = 'SEND_VERSUS';
		message.msg = params;
        socket.emit('SOLICITUDE', message);
	    //$scope.listaVersus.push({tarea: $scope.modTarea, done:false});
	    $scope.modTarea = '';
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
		var message = {msgType: 'HISTORY_MESSAGES', msg: $scope.nombreVersus};
	    socket.emit('SOLICITUDE', message);
	    $scope.verHistoria = !$scope.verHistoria;
	};
	
}]);