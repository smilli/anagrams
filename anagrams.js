/**
 * Generate pronounceable anagrams.
 * @constructor
 * @param {integer} n The order of the character model.
 * @param {integer} cpd The conditional prob distribution for the char model.
 */
function AnagramGenerator(n, cpd) {
  this.order = n;
  this.cpd = cpd;
  this.PAD_SYMBOL = '_';
  this.MIN_LOG_PROB = -5.654992310486769;
};

AnagramGenerator.prototype._padding_string = function() {
  var str = '';
  for (i = 0; i < this.order - 1; i++) {
    str += this.PAD_SYMBOL;
  }
  return str;
}

AnagramGenerator.prototype._generate = function(
    prefix, startTime, timeout, minWordLen,
    generatedWords, letters, logprob) {
  var condition = prefix.substring(
      prefix.length - this.order + 1, prefix.length);
  var probs = this.cpd[condition];
  if (letters.length == 0) {
    if (probs[this.PAD_SYMBOL] > this.MIN_LOG_PROB
        && prefix.length >= minWordLen + this.order - 1) {
      anagram = '';
      for (var i = 0; i < generatedWords.length; i++) {
        anagram += generatedWords[i].slice(this.order - 1) + ' ';
      }
      anagram += prefix.slice(this.order - 1);
      return [[anagram, logprob + probs[this.PAD_SYMBOL]]];
    }
    return [];
  }
  if (letters.length == 1 && letters[0] == this.PAD_SYMBOL) {
    return [];
  }
  var anagrams = [];
  var usedLetters = {};
  for (var i = 0; i < letters.length; i++) {
    if ((new Date().getTime() - startTime)/1000 >= timeout) {
      return anagrams;
    }
    var letter = letters[i];
    if (!(letter in usedLetters) && (letter in probs)) {
      var letter_prob = probs[letter];
      usedLetters[letter] = letter_prob;
      if (letter == this.PAD_SYMBOL) {
          if (prefix.length >= minWordLen + this.order - 1) {
            var new_anagrams = this._generate(
              this._padding_string(),
              startTime,
              timeout,
              minWordLen,
              generatedWords.concat([prefix]),
              letters.slice(0, i).concat(letters.slice(i + 1)),
              logprob + letter_prob);
            anagrams = anagrams.concat(new_anagrams);
          }
      } else if (prefix.length < this.order
          || letter_prob > this.MIN_LOG_PROB) {
        var new_anagrams = this._generate(
          prefix + letter,
          startTime,
          timeout,
          minWordLen,
          generatedWords,
          letters.slice(0, i).concat(letters.slice(i + 1)),
          logprob + letter_prob);
        anagrams = anagrams.concat(new_anagrams);
      }
    }
  }
  return anagrams;
}

/**
 * Generate anagrams of given phrase.
 * @param {string} phrase The phrase to generate anagrams of.
 * @param {integer} minWordLen The minimum length of each word in generated
 * anagram.
 * @param {integer} limit The number of anagrams to return.
 * @param {timeout} timeout Seconds to timeout and return after.
 * @returns {string[]} Anagrams sorted in descending order of pronounceability.
 */
AnagramGenerator.prototype.generate = function(
    phrase, minWordLen, limit, timeout) {
  var letters = phrase.toLowerCase().replace(/\s+/g, this.PAD_SYMBOL).split('');
  var prefix = this._padding_string();
  var startTime = new Date().getTime();
  var anagrams = this._generate(
      prefix, startTime, timeout, minWordLen, [], letters, 0);
  var anagrams = anagrams.sort(function(a1, a2) {
    return -(a1[1] - a2[1]);
  });
  var topAnagrams = []
  var i = 0;
  while (i < limit && i < anagrams.length) {
    if (anagrams[i][0] !== phrase) {
      topAnagrams.push(anagrams[i][0]);
    }
    i++;
  }
  return topAnagrams;
}
