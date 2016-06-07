(function() {
	console.log('Welcome to spellchecker!');

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

	fs.readFile(process.argv[2], 'utf8', function(err, data) {
		if (err) throw err;
		var words = data.split(/\r?\n/);
		words.forEach( word => addToTrie(dictionary, word));
		console.log('Words loaded.');
		promptForWord();
	});


	function addToTrie(node, word) {
		if (!word.length) {
			node.complete = true;
			return;
		}
		var firstLetter = word.charAt(0);
		var remainder = word.substring(1);
		if (!node[firstLetter]) {
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
			result = search(dictionary, input);
			if (result) {
				console.log(result);
			} else {
				console.log('NO CORRECTION');
			}
			promptForWord();
		});
	}

	function search(node, word, lastLetter) {
		var firstLetter = word.charAt(0);
		var remainder = word.substring(1);

		if (node[firstLetter] && node[firstLetter].complete && !remainder.length) {
			return firstLetter;
		} else if (vowels.indexOf(firstLetter) > -1) {
			console.log(firstLetter, 'Its a VOWEL', node);
			for(var i = 0; i < vowels.length; i++) {
				var vowel = vowels[i];
				console.log(vowel);
				if (firstLetter !== vowel && node[vowel]) {
					console.log('searching for' + vowel);
					var result = search(node[vowel], remainder, vowel);
					if (result) {
						console.log('DONE', vowel+result);
						return vowel + result;
					} 
				}
			}
		} else if (firstLetter === lastLetter) {
			var result = search(node, word.substring(1), lastLetter);
			if (result) {
				return result;
			}
		} else if (node[firstLetter]) {
			var result = search(node[firstLetter], remainder, firstLetter);
			if (result) {
				return firstLetter + result;
			} 
 		} else if (word.toLowerCase() != word) {
 			return word.toLowerCase();
 		} else {
			return false;
		}
	}

})();
