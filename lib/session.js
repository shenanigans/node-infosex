
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
module.exports.domesticationLength = 16;


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
        sess = sess.toString ('base64');

        callback (sess);
    });
};
module.exports.craft = craft;

/**     @property/Function parse
    Extract the creation timestamp from a session string.
*/
function parse (id) {
    idBuf = new Buffer (id, 'base64');
    return {
        created:        new Date (1000 * idBuf.readUInt32LE (29))
    };
}
module.exports.parse = parse;
