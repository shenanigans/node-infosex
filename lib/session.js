
var crypto = require ('crypto');

/*      @module exhibition.session
    Generates, parses and examines unique session tokens. Contains a large random hash portion and a
    creation timestamp.
@property/Number domesticationLength
    The officially supported length for "domestication cookies". To provide secondary secure to
    same-origin requests, the full session key should be written to an `HttpOnly` cookie while the
    leading characters are copied to an alternate cookie accessible to the browser's javascript
    context. Priveleged account activities should always be accompanied by this prefix cookie to
    confirm same-origin access is enabled on the client.
*/
var domesticationLength = module.exports.domesticationLength = 18;
module.exports.length = module.exports.keyLength = 44;


/**     @property/Function craft
    Create a new UID string.
@callback
    @argument/String id
*/
function craft (callback) {
    crypto.pseudoRandomBytes (30, function (err, rand) {
        if (err)
            return craftSession (callback); // due to weak rng support in every OS other than BSD

        var sess = new Buffer (33);
        rand.copy (sess, 0);

        // timestamp
        sess.writeUInt32LE (Math.floor((new Date()).getTime() / 1000), 29, true);

        // convert to string
        var sessStr = sess
         .toString ('base64')
         .replace (/\+/g, '-')
         .replace (/\//g, '_')
         ;
        var domesticStr = sess
         .toString ('base64', 0, domesticationLength)
         .replace (/\+/g, '-')
         .replace (/\//g, '_')
         ;

        callback (sessStr, domesticStr);
    });
};
module.exports.craft = craft;

/**     @property/Function parse
    Extract the creation timestamp from a session string.
*/
function parse (id) {
    if (id.length != 44)
        return { created:undefined, domesticate:undefined };
    idBuf = new Buffer (id.replace (/-/g, '+').replace (/_/g, '/'), 'base64');
    return {
        created:        new Date (1000 * idBuf.readUInt32LE (29)),
        domesticate:    idBuf.toString ('base64', 0, domesticationLength)
    };
}
module.exports.parse = parse;
