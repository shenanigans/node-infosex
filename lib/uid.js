
/*      @module exhibition.uid
    Generates, parses and examines unique identifiers. An **infosex** id is a 28-character base64
    string representing a random hash, a randomly-seeded sequential count byte, a timestamp, and a
    state flag indicating whether an id is "temporary". In Model applications, "temporary"
    **infosex** ids are used to indicate that a resource is newly created and does not exist on the
    server yet.

    **infosex** ids are cryptographically strong to 88 bits in the high-order portion. They are
    never sequential. They are not guaranteed to be unique across multiple processes and machines,
    however, there is only a 1 nanosecond window in which a physical processor can generate a
    colliding key. There is a 1ms window in which multiple machines may produce colliding keys,
    with a probability of one against two to the ninety sixth power per attempt.
*/

var crypto = require ('crypto');
var safety = crypto.randomBytes(1)[0];
module.exports.length = module.exports.keyLength = 28;

/**     @property/Function craft
    Create a new UID string.
@callback
    @argument/String id
*/
function craft (callback) {
    crypto.pseudoRandomBytes (11, function (err, rand) {
        if (err)
            return craft (callback); // due to weak rng support in every OS other than BSD

        var uid = new Buffer (21);
        rand.copy (uid, 0)

        // mark this id as not temporary
        uid[15] = 0;

        // timeestamp
        uid.writeUInt32LE (Math.floor((new Date()).getTime() / 1000), 16, true);

        // hr timestamp
        uid.writeUInt32LE (process.hrtime()[1], 11, true);

        // safety counter
        uid[20] = ++safety;

        callback (uid.toString ('base64'));
    });
};
module.exports.craft = craft;

/**     @property/Function craftTemporary
    Create a new temporary UID string.
@callback
    @argument/String id
*/
function craftTemporary (callback) {
    crypto.pseudoRandomBytes (11, function (err, rand) {
        if (err)
            return temporary (callback); // due to weak rng support in every OS other than BSD

        var uid = new Buffer (21);
        rand.copy (uid, 0)

        // mark this id as temporary
        uid[15] = 0x01;

        // timeestamp
        uid.writeUInt32LE (Math.floor((new Date()).getTime() / 1000), 16, true);

        // hr fuzz
        uid.writeUInt32LE (process.hrtime()[1], 11, true);

        // safety counter
        uid[20] = ++safety;

        callback (uid.toString ('base64'));
    });
};
module.exports.craftTemporary = craftTemporary;

/**     @property/Function parse
    Extract the creation timestamp and `temporary` flag from a UID string.
*/
function parse (id) {
    id = new Buffer (id, 'base64');
    return {
        isTemporary:    Boolean (id[15] & 0x01),
        created:        new Date (1000 * id.readUInt32LE (16))
    };
}
module.exports.parse = parse;
