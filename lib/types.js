/**
 * @typedef {Object} Stage1Metadata
 * @property {number} sentenceCount
 * @property {number} burstiness
 * @property {number} averageSentenceLength
 * @property {string[]} repeatedStarts
 * @property {string[]} frequentWords
 * @property {number} passiveSentenceCount
 * @property {string[]} formalTransitionsFound
 * @property {number} hedgingPhraseCount
 */

/**
 * @typedef {Object} Stage1Result
 * @property {string} cleanedText
 * @property {Stage1Metadata} metadata
 */

/**
 * @typedef {Object} HumanizeRequest
 * @property {string} text
 */

/**
 * @typedef {Object} HumanizeResponse
 * @property {boolean} success
 * @property {string} [originalText]
 * @property {string} [humanizedText]
 * @property {Stage1Metadata} [metadata]
 * @property {string} [error]
 */
