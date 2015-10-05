var nohm = require('nohm').Nohm;
//modelo usuario  
module.exports = nohm.model('User', {
    properties:{
    	username:{
        type: 'string',
        unique: true
      },
      password: {
        type: 'string'
      }
    }
});



