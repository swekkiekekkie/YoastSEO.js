var forEach = require( "lodash/forEach" );

/**
 * Checks if the participles make the sentence part passive.
 *
 * @param {Array} participles A list of participles.
 * @returns {boolean} Returns true if the sentence part is passive.
 */
module.exports =  function( participles ) {
	var passive = false;
	forEach( participles, function( participle ) {
		if ( participle.determinesSentencePartIsPassive() ) {
			passive = true;
			return;
		}
	} );
	return passive;
};
