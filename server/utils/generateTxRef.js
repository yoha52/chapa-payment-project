const crypto = require('crypto');
function generateTxRef(){
    return 'tx-' + crypto.randomBytes(8).toString('hex');
}
module.exports= generateTxRef;