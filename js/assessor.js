var Researcher = require( "./researcher.js" );
var Paper = require( "./values/Paper.js" );

var InvalidTypeError = require( "./errors/invalidType" );

var MissingArgument = require( "./errors/missingArgument" );
var isUndefined = require( "lodash/isUndefined" );
var forEach = require( "lodash/forEach" );

var ScoreRating = 9;

//assessments
var assessments = {};
assessments.wordCount = require( "./assessments/countWords.js" );
assessments.urlLength = require( "./assessments/urlIsTooLong.js" );
assessments.fleschReading = require( "./assessments/calculateFleschReading.js" );
assessments.linkCount = require( "./assessments/getLinkStatistics.js" );
assessments.pageTitleKeyword = require( "./assessments/pageTitleKeyword.js" );
assessments.subHeadings = require( "./assessments/matchKeywordInSubheading.js" );
assessments.keywordDensity = require( "./assessments/keywordDensity.js" );
assessments.stopwordKeywordCount = require( "./assessments/stopWordsInKeyword.js" );
assessments.urlStopwords = require( "./assessments/stopWordsInUrl.js" );
assessments.metaDescriptionLength = require( "./assessments/metaDescriptionLength.js" );
assessments.keyphraseSizeCheck = require( "./assessments/keyphraseLength.js" );
assessments.metaDescriptionKeyword = require ( "./assessments/metaDescriptionKeyword.js" );
assessments.imageCount = require( "./assessments/imageCount.js" );
assessments.urlKeyword = require( "./assessments/keywordInUrl.js" );
assessments.firstParagraph = require( "./assessments/firstParagraph.js" );
assessments.pageTitleLength = require( "./assessments/pageTitleLength.js" );

/**
 * Creates the Assessor
 *
 * @param {object} i18n The i18n object used for translations.
 * @constructor
 */
var Assessor = function( i18n ) {
	this.setI18n( i18n );
	this.taskList = [];
};

/**
 * Checks if the argument is a valid paper.
 * @param paper The paper to be used for the assessments
 * @throws {InvalidTypeError} Parameter needs to be an instance of the Paper object.
 */
Assessor.prototype.verifyPaper = function( paper ) {
	if ( !( paper instanceof Paper ) ) {
		throw new InvalidTypeError( "The assessor requires an Paper object." );
	}
};

/**
 * Checks if the i18n object is defined and sets it.
 * @param {object} i18n The i18n object used for translations.
 * @throws {MissingArgument} Parameter needs to be a valid i18n object.
 */
Assessor.prototype.setI18n = function( i18n ) {
	if ( isUndefined( i18n ) ) {
		throw new MissingArgument( "The assessor requires an i18n object." );
	}
	this.i18n = i18n;
};

/**
 * Gets all available assessments.
 * @returns {object} assessment
 */
Assessor.prototype.getAvailableAssessments = function() {
	return assessments;
};

/**
 * Runs the researches defined in the tasklist or the default researches.
 * @param {Paper} paper The paper to run assessments on.
 */
Assessor.prototype.assess = function( paper ) {
	this.verifyPaper( paper );
	var researcher = new Researcher( paper );

	var assessments = this.getAvailableAssessments();
	this.results = [];
	forEach( assessments, function( assessment, assessmentName ) {
		this.results.push(
			{
				name: assessmentName,
				result: assessment( paper, researcher, this.i18n )
			}
		);
	}.bind( this ) );
};

/**
 * Filters out all assessmentresults that have no score and no text.
 * @returns {Array}
 */
Assessor.prototype.getValidResults = function() {
	var validResults = [];
	forEach( this.results, function( assessmentResults ) {
		if ( !this.isValidResult( assessmentResults.result ) ) {
			return;
		}
		validResults.push( assessmentResults );
	}.bind( this ) );
	return validResults;
};

/**
 * Returns if an assessmentResult is valid.
 * @param {object} assessmentResult The assessmentResult to validate.
 * @returns {boolean} whether or not the result is valid.
 */
Assessor.prototype.isValidResult = function( assessmentResult ) {
	return assessmentResult.hasScore() && assessmentResult.hasText();
};

/**
 * Returns the overallscore. Calculates the totalscore by adding all scores and dividing these
 * by the number of results times the ScoreRating.
 *
 * @returns {number} The overallscore
 */
Assessor.prototype.calculateOverallScore  = function() {
	var results = this.getValidResults();
	var totalScore = 0;
	forEach( results, function( assessmentResult ) {
		totalScore += assessmentResult.result.getScore();
	} );
	return Math.round( totalScore / ( results.length * ScoreRating ) * 100 );
};

module.exports = Assessor;