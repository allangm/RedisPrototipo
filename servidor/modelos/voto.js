var nohm = require('nohm').Nohm;
//modelo usuario  
module.exports = nohm.model('Voto', {
    properties:{
    	username:{
        type: 'string',
      },
      parte: {
        type: 'string'
      }
    }
});
