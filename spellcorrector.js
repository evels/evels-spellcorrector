/* CREDITS: 

 SpellCorrector
 Author: Eveleen Sung (eveleensung@gmail.com)
 June 2016

================= ================= */

/* PROBLEM: 

# Word Correction

Write a program in JavaScript that reads a large list of English words (e.g. from /usr/share/dict/words on a unix system) into memory, and then reads words from stdin, and prints either the best spelling correction, or "NO CORRECTION" if no suitable correction can be found.

The program should print "> " as a prompt before reading each word, and should loop until killed.

For example:

    $node ./spellcorrecter.js
    > sheeeeep
    sheep
    > CUNsperrICY
    conspiracy
    > sheeple
    NO CORRECTION

The class of spelling mistakes to be corrected is as follows:

1. Case (upper/lower) errors `inSIDE -> inside`
2. Repeated letters `jjoobbb -> job`
3. Incorrect vowels `weke -> wake`
4. Any combination of the above types of errors `CUNsperrICY -> conspiracy`


Your solution should be faster than O(n) per word checked, where n is the length of the dictionary. That is to say, you can't scan the dictionary every time you want to spellcheck a word.

If there are many possible corrections of an input word, your program can choose one in any way you like, however your results *must* match the examples above (e.g. "sheeeeep" should return "sheep" and not "shap").

## Incorrect Word Generator

Write a second program that generates words with spelling mistakes of the above form, starting with correctly spelled English words. Pipe its output into the first program and verify that there are no occurrences of "NO CORRECTION" in the output.

================= =================  */ 

/* HOW TO USE:  

To run: 

$ node spellchecker.js words.txt
> [type in input]

To test:

$ node spellchecker.js words.txt
> run test

================= ================= */

(function() {
	var fs = require('fs');
	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	var vowels = ['a', 'e', 'i', 'o', 'u'];
	var dictionary = {};

	//make sure words are being imported
	if (process.argv.length < 3) {
		console.log('Usage: node ' + process.argv[1] + ' FILENAME');
		process.exit(1);
	}

	//read file
	fs.readFile(process.argv[2], 'utf8', function(err, data) {
		if (err) throw err;
		var words = data.split(/\r?\n/);
		words.forEach( word => addToTrie(dictionary, word));
		promptForWord();
	});


	function addToTrie(node, word) {
		if (!word.length) {
			node.complete = true;
			return;
		}
		var firstLetter = word.charAt(0);
		var remainder = word.substring(1);
		if (!node[firstLetter]) { //make obj if it doesn't exist
			node[firstLetter] = {};
		}
		addToTrie(node[firstLetter], remainder);
	}

	function printTree(node, prefix) {
		if (node.complete) {
			console.log(prefix);
		} else {
			var keys = Object.keys(node);
			keys.sort();
			keys.forEach( key => printTree(node[key], prefix + key));
		}
	}

	function promptForWord() {
		rl.question(">  ", function(input) {

			if (input === 'run test') {
				test('inside', 'inside');
				test('sheep', 'sheep');
				test('conspiracy', 'conspiracy');
				test('sheeple', 'NO CORRECTION');
				test('inside', 'inside');
				test('sheeeeep', 'sheep');
				test('CUNsperrICY', 'conspiracy');
				test('inSIDE', 'inside');
				test('jjoobbb', 'job');
				test('weke', 'wake');
			} else {
				result = search(dictionary, input).trim();
				if (result) {
					console.log(result);
				} else {
					console.log('NO CORRECTION');
				}
				promptForWord();
			}
		});
	}

	function test(word, expected) {
		console.log('===========================');
		console.log('inputting ' + word + ' should result in ' + expected);
		console.log('> ' + word);
		result = search(dictionary, word).trim();
		if (result && result === expected) {
			console.log(result);
			console.log('Test succeeded!');
		} else if (result && expected === 'NO CORRECTION') {
			console.log('NO CORRECTION');
			console.log('Test succeeded!');
		} else {
			console.log('Test failed');
		}
		console.log('===========================');

	}

	function search(node, initialWord, lastLetter) {
		var word = initialWord.toLowerCase();
		var firstLetter = word.charAt(0);
		var remainder = word.substring(1);

		//check for the end of node
		if (node.complete) {
			return ' '; //'' is falsy. Must trim the result. Not ideal. 
		}
		if (node[firstLetter] && node[firstLetter].complete && !remainder.length) {
			return firstLetter;
		} 
		
		// check for vowels
		if (vowels.indexOf(firstLetter) > -1) {
			for(var i = 0; i < vowels.length; i++) {
				var vowel = vowels[i];
				if (firstLetter !== vowel && node[vowel]) {
					var result = search(node[vowel], remainder, vowel);
					if (result) {
						return vowel + result;
					} 
				}
			}
		}

		// check for duplicate letters
		if (firstLetter === lastLetter) {
			var result = search(node, word.substring(1), lastLetter);
			if (result) {
				return result;
			}
		} 

		// continue on if node is available
		if (node[firstLetter]) {
			var result = search(node[firstLetter], remainder, firstLetter);
			if (result) {
				return firstLetter + result;
			}
 		}

 		return false;
	}

})();
