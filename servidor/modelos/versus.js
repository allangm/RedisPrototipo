var nohm = require('nohm').Nohm;
//modelo mensajes de usuario
module.exports = nohm.model('Versus', {
    properties:{
    	nombre:{
        type: 'string'
      },
      parte1:{
        type: 'string'
      },
      parte2:{
        type: 'string'
      },
	  ganador:{
        type: 'string'
      },
	  usuario:{
        type: 'string'
      }
    }
});