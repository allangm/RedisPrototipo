var nohm = require('nohm').Nohm;
//modelo de notas
module.exports = nohm.model('Comentario', {
    properties:{
    	autor:{
        type: 'string'
      },
      note:{
        type: 'string'
      },
      versus:{
        type: 'string'
      }
    }
});