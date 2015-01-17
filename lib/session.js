
/*      @module exhibition.session
    Generates, parses and examines unique session tokens. Contains a large random hash portion and a
    creation timestamp.
*/

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

/**     @property/Function parse
    Extract the creation timestamp from a session string.
*/
function parse (id) {
    idBuf = new Buffer (id, 'base64');
    return {
        created:        new Date (1000 * idBuf.readUInt32LE (29))
    };
}

module.exports.craft = craft;
module.exports.parse = parse;
