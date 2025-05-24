// run with npx serve

/* WORD LISTS
https://github.com/wordnik/wordlist/blob/main/README.md
https://github.com/lorenbrichter/Words?tab=readme-ov-file
*/

import { ref, watch } from 'vue';
export default {
	setup() {
		const width = 6;
		const height = 6;
		const maxBlockHeight = 1;
		const minWordLength = 3;
		
		var startPos = Math.ceil(width/2);
		var totalLettersDropped = ref(0);
		var totalWordsMade = ref(0);
		var totalScore = ref(0);
		var nextTileType = 0;
		var gameStarted = ref(true);
		var gameOver = ref(false);
		var bankedTile = ref("");
		var lastMoveScore = ref(0);
		var lastMoveGem = ref(0);
		var canDrop = true;
		var prevMoves = ref([]);
		var bestMoves = ref([]);
		var bestMoveLevel = ref([]);
		var longestWordLevel = ref([]);
		const maxStatLength = 5;
		var bonusWord = ref("");
		var bonusAmount = 200;
		var level = ref(1);
		var paused = ref(true);
		var comboMultiplier = 1;
		var lastFoundWords = false;
		var isFlipping = ref(true);
		var turnsCloaked = ref(0);
		var halvedLetter = "";
		
		var sentAjax = false;
		var userID = ref(sessionStorage.getItem("userid"));
		var loginError = ref(0);
		
		var validWords = [];
		fetch('wordlists/wordlist-20210729.txt')
			.then(response => response.text())
			.then((data) => {
				validWords = data.toUpperCase().split("\n");
			});
			
		var bonusWordSelection = [];
		fetch('wordlists/wordlist4_selection.txt')
			.then(response => response.text())
			.then((data) => {
				bonusWordSelection = data.toUpperCase().split("\n");
			})
			.then(() => {
				//bonusWord.value = bonusWordSelection[Math.floor(Math.random()*bonusWordSelection.length)];
			});
		
		var grid = ref([]);
		for(let i = 0; i < height; i++)
		{
			grid.value.push(Array(width).fill(""));
		}
		//grid.value[5][0] = "Y1";
		//grid.value[5][1] = "E2";
		//grid.value[5][2] = "L3";
		//grid.value[5][3] = "L4";
		//grid.value[5][4] = "O0 V";
		//grid.value[5][5] = "W6";
		//grid.value[0][0] = "D0";
		//grid.value[1][0] = "O0";
		//grid.value[2][0] = "N0";
		//grid.value[3][0] = "K0 V";
		//grid.value[4][0] = "E0 U";
		//grid.value[0][5] = "P0 P";
		//grid.value[1][5] = "H0 W";
		//grid.value[2][5] = "O0 F";
		//grid.value[3][5] = "N0 C";
		//grid.value[4][5] = "E7";
		//grid.value[4][2] = "C0";
		//grid.value[4][3] = "A0";
		//grid.value[4][4] = "T5";
		//grid.value[4][1] = "R0";
		//grid.value[3][2] = "E0";
		//grid.value[3][3] = "X0";
		
		// frequency of letters
		const letterWeights = [
			9, 2, 2, 5, 13,
			2, 3, 4, 8, 1,
			1, 4, 2, 5, 8,
			2, 1, 6, 5, 7,
			4, 2, 2, 1, 2, 1
		];
		var cumulativeLetterWeights = [];
		let sumLetterWeights = 0;
		function calculateCumulativeLetterWeights() // recalculate whenever probability changes
		{
			cumulativeLetterWeights = [];
			sumLetterWeights = 0;
			for(let i = 0; i < letterWeights.length; i++)
			{
				sumLetterWeights += letterWeights[i];
				cumulativeLetterWeights.push(sumLetterWeights);
			}
		}
		calculateCumulativeLetterWeights();
		const letterPoints = {
			'A': 1.00, // 1,
			'B': 1.25, // 4,
			'C': 1.25, // 4,
			'D': 1.125, // 2,
			'E': 1.00, // 1,
			'F': 1.25, // 4,
			'G': 1.125, // 3,
			'H': 1.25, // 3,
			'I': 1.00, // 1,
			'J': 1.75, // 10,
			'K': 1.75, // 5,
			'L': 1.00, // 2,
			'M': 1.25, // 4,
			'N': 1.00, // 2,
			'O': 1.00, // 1,
			'P': 1.25, // 4,
			'Q': 2.00, // 10,
			'R': 1.00, // 1,
			'S': 1.00, // 1,
			'T': 1.00, // 1,
			'U': 1.125, // 2,
			'V': 1.50, // 5,
			'W': 1.50, // 4,
			'X': 2.00, // 8,
			'Y': 1.50, // 3,
			'Z': 2.00, // 10
		};
		
		// required score to get gem tile
		const gemScoreMins = [65, 80, 95, 125, 160, 215, 300];
		//const scoreBonus = [200, 325, 525, 825, 1125, 1525, 2025];
		// bonus multiplier of each tile type
		const tileMultipliers = [1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.5, 2];
		// required score to reach next level
		const levelThresholds = [
			0, 250, 500, 750, 1000,
			1500, 2000, 2500, 3000, 3500,
			4000, 4500, 5000, 5500, 6000,
			6500, 7000, 7500, 8000, 8500,
			9000, 9500, 10000, 10500, 11000,
			11500, 12000, 12500, 13000, 13500,
			14000, 14500, 15000, 15500, 16000,
			16500, 17000, 17500, 18000, 18500,
			19000, 19500, 20000, 20500, 21000,
			21500, 22000, 22500, 23000, 23500
		];
		for(let i = 24000; i <= 100000; i += 500)
		{
			levelThresholds.push(i);
		}
		
		// probability of basic tile, petrified tile, mystery tile
		var tileVariantWeights = [100, 0, 0, 0, 0, 0, 0, 0];
		const variants = [' ', 'P', 'M', 'W', 'F', 'C', 'V', 'U'];
		const tileVariantUnlocks = [0, 5, 8, 11, 20, 17, 14, 32]; // levels at which tile variants are unlocked
		const probabilityChangeUnlocks = [23, 26, 29]; // levels at which tile probabilities change: double, halve, remove
		
		Array.prototype.randomize = function()
		{
			for(let i = 0; i < this.length; i++)
			{
				let index = Math.floor(Math.random()*(this.length-i)+i);
				let temp = this[i];
				this[i] = this[index];
				this[index] = temp;
			}
			return this;
		}

		function calculateScore(word, multiplier = 1)
		{
			let wordTotal = 0;
			for(let i = 0; i < word.length; i++)
			{
				wordTotal += letterPoints[word[i]];
			}
			let wordScore = Math.floor((0.13*(wordTotal**3) + 2.76*(wordTotal**2) + 4.13*wordTotal + 0.48)*multiplier);
			
			if(word === bonusWord.value)
			{
				wordScore += bonusAmount;
				//bonusAmount += 1000;
				let newBonus = setTimeout(newBonusWord, 1000);
			}
			
			return wordScore;
		}
		
		function randomLetter()
		{
			let randnum = Math.ceil(Math.random()*sumLetterWeights);
			
			for(let i = 0; i < cumulativeLetterWeights.length; i++)
			{
				if(randnum <= cumulativeLetterWeights[i])
				{
					return String.fromCharCode(i + 65);
				}
			}
			console.log("Error generating random letter!");
			return String.fromCharCode(Math.floor(Math.random()*26) + 65);
		}
		
		function newBonusWord()
		{
			bonusWord.value = bonusWordSelection[Math.floor(Math.random()*bonusWordSelection.length)]
		}
		
		function getNewBlock()
		{
			var block = [];
			for(let i = 0; i < maxBlockHeight; i++)
			{
				block.push(Array(width).fill(""));
			}
		
			var letter = randomLetter();//String.fromCharCode(Math.random()*26 + 65);
			
			let variantstr = " ";
			if(nextTileType === 0)
			{
				let cumulativeTileVariantWeights = [];
				let sumWeights = 0;
				for(let i = 0; i < tileVariantWeights.length; i++)
				{
					sumWeights += tileVariantWeights[i];
					cumulativeTileVariantWeights.push(sumWeights);
				}
				let rand = Math.random()*cumulativeTileVariantWeights[cumulativeTileVariantWeights.length-1];
				for(let i = 0; i < cumulativeTileVariantWeights.length; i++)
				{
					if(rand <= cumulativeTileVariantWeights[i])
					{
						variantstr += variants[i];
						break;
					}
				}
			}
			block[maxBlockHeight-1][startPos] = letter + nextTileType + variantstr;
			nextTileType = 0;
			
			//var letter = String.fromCharCode(Math.random()*26 + 65);
			//block[2][5] = letter;
			
			//var letter = String.fromCharCode(Math.random()*26 + 65);
			//block[1][5] = letter;
			
			return block;
		}
		
		var nextBlock = ref(getNewBlock());
		
		function levelUp()
		{
			level.value++;
			paused.value = true;
			
			let modal = new bootstrap.Modal(document.getElementById("levelModal"));
			modal.show();
			
			if(level.value === 2)
			{
				// unlock bonus word
				bonusWord.value = bonusWordSelection[Math.floor(Math.random()*bonusWordSelection.length)];
			}
			else if(level.value === tileVariantUnlocks[1])
			{
				// unlock petrified tiles
				tileVariantWeights[1] = 5;
			}
			else if(level.value === tileVariantUnlocks[2])
			{
				// unlock mystery tiles
				tileVariantWeights[2] = 5;
			}
			else if(level.value === tileVariantUnlocks[3])
			{
				// unlock warp tiles
				tileVariantWeights[3] = 5;
			}
			else if(level.value === tileVariantUnlocks[4])
			{
				// unlock flip tiles
				tileVariantWeights[4] = 5;
			}
			else if(level.value === tileVariantUnlocks[5])
			{
				// unlock cloak tiles
				tileVariantWeights[5] = 5;
			}
			else if(level.value === tileVariantUnlocks[6])
			{
				// unlock void tiles
				tileVariantWeights[6] = 5;
			}
			else if(level.value === tileVariantUnlocks[7])
			{
				// unlock backwards tiles
				tileVariantWeights[7] = 5;
			}
			else if(probabilityChangeUnlocks.includes(level.value))
			{
				alterLetterProbability(probabilityChangeUnlocks.indexOf(level.value));
			}
		}
		
		function findWords(auto = false)
		{
			canDrop = false;
			let horizontalWords = [];
			let horizontalCoords = [];
			let wordsInProgress = [];
			let wordReqs = []; // to note any requirements of words; e.g., petrified tiles
			
			if(!auto)
			{
				turnsCloaked.value = Math.max(turnsCloaked.value-1, 0);
			}
			
			// find horizontal words
			for(let i = 0; i < height; i++)
			{
				let rowWords = [];
				let rowWordCoords = [];
				for(let j = 0; j < width; j++)
				{
					if(grid.value[i][j] !== "" && (grid.value[i][j].length < 3 || !['X','Y','Z'].includes(grid.value[i][j][2])))
					{
						for(let k = 0; k < wordsInProgress.length; k++)
						{
							wordsInProgress[k] += grid.value[i][j][0];
							if(grid.value[i][j][3] === 'P')
							{
								wordReqs[k] = 'P';
							}
							
							if(wordsInProgress[k].length >= minWordLength && validWords.includes(wordsInProgress[k]) && (wordReqs[k] !== 'P' || wordsInProgress[k].length >= minWordLength+1))
							{
								//console.log('found horizontal word: ' + wordsInProgress[k]);
								// add row, column, and length of word
								rowWords.push(wordsInProgress[k]);
								rowWordCoords.push([i, j - wordsInProgress[k].length + 1, wordsInProgress[k].length]);
							}
						}
						wordsInProgress.push(grid.value[i][j][0]);
						if(grid.value.length >= 4 && grid.value[i][j][3] === 'P')
						{
							wordReqs.push('P');
						}
						else
						{
							wordReqs.push('');
						}
					}
					else
					{
						wordsInProgress = [];
						wordReqs = [];
					}
				}
				wordsInProgress = [];
				wordReqs = [];
				
				// if there are multiple words in a row, make sure none overlap and take the longest possible word(s)
				if(rowWords.length > 0)
				{
					let longestIndex = 0;
					if(rowWords[0] !== bonusWord.value)
					{
						for(let l = 1; l < rowWords.length; l++)
						{
							if(rowWords[l].length > rowWords[longestIndex].length)
							{
								longestIndex = l;
							}
							else if(rowWords[l].length === rowWords[longestIndex].length)
							{
								// if two overlapping words are same length, prioritize the one with the higher score
								// (does not currently take gem multipliers into account)
								if(calculateScore(rowWords[l]) > calculateScore(rowWords[longestIndex]))
								{
									longestIndex = l;
								}
							}
							if(rowWords[l] === bonusWord.value)
							{
								// prioritize bonus word
								longestIndex = l;
								break;
							}
						}
					}
					let saveWords = [longestIndex];
					let searchLength = rowWords[longestIndex].length;
					while(searchLength >= minWordLength)
					{
						for(let l = 0; l < rowWords.length; l++)
						{
							if(rowWords[l].length === searchLength && !saveWords.includes(l))
							{
								let save = true;
								for(let m = 0; m < saveWords.length; m++)
								{
									if(rowWordCoords[saveWords[m]][1] + rowWordCoords[saveWords[m]][2]-1 < rowWordCoords[l][1] || rowWordCoords[l][1] + rowWordCoords[l][2]-1 < rowWordCoords[saveWords[m]][1])
									{
										continue;
									}
									else
									{
										save = false;
										break;
									}
								}
								if(save)
								{
									saveWords.push(l);
								}
							}
						}
						searchLength--;
					}
					
					for(let l = 0; l < saveWords.length; l++)
					{
						horizontalWords.push(rowWords[saveWords[l]]);
						horizontalCoords.push(rowWordCoords[saveWords[l]]);
					}
				}
			}
			
			// find vertical words
			let verticalWords = [];
			let verticalCoords = [];
			wordsInProgress = [];
			wordReqs = [];
			for(let j = 0; j < width; j++)
			{
				let colWords = [];
				let colWordCoords = [];
				for(let i = 0; i < height; i++)
				{
					if(grid.value[i][j] !== "" && (grid.value[i][j].length < 3 || !['X','Y','Z'].includes(grid.value[i][j][2])))
					{
						for(let k = 0; k < wordsInProgress.length; k++)
						{
							wordsInProgress[k] += grid.value[i][j][0];
							if(grid.value.length >= 4 && grid.value[i][j][3] === 'P')
							{
								wordReqs[k] = 'P';
							}
							
							if(wordsInProgress[k].length >= minWordLength && validWords.includes(wordsInProgress[k]) && (wordReqs[k] !== 'P' || wordsInProgress[k].length >= minWordLength+1))
							{
								//console.log('found vertical word: ' + wordsInProgress[k]);
								// add row, column, and length of word
								colWords.push(wordsInProgress[k]);
								colWordCoords.push([i - wordsInProgress[k].length + 1, j, wordsInProgress[k].length]);
							}
						}
						wordsInProgress.push(grid.value[i][j][0]);
						if(grid.value.length >= 4 && grid.value[i][j][3] === 'P')
						{
							wordReqs.push('P');
						}
						else
						{
							wordReqs.push('');
						}
					}
					else
					{
						wordsInProgress = [];
						wordReqs = [];
					}
				}
				wordsInProgress = [];
				wordReqs = [];
				
				// if there are multiple words in a column, make sure none overlap and take the longest possible word(s)
				if(colWords.length > 0)
				{
					let longestIndex = 0;
					for(let l = 1; l < colWords.length; l++)
					{
						if(colWords[l].length > colWords[longestIndex].length)
						{
							longestIndex = l;
						}
						else if(colWords[l].length === colWords[longestIndex].length)
						{
							// if two overlapping words are same length, prioritize the one with the higher score
							// (does not currently take gem multipliers into account)
							if(calculateScore(colWords[l]) > calculateScore(colWords[longestIndex]))
							{
								longestIndex = l;
							}
						}
						if(colWords[l] === bonusWord.value)
						{
							// prioritize bonus word
							longestIndex = l;
							break;
						}
					}
					let saveWords = [longestIndex];
					let searchLength = colWords[longestIndex].length;
					while(searchLength >= minWordLength)
					{
						for(let l = 0; l < colWords.length; l++)
						{
							if(colWords[l].length === searchLength && !saveWords.includes(l))
							{
								let save = true;
								for(let m = 0; m < saveWords.length; m++)
								{
									if(colWordCoords[saveWords[m]][1] + colWordCoords[saveWords[m]][2]-1 < colWordCoords[l][1] || colWordCoords[l][1] + colWordCoords[l][2]-1 < colWordCoords[saveWords[m]][1])
									{
										continue;
									}
									else
									{
										save = false;
										break;
									}
								}
								if(save)
								{
									saveWords.push(l);
								}
							}
						}
						searchLength--;
					}
					
					for(let l = 0; l < saveWords.length; l++)
					{
						verticalWords.push(colWords[saveWords[l]]);
						verticalCoords.push(colWordCoords[saveWords[l]]);
					}
				}
			}
			
			let numWords = horizontalWords.length + verticalWords.length;
			//let words = horizontalWords.concat(verticalWords);
			
			totalWordsMade.value += numWords;
			
			//console.log(horizontalWords);
			//console.log(verticalWords);
			
			let moveScore = 0;
			let maxLength = 0;
			let maxGem = 0;
			let bestWord = ["",0];
			let longestWord = ["",0];
			//let numFlips = 0;
			let flipCoords = [];
			let cloakCoords = [];
			
			// identify found words and add glow class
			for(let i = 0; i < horizontalWords.length; i++)
			{
				let numGems = [];
				let totalGems = 0;
				for(let i = 0; i < gemScoreMins.length; i++)
				{
					numGems.push(0);
				}
			
				let multiplier = 1;
				let row = horizontalCoords[i][0];
				let col = horizontalCoords[i][1];
				let length = horizontalCoords[i][2];
				for(let j = col; j < col + length; j++)
				{
					let tileval = grid.value[row][j];
					grid.value[row][j] = tileval.slice(0,2) + 'X' + tileval.slice(3);
					
					if(!isNaN(parseInt(tileval[1])))
					{
						multiplier *= tileMultipliers[tileval[1]];
						if(tileval[1] > 0)
						{
							numGems[tileval[1]]++;
							totalGems++;
						}
						if(tileval[1] > maxGem)
						{
							maxGem = tileval[1];
						}
					}
					
					// for flip tiles
					if(tileval.length >= 4 && tileval[3] === 'F' && !flipCoords.includes(i + ',' + j))
					{
						//numFlips++;
						flipCoords.push(i + ',' + j);
					}
					
					// for cloak tiles
					if(tileval.length >= 4 && tileval[3] === 'C' && !cloakCoords.includes(i + ',' + j))
					{
						cloakCoords.push(i + ',' + j);
					}
					
					// for void tiles
					if(tileval.length >= 4 && tileval[3] === 'V')
					{
						multiplier *= 0.5;
					}
				}
				// bonus for bundle/flush
				if(Math.max(numGems) >= 3) // flush
				{
					multiplier *= 2;
				}
				else if(totalGems >= 3) // bundle
				{
					multiplier *= 1.5;
				}
				
				console.log(horizontalWords[i] + ' ' + multiplier);
				let score = calculateScore(horizontalWords[i], multiplier);
				console.log(score);
				
				//console.log(horizontalWords[i] + ": " + score);
				moveScore += score;
				
				if(length > maxLength)
				{
					maxLength = length;
				}
				if(score > bestWord[1])
				{
					bestWord[1] = score;
					bestWord[0] = horizontalWords[i];
				}
				if(horizontalWords[i].length > longestWord[0].length)
				{
					longestWord[0] = horizontalWords[i];
					longestWord[1] = maxGem;
				}
			}
			for(let i = 0; i < verticalWords.length; i++)
			{
				let numGems = [];
				let totalGems = 0;
				for(let i = 0; i < gemScoreMins.length; i++)
				{
					numGems.push(0);
				}
				
				let multiplier = 1;
				let row = verticalCoords[i][0];
				let col = verticalCoords[i][1];
				let length = verticalCoords[i][2];
				for(let j = row; j < row + length; j++)
				{
					let tileval = grid.value[j][col];
					if(tileval && tileval.length > 2 && tileval[2] === 'X')
					{
						grid.value[j][col] = tileval.slice(0,2) + 'Z' + tileval.slice(3);
					}
					else
					{
						grid.value[j][col] = tileval.slice(0,2) + 'Y' + tileval.slice(3);
					}
					
					if(!isNaN(parseInt(tileval[1])))
					{
						multiplier *= tileMultipliers[tileval[1]];
						if(tileval[1] > 0)
						{
							numGems[tileval[1]]++;
							totalGems++;
						}
						if(tileval[1] > maxGem)
						{
							maxGem = tileval[1];
						}
					}
					
					// for flip tiles
					if(tileval.length >= 4 && tileval[3] === 'F' && !flipCoords.includes(i + ',' + j))
					{
						//numFlips++;
						flipCoords.push(i + ',' + j);
					}
					// for cloak tiles
					if(tileval.length >= 4 && tileval[3] === 'C' && !cloakCoords.includes(i + ',' + j))
					{
						cloakCoords.push(i + ',' + j);
					}
					
					// for void tiles
					if(tileval.length >= 4 && tileval[3] === 'V')
					{
						multiplier *= 0.5;
					}
				}
				// bonus for bundle/flush
				if(Math.max(numGems) >= 3) // flush
				{
					multiplier *= 2;
				}
				else if(totalGems >= 3) // bundle
				{
					multiplier *= 1.5;
				}
				
				console.log(verticalWords[i] + ' ' + multiplier);
				let score = calculateScore(verticalWords[i], multiplier);
				console.log(score);
				
				moveScore += score;
				
				if(length > maxLength)
				{
					maxLength = length;
				}
				if(score > bestWord[1])
				{
					bestWord[1] = score;
					bestWord[0] = verticalWords[i];
				}
				if(verticalWords[i].length > longestWord[0].length)
				{
					longestWord[0] = verticalWords[i];
					longestWord[1] = maxGem;
				}
			}
			
			let moveMultiplier = numWords/2 + 0.5; // bonus for number of words formed
			moveScore *= moveMultiplier;
			moveScore = Math.floor(moveScore);
			
			// determine if gem tile should be given next
			
			// min 47
			// 50
			// 100
			// 150
			// 200
			// 250
			// 300
			// 350
			// base of top tier ~400?
			
			// 3, 4, 5, 6, 7, 8
			// 0, 1, 2, 3, 4, 5 => 0, 2, 4, 5 in 6x6
			//					=> 0, 2, 3, 4, 6, 7 in 8x8
			// is this too generous??
			let lengthBonusTile = 0;
			if(maxLength > minWordLength)
			{
				lengthBonusTile = maxLength - minWordLength + 1;
				if(maxLength >= Math.max(width, height) - 1 && maxLength > minWordLength)
				{
					lengthBonusTile += 1;
				}
			}
			
			let scoreBonusTile = 0;
			for(let i = 0; i < gemScoreMins.length; i++)
			{
				if(moveScore >= gemScoreMins[i])
				{
					scoreBonusTile = i+1;
				}
				else
				{
					break;
				}
			}
			
			console.log("Score Bonus Tile: " + scoreBonusTile);
			console.log("Length Bonus Tile: " + lengthBonusTile);
			let upgradeTileType = 0;
			let upgrading = true;
			if(scoreBonusTile > 0 && lengthBonusTile > 0)
			{
				console.log("A");
				if(Math.random() < 0.5)
				{
					console.log("B");
					nextTileType = Math.max(nextTileType, scoreBonusTile);
					upgradeTileType = lengthBonusTile;
					//upgradeRandomGridTile(lengthBonusTile);
				}
				else
				{
					console.log("C");
					nextTileType = Math.max(nextTileType, lengthBonusTile);
					upgradeTileType = scoreBonusTile;
					//upgradeRandomGridTile(scoreBonusTile);
				}
			}
			else if(scoreBonusTile > 0 || lengthBonusTile > 0)
			{
				console.log("D");
				let bonusTile = Math.max(scoreBonusTile, lengthBonusTile);
				if(nextTileType === 0 && Math.random() < 0.5)
				{
					console.log("E");
					nextTileType = bonusTile;
					upgrading = false;
				}
				else
				{
					console.log("F");
					upgradeTileType = bonusTile;
					//upgradeRandomGridTile(bonusTile);
				}
			}
			else if(Math.random() < 0.05)
			{
				console.log("G");
				nextTileType = 1;
				upgrading = false;
			}
			else
			{
				console.log("H");
				upgrading = false;
			}
			
			totalScore.value += moveScore;
			if(moveScore > 0)
			{
				// for displaying list of previous/best moves 
				let thisMove = [bestWord[0], moveScore, maxGem];
				prevMoves.value.splice(0, 0, thisMove);
				if(prevMoves.value.length > maxStatLength)
				{
					prevMoves.value.splice(maxStatLength);
				}
				if(bestMoves.value.length === 0)
				{
					bestMoves.value.push(thisMove);
					bestMoveLevel.value = thisMove;
					longestWordLevel.value = longestWord;
				}
				else
				{
					// update previous/best move stats for the game
					let inserted = false;
					for(let i = 0; i < bestMoves.value.length; i++)
					{
						if(moveScore > bestMoves.value[i][1])
						{
							bestMoves.value.splice(i, 0, thisMove);
							inserted = true;
							break;
						}
					}
					if(!inserted && bestMoves.value.length < maxStatLength)
					{
						bestMoves.value.push(thisMove);
					}
					else if(bestMoves.value.length > maxStatLength)
					{
						bestMoves.value.splice(maxStatLength);
					}
					
					// update best/longest word for this level
					if(bestMoveLevel.value.length === 0)
					{
						bestMoveLevel.value = thisMove;
						longestWordLevel.value = longestWord;
					}
					else
					{
						if(thisMove[1] > bestMoveLevel.value[1])
						{
							bestMoveLevel.value = thisMove;
						}
						if(longestWord[0].length > longestWordLevel.value[0].length)
						{
							longestWordLevel.value = longestWord;
						}
					}
				}
				
				// flip board if flip tile played
				if(flipCoords.length % 2 === 1)
				{
					let flip = setTimeout(function()
					{
						isFlipping.value = true;
						let swap = setTimeout(function()
						{
							for(let i = 0; i < height; i++)
							{
								for(let j = 0; j < Math.floor(width/2); j++)
								{
									let temp = grid.value[i][j];
									grid.value[i][j] = grid.value[i][width-j-1];
									grid.value[i][width-j-1] = temp;
								}
							}
							isFlipping.value = false;
						}, 250);
					}, 750);
				}
				let cloak = setTimeout(function()
				{
					turnsCloaked.value += cloakCoords.length;
				}, 500);
				
				// if more words are found immediately after this check, it creates a combo for bonus points
				comboMultiplier += 0.25;
				
				// for displaying move score at top
				lastMoveScore.value = moveScore;
				lastMoveGem.value = maxGem;
				let fade = setTimeout(function() { lastMoveScore.value = 0; }, 2000);
			}
			else
			{
				comboMultiplier = 1;
			}
			
			//console.log(moveScore);
			//console.log(totalScore.value);
			
			// set timer to make words disappear
			if(horizontalWords.length > 0 || verticalWords.length > 0)
			{
				lastFoundWords = true;
				let wordVanish = setTimeout(function()
				{
					vanquishWords(upgradeTileType);
					if(level.value < levelThresholds.length && totalScore.value > levelThresholds[level.value])
					{
						levelUp();
					}
				}, 1000);
			}
			else
			{
				let warpFound = false;
				if(!lastFoundWords)
				{
					// update warp tiles
					for(let i = 0; i < height; i++)
					{
						for(let j = 0; j < width; j++)
						{
							let tileval = grid.value[i][j];
							if(tileval.length >= 4 && tileval[3] === "W")
							{
								warpFound = true;
								let curletter = tileval[0];
								let newletter = String.fromCharCode(Math.floor(Math.random()*26) + 65);
								while(newletter === curletter)
								{
									newletter = String.fromCharCode(Math.floor(Math.random()*26) + 65);
								}
								
								let warpWait = setTimeout(function()
								{
									grid.value[i][j] = curletter + '@' + tileval.slice(2);
								
									let updateLetter = setTimeout(function()
									{
										grid.value[i][j] = newletter + ' ' + tileval.substring(2);
										let allowDrop = setTimeout(function(){
											canDrop = true;
										}, 200);
									}, 250);
								}, 250);
							}
						}
					}
				}
				if(!upgrading && !warpFound)
				{
					canDrop = true;
				}
				
				lastFoundWords = false;
				
				// checks if there are still gaps in the board
				for(let i = 0; i < height; i++)
				{
					for(let j = 0; j < width; j++)
					{
						if(grid.value[i][j] === "")
						{
							return;
						}
					}
				}
				// if the program reaches this, the board is full and no more moves can be made
				gameOver.value = true;
				
				let gameOverScreen = setTimeout(function()
				{
					userID.value = sessionStorage.getItem("userid");
					if(!sentAjax && userID.value != null)
					{
						// send game data to be stored in database
						let data = "gamedata=" + encodeURIComponent(JSON.stringify({
							"userID": userID.value,
							"totalScore": totalScore.value,
							"bestWord": bestMoves.value[0][0],
							"bestWordScore": bestMoves.value[0][1],
							"bestWordGem": bestMoves.value[0][2],
							"numLetters": totalLettersDropped.value,
							"numWords": totalWordsMade.value
						}));

						var xhr = new XMLHttpRequest();

						xhr.open("POST", "savedata.php", true);

						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

						xhr.onreadystatechange = function()
						{
							if(xhr.readyState === XMLHttpRequest.DONE)
							{
								if(xhr.status === 200)
								{
									console.log(xhr.responseText);
								}
								else
								{
									console.error("Error:", xhr.status);
								}
							}
						};
						xhr.send(data);
						sentAjax = true;
					}
					
					let modal = new bootstrap.Modal(document.getElementById("gameOverModal"));
					modal.show();
				}, 1000);
			}
		}
		
		function upgradeRandomGridTile(tileType)
		{
			let rows = Array.from(Array(height).keys());
			let cols = Array.from(Array(width).keys());
			rows.randomize();
			cols.randomize();
			
			let foundUpgrade = false;
			for(let i = 0; i < rows.length; i++)
			{
				for(let j = 0; j < cols.length; j++)
				{
					let tileval = grid.value[rows[i]][cols[j]];
					if(tileval !== "" && tileval[1] === '0' && (tileval.length < 4 || !['P', 'W', 'F', 'C', 'V'].includes(tileval[3])))
					{
						foundUpgrade = true;
						grid.value[rows[i]][cols[j]] = tileval.substring(0,1) + '~' + tileval.substring(2);
						let upgrade = setTimeout(function()
						{
							grid.value[rows[i]][cols[j]] = tileval.substring(0,1) + tileType + tileval.substring(2);
							canDrop = true;
							let findAgain = setTimeout(function()
							{
								findWords(true);
							}, 600);
						}, 500);
						//grid.value[rows[i]][cols[j]] = tileval.substring(0,1) + tileType + tileval.substring(2);
						//console.log("Upgrading (" + i + ", " + j + ") to type " + tileType);
						return;
					}
				}
			}
			if(!foundUpgrade)
			{
				canDrop = true;
			}
		}
		
		function vanquishWords(upgradeTileType = 0)
		{
			for(let i = 0; i < height; i++)
			{
				for(let j = 0; j < width; j++)
				{
					let tileval = grid.value[i][j];
					if(tileval !== "" && ['X','Y','Z'].includes(tileval[2]))
					{
						grid.value[i][j] = "";
					}
				}
			}
			//canDrop = true;
			let tileDrop = setTimeout(function() { dropTiles(upgradeTileType); }, 500);
		}
		
		function dropTiles(upgradeTileType = 0)
		{
			if(!paused.value)
			{
				for(let j = 0; j < width; j++)
				{
					let lowestBlank = height-1;
					for(let i = height-1; i >= 0; i--)
					{
						let tileval = grid.value[i][j];
						if(tileval !== "")
						{
							grid.value[i][j] = "";
							grid.value[lowestBlank][j] = tileval;
							lowestBlank--;
						}
					}
				}
				if(upgradeTileType > 0)
				{
					canDrop = false;
					//let upgrade = setTimeout(function() { upgradeRandomGridTile(upgradeTileType); }, 250);
					upgradeRandomGridTile(upgradeTileType);
					upgradeTileType = 0;
				}
				else
				{
					let findAgain = setTimeout(function() {
						findWords(true);
					}, 600);
				}
			}
			else
			{
				let checkAgain = setTimeout(function() {
					dropTiles(upgradeTileType);
				}, 500);
			}
		}
		
		function alterLetterProbability(mode = 0)
		{
			if(mode === 0) // double probability
			{
				let doubleOptions = [];
				for(let i = 0; i <= 26; i++)
				{
					if(letterWeights[i] > 0)
					{
						doubleOptions.push(i);
					}
				}
				let letterIndex = Math.floor(Math.random()*doubleOptions.length);
				console.log("doubling " + String.fromCharCode(letterIndex+65));
				letterWeights[letterIndex] *= 2;
			}
			else if(mode === 1) // halve probability
			{
				let halveOptions = [];
				for(let i = 65; i <= 90; i++)
				{
					if(letterPoints[String.fromCharCode(i)] < 1.5 && letterWeights[i-65] > 0)
					{
						halveOptions.push(String.fromCharCode(i));
					}
				}
				let letter = halveOptions[Math.floor(Math.random()*halveOptions.length)];
				console.log("halving " + letter);
				letterWeights[letter.charCodeAt(0)-65] *= 0.5;
			}
			else if(mode === 2) // remove letter
			{
				let removeOptions = [];
				for(let i = 65; i <= 90; i++)
				{
					if(letterPoints[String.fromCharCode(i)] < 1.5 && letterWeights[i-65] > 0 && !['U',halvedLetter].includes(String.fromCharCode(i))) // don't remove U because we want to give people a chance with a Q
					{
						removeOptions.push(String.fromCharCode(i));
					}
				}
				let letter = removeOptions[Math.floor(Math.random()*removeOptions.length)];
				console.log("removing " + letter);
				letterWeights[letter.charCodeAt(0)-65] = 0;
				
				console.log(letterWeights);
			}
			
			calculateCumulativeLetterWeights();
		}
		
		function handleKeyDown(keychar)
		{
			if(!paused.value)
			{
				if(canDrop && (keychar === 'ArrowDown' || keychar === 'Enter'))
				{
					let blockHeight = 0;
					var lowestRow = height-1;
					var search = true;
					
					//console.log(nextBlock.value);
					
					for(let i = 0; i < maxBlockHeight; i++)
					{
						if(nextBlock.value[i].join("") !== "")
						{
							blockHeight = maxBlockHeight - i;
							break;
						}
					}
					
					//console.log('blockHeight = ' + blockHeight);
					
					for(let i = 0; i < height && search; i++)
					{
						for(let j = maxBlockHeight-1; (maxBlockHeight-1)-i <= j && j >= maxBlockHeight - blockHeight && search; j--)
						{
							for(let k = 0; k < width; k++)
							{
								if(nextBlock.value[j][k] !== '')
								{
									//console.log('i = ' + i + ', j = ' + j + ', k = ' + k + ', nextBlock.value[j][k] = ' + nextBlock.value[j][k] + ', grid.value[i][k] = ' + grid.value[i][k]);
									if(grid.value[i][k] !== '')
									{
										lowestRow = i-1;
										//console.log("lowest row = " + lowestRow);
										search = false;
										break;
									}
								}
							}
						}
					}
					
					//console.log("lowest row = " + lowestRow);
					let highestRow = lowestRow - blockHeight+1;
					//console.log("highest row = " + highestRow);
					if(highestRow < 0)
					{
						console.log("game over");
					}
					else
					{
						totalLettersDropped.value++;
						
						//console.log(nextBlock.value);
						for(let i = lowestRow; i > lowestRow - blockHeight; i--)
						{
							//console.log('i = ' + i);
							let j = maxBlockHeight-1 - (lowestRow - i);
							//for(let j = maxBlockHeight-1; j >= maxBlockHeight - blockHeight; j--)
							//console.log('j = ' + j);
							for(let k = 0; k < width; k++)
							{
								//console.log('k = ' + k);
								if(nextBlock.value[j][k] !== '')
								{
									//console.log('setting value');
									grid.value[i][k] = nextBlock.value[j][k];
								}
							}
						}
						
						findWords();
						
						//console.log(grid.value);
						
						// get next block
						nextBlock.value = getNewBlock();
					}
				}
				else if(keychar === 'ArrowLeft' || keychar === 'ArrowRight' && !gameOver.value)
				{
					let movement, colCheck;
					if(keychar === 'ArrowLeft')
					{
						movement = -1;
						colCheck = 0;
					}
					else
					{
						movement = 1;
						colCheck = width-1;
					}
					
					let canMove = true;
					for(let i = 0; i < maxBlockHeight; i++)
					{
						if(nextBlock.value[i][colCheck] !== '')
						{
							canMove = false;
							break;
						}
					}
					if(canMove)
					{
						if(movement === -1)
						{
							startPos -= 1;
							for(let i = 0; i < maxBlockHeight; i++)
							{
								for(let j = 0; j < width; j++)
								{
									if(j === width-1-colCheck)
									{
										nextBlock.value[i][j] = '';
									}
									else
									{
										//console.log(nextBlock.value[i][j-movement]);
										nextBlock.value[i][j] = nextBlock.value[i][j-movement];
									}
								}
							}
						}
						else
						{
							startPos += 1;
							for(let i = 0; i < maxBlockHeight; i++)
							{
								for(let j = width-1; j >= 0; j--)
								{
									if(j === width-1-colCheck)
									{
										nextBlock.value[i][j] = '';
									}
									else
									{
										//console.log(nextBlock.value[i][j-movement]);
										nextBlock.value[i][j] = nextBlock.value[i][j-movement];
									}
								}
							}
						}
					}
				}
				else if(keychar === 'ArrowUp')
				{
					if(bankedTile.value !== "")
					{
						let temp = nextBlock.value[maxBlockHeight-1][startPos];
						nextBlock.value[maxBlockHeight-1][startPos] = bankedTile.value;
						bankedTile.value = temp;
					}
					else
					{
						bankedTile.value = nextBlock.value[maxBlockHeight-1][startPos];
						nextBlock.value = getNewBlock();
					}
				}
			}
		}
		
		window.addEventListener('keydown', (e) => {
			handleKeyDown(e.key);
		});
		
		const gemTitles = {
			'1': "Citrine Tile: 1.15x multiplier",
			'2': "Amethyst Tile: 1.2x multiplier",
			'3': "Emerald Tile: 1.25x multiplier",
			'4': "Kunzite Tile: 1.3x multiplier",
			'5': "Aquamarine Tile: 1.35x multiplier",
			'6': "Diamond Tile: 1.5x multiplier",
			'7': "Prismatic Tile: 2x multiplier",
			'P': "Petrified Tile: Can only be used in words with at least 4 letters",
			'W': "Warp Tile: Randomizes its letter each turn a word is not made",
			'F': "Flip Tile: Flips the gameboard when used in a word",
			'C': "Cloak Tile: Hides the gameboard for a turn when used in a word",
			'V': "Void Tile: 0.5x multiplier",
			'U': "Backwards Tile: No effect; just weird-looking :)",
			'M': "Mystery Tile: The letter will be revealed once you drop it into the grid!",
		};
		
		function openLoginModal()
		{
			loginError.value = 0;
			let modal = new bootstrap.Modal(document.getElementById("loginModal"));
			modal.show();
		}
		function openSignupModal()
		{
			loginError.value = 0;
			let modal = new bootstrap.Modal(document.getElementById("signupModal"));
			modal.show();
		}
		function login()
		{
			let username = document.getElementById("username").value;
			let pwd = document.getElementById("password").value;
			// send game data to be stored in database
			let data = "gamedata=" + encodeURIComponent(JSON.stringify({
				"username": username,
				"password": pwd,
				"totalScore": totalScore.value,
				"bestWord": bestMoves.value[0][0],
				"bestWordScore": bestMoves.value[0][1],
				"bestWordGem": bestMoves.value[0][2],
				"numLetters": totalLettersDropped.value,
				"numWords": totalWordsMade.value
			}));

			var xhr = new XMLHttpRequest();

			xhr.open("POST", "savedata.php", true);

			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xhr.onreadystatechange = function()
			{
				if(xhr.readyState === XMLHttpRequest.DONE)
				{
					if(xhr.status === 200)
					{
						if(xhr.responseText.includes("login error"))
						{
							loginError.value = 1;
						}
						else if(xhr.responseText.includes("userid "))
						{
							loginError.value = 0;
							let userid = xhr.responseText.split(" ")[1];
							sessionStorage.setItem("userid", userid);
							window.location.href = "leaderboard.php";
						}
						else
						{
							console.log(xhr.responseText);
						}
					}
					else
					{
						console.error("Error:", xhr.status);
					}
				}
			};
			xhr.send(data);
		}
		function signup()
		{
			let username = document.getElementById("username_signup").value;
			let pwd = document.getElementById("password_signup").value;
			// send game data to be stored in database
			let data = "gamedata=" + encodeURIComponent(JSON.stringify({
				"signup": true,
				"username": username,
				"password": pwd,
				"totalScore": totalScore.value,
				"bestWord": bestMoves.value[0][0],
				"bestWordScore": bestMoves.value[0][1],
				"bestWordGem": bestMoves.value[0][2],
				"numLetters": totalLettersDropped.value,
				"numWords": totalWordsMade.value
			}));

			var xhr = new XMLHttpRequest();

			xhr.open("POST", "savedata.php", true);

			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xhr.onreadystatechange = function()
			{
				if(xhr.readyState === XMLHttpRequest.DONE)
				{
					if(xhr.status === 200)
					{
						if(xhr.responseText.includes("username taken"))
						{
							loginError.value = 2;
						}
						else if(xhr.responseText.includes("userid "))
						{
							loginError.value = 0;
							let userid = xhr.responseText.split(" ")[1];
							sessionStorage.setItem("userid", userid);
							window.location.href = "leaderboard.php";
						}
						else
						{
							console.log(xhr.responseText);
						}
					}
					else
					{
						console.error("Error:", xhr.status);
					}
				}
			};
			xhr.send(data);
		}
		
		return { grid, nextBlock, bankedTile, gemTitles, totalScore, totalLettersDropped, totalWordsMade, lastMoveScore, lastMoveGem, prevMoves, bestMoves, bestMoveLevel, longestWordLevel, maxStatLength, gameOver, bonusWord, level, paused, tileVariantUnlocks, gameStarted, handleKeyDown, userID, openLoginModal, login, openSignupModal, signup, loginError, isFlipping, turnsCloaked, probabilityChangeUnlocks, levelThresholds };
	},
	/*watch:
	{
		grid: function(v)
		{
			console.log("A");
			const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
			const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
		}
	},*/
	mounted()
	{
		//const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		//const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
		
		setTheme();
		setTouchscreen();
		let startmodal = new bootstrap.Modal(document.getElementById("infoModalStart"));
		startmodal.show();
	},
	template: `<div class="container-fluid">
		<div class="game">
			<div class="modal fade infomodal" id="infoModalStart" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="infoModalStartLabel"  data-bs-backdrop="static" data-bs-keyboard="false">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title" id="infoModalStartLabel"><b>How to Play</b></h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paused = false"></button>
						</div>
						<div class="modal-body">
							<p>Drop letter tiles into the grid to spell words! Each time a word is formed, the tiles in the word will be removed from the grid. The game ends when the grid is completely filled!</p>
							<p>Use the <b>left and right arrow keys</b> to decide where the next tile falls, and press the <b>down arrow key</b> or <b>enter key</b> to drop the tile immediately.</p>
							<p>You can also use the <b>up arrow key</b> to bank a tile for later - if you already have a tile in the bank, you will be swapping your current tile for the banked one.</p>
							<p>If you create high-scoring words, you may encounter some <b>special tiles</b> that provide a score bonus when played! The list of special tiles is given below.</p>
							<table class="gemtable" style="border-collapse: separate; border-spacing: 0"><tbody>
								<tr>
									<td>
										<div class="tile gemtile tile1">
											<div class="fixed-height"><p>C</p></div>
										</div>
									</td>
									<td>
										<b>Citrine Tile</b><br />
										1.15x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile2">
											<div class="fixed-height"><p>A</p></div>
										</div>
									</td>
									<td>
										<b>Amethyst Tile</b><br />
										1.2x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile3">
											<div class="fixed-height"><p>E</p></div>
										</div>
									</td>
									<td>
										<b>Emerald Tile</b><br />
										1.25x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile4">
											<div class="fixed-height"><p>K</p></div>
										</div>
									</td>
									<td>
										<b>Kunzite Tile</b><br />
										1.3x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile5">
											<div class="fixed-height"><p>Q</p></div>
										</div>
									</td>
									<td>
										<b>Aquamarine Tile</b><br />
										1.35x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile6">
											<div class="fixed-height"><p>D</p></div>
										</div>
									</td>
									<td>
										<b>Diamond Tile</b><br />
										1.5x Multiplier
									</td>
								</tr>
								<tr>
									<td>
										<div class="tile gemtile tile7">
											<div class="fixed-height"><p>P</p></div>
										</div>
									</td>
									<td>
										<b>Prismatic Tile</b><br />
										2x Multiplier
									</td>
								</tr>
							</tbody></table>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary button3" data-bs-dismiss="modal" @click="paused = false">Start Game</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade levelmodal" id="levelModal" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="levelModalLabel" data-bs-backdrop="static" data-bs-keyboard="false">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title" id="levelModalLabel"><b>LEVEL UP!</b></h5>
						</div>
						<div class="modal-body">
							<span :class="'score' + ((level-1)%5+1)">★★★<p class="levelheading">LEVEL {{ level }}</p>★★★</span>
							<br /><br />
							<p class="subheading">BEST MOVE</p>
							<span class="levelstats" v-if="bestMoveLevel.length > 0">
								<span v-if="bestMoveLevel[2] == 7" v-for="(item,i) in bestMoveLevel[0].split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{bestMoveLevel[0][i]}}</span>
								<span v-else :class="'score' + bestMoveLevel[2]">{{bestMoveLevel[0]}}</span> - {{bestMoveLevel[1]}} POINTS
							</span>
							<br /><br />
							<p class="subheading">LONGEST WORD</p>
							<span class="levelstats" v-if="longestWordLevel.length > 0">
								<span v-if="longestWordLevel[1] == 7" v-for="(item,i) in longestWordLevel[0].split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{longestWordLevel[0][i]}}</span>
								<span v-else :class="'score' + longestWordLevel[1]">{{longestWordLevel[0]}}</span> - {{longestWordLevel[0].length}} LETTERS
							</span>
							<br /><br />
							<div v-if="level === 2">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p><b>You can now try spelling the <span :class="'score' + ((level-1)%5+1)">bonus word</span> shown in the sidebar for extra points!</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[1]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">petrified tiles</span>!</b></p>
								<div class="tile tileP" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>P</p></div>
								</div>
								<p><b>Petrified tiles can only be removed using words that are <span :class="'score' + ((level-1)%5+1)">at least 4 letters long</span>.</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[2]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">mystery tiles</span>!</b></p>
								<div class="tile" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>?</p></div>
								</div>
								<p><b>Mystery tiles only reveal their letter once you drop them into the grid.</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[3]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">warp tiles</span>!</b></p>
								<div class="tile tileW" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>W</p></div>
								</div>
								<p><b>Each time you drop a letter without creating a word, every warp tile in the grid will regenerate their letter.</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[4]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">flip tiles</span>!</b></p>
								<div class="tile tileF" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>F</p></div>
								</div>
								<p><b>Each time one of these tiles is removed from the board, the board will flip, so all tiles on the left will be swapped to the right and vice versa.</b></p>
								<p><b>(You can counter this effect by playing an even number of tiles at once!)</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[5]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">cloak tiles</span>!</b></p>
								<div class="tile tileC" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>C</p></div>
								</div>
								<p><b>Each time a cloak tile is removed from the board, the entire grid will be hidden from view for one turn. The effect stacks if multiple cloak tiles are used!</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[6]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">void tiles</span>!</b></p>
								<div class="tile tileV" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>V</p></div>
								</div>
								<p><b>Void tiles add a <span :class="'score' + ((level-1)%5+1)">0.5x score multiplier</span> to whichever words they are a part of.</b></p>
							</div>
							<div v-else-if="level === tileVariantUnlocks[7]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>You may now encounter <span :class="'score' + ((level-1)%5+1)">backwards tiles</span>!</b></p>
								<div class="tile tileU" style="margin-left: auto; margin-right: auto">
									<div class="fixed-height"><p>B</p></div>
								</div>
								<p><b>Backwards tiles have no special effect - they're just meant to be distracting and uncomfortable. :)</b></p>
							</div>
							<div v-else-if="level === probabilityChangeUnlocks[0]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>The frequency of one random letter has been <span :class="'score' + (level%5+1)">doubled</span>!</b></p>
							</div>
							<div v-else-if="level === probabilityChangeUnlocks[1]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>The frequency of one random letter has been <span :class="'score' + ((level-1)%5+1)">halved</span>!</b></p>
							</div>
							<div v-else-if="level === probabilityChangeUnlocks[2]">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>One random letter has been <span :class="'score' + ((level-1)%5+1)">removed from the game</span> and will not appear on any more tiles!</b></p>
							</div>
							<div v-else-if="level >= levelThresholds.length">
								<p :class="'subheading score' + ((level-1)%5+1)">--- NEW ---</p>
								<p class="mb-0"><b>Congratulations! You've reached the final level! Keep going to try to get the highest score possible!</b></p>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" :class="'btn btn-secondary button' + ((level-1)%5+1)" data-bs-dismiss="modal" @click="paused = false; bestMoveLevel = []; longestWordLevel = [];">Continue</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade gameovermodal" id="gameOverModal" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="gameOverModalLabel" data-bs-backdrop="static" data-bs-keyboard="false">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-body">
							<p class="levelheading">GAME OVER</p>
							<br />
							<p class="subheading score4">LEVEL</p>
							<span class="levelstats">{{level}}</span>
							<br /><br />
							<p class="subheading score1">FINAL SCORE</p>
							<span class="levelstats">{{totalScore}}</span>
							<br /><br />
							<p class="subheading score3">TOTAL LETTERS DROPPED</p>
							<span class="levelstats">{{totalLettersDropped}}</span>
							<br /><br />
							<p class="subheading score5">TOTAL WORDS MADE</p>
							<span class="levelstats">{{totalWordsMade}}</span>
							<br /><br />
							<p class="subheading score2">BEST MOVES</p>
							<table class="movetable"><tbody><tr v-for="(word, wordIndex) in bestMoves" :class="'score' + word[2]">
								<td v-if="word[2] == 7" style="text-align: left">
									<span v-for="(item,i) in word[0].split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{word[0][i]}}</span>
								</td>
								<td v-else :class="'score' + word[2]" style="text-align: left">{{word[0]}}</td>
								<td v-if="word[2] == 7" style="text-align: right"><span v-for="(item,i) in word[1].toString().split('')" :class="'score' + ([1,4,2,0,3].indexOf(i-Math.floor(Math.log10(word[1])-99)%5)+1)">{{word[1].toString()[i]}}</span></td>
								<td v-else :class="'score' + word[2]" style="text-align: right">{{word[1]}}</td>
							</tr></tbody></table>
						</div>
						<div class="modal-footer">
							<span v-if="userID == null">
								<button type="button" class="btn btn-secondary button3" data-bs-dismiss="modal" @click="openLoginModal()">Log In to Save Results</button>
								<a class="ms-3" href="index.php"><button type="button" class="btn btn-secondary button2">Home</button></a>
							</span>
							<a v-else href="leaderboard.php"><button type="button" class="btn btn-secondary button3">Continue</button></a>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade loginmodal" id="loginModal" tabindex="-1" role="dialog" data-bs-theme="light" data-bs-backdrop="static" data-bs-keyboard="false">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-body">
							<p class="levelheading">LOG IN</p>
							<br />
							<p class="formheading subheading">Username</p>
							<input class="form-control score3" type="text" name="username" id="username" /><br />
							<p class="formheading subheading">Password</p>
							<input class="form-control score3" type="password" name="password" id="password" /><br />
							<p class="formheading" v-if="loginError === 1">Login information is incorrect; please try again!</p>
							<button class="btn btn-secondary button3" type="submit" @click="login()">Log In</button>
						</div>
						<div class="modal-footer">
							<p style="text-align: right">Don't have an account? <a class="signuplink score1" href="#" data-bs-dismiss="modal" @click="openSignupModal()">Click here to sign up!</a><br />No email address required.</p>
							<p>Or, <a class="loginlink score4" href="index.php">click here to return to the home page.</a></p>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade signupmodal" id="signupModal" tabindex="-1" role="dialog" data-bs-theme="light" data-bs-backdrop="static" data-bs-keyboard="false">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-body">
							<p class="levelheading">SIGN UP</p>
							<br />
							<p class="formheading subheading">Username</p>
							<p class="formheading" v-if="loginError === 2">Username is taken; please choose a different one!</p>
							<input class="form-control score1" type="text" name="username" id="username_signup" /><br />
							<p class="formheading subheading">Password</p>
							<input class="form-control score1" type="password" name="password" id="password_signup" /><br />
							<button class="btn btn-secondary button1" type="submit" @click="signup()">Sign Up</button>
						</div>
						<div class="modal-footer">
							<p>Already have an account? <a class="loginlink score3" href="#" data-bs-dismiss="modal" @click="openLoginModal()">Click here to log in!</a></p>
							<p>Or, <a class="loginlink score4" href="index.php">click here to return to the home page.</a></p>
						</div>
					</div>
				</div>
			</div>
			
			<div class="row align-items-center">
				<div class="col col-lg-4 col-md-3 col-sm-0 align-self-stretch">
					<table class="movetable"><tbody>
						<tr><th class="subheading">LEVEL {{level}}</th></tr>
					</tbody></table>
					<br />
					<table class="movetable"><tbody>
						<tr><th colspan="2" class="subheading">PREVIOUS MOVES</th></tr>
						<tr v-for="(word, wordIndex) in prevMoves">
							<td v-if="word[2] == 7" style="text-align: left">
								<span v-for="(item,i) in word[0].split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{word[0][i]}}</span>
							</td>
							<td v-else :class="'score' + word[2]" style="text-align: left">{{word[0]}}</td>
							<td v-if="word[2] == 7" style="text-align: right"><span v-for="(item,i) in word[1].toString().split('')" :class="'score' + ([1,4,2,0,3].indexOf(i-Math.floor(Math.log10(word[1])-99)%5)+1)">{{word[1].toString()[i]}}</span></td>
							<td v-else :class="'score' + word[2]" style="text-align: right">{{word[1]}}</td>
						</tr>
						<tr v-for="i in (maxStatLength-prevMoves.length)">
							<td>&nbsp;</td>
						</tr>
					</tbody></table>
					<br />
					<table class="movetable"><tbody>
						<tr><th colspan="2" class="subheading">BEST MOVES</th></tr>
						<tr v-for="(word, wordIndex) in bestMoves" :class="'score' + word[2]">
							<td v-if="word[2] == 7" style="text-align: left">
								<span v-for="(item,i) in word[0].split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{word[0][i]}}</span>
							</td>
							<td v-else :class="'score' + word[2]" style="text-align: left">{{word[0]}}</td>
							<td v-if="word[2] == 7" style="text-align: right"><span v-for="(item,i) in word[1].toString().split('')" :class="'score' + ([1,4,2,0,3].indexOf(i-Math.floor(Math.log10(word[1])-99)%5)+1)">{{word[1].toString()[i]}}</span></td>
							<td v-else :class="'score' + word[2]" style="text-align: right">{{word[1]}}</td>
						</tr>
						<tr v-for="i in (maxStatLength-prevMoves.length)">
							<td>&nbsp;</td>
						</tr>
					</tbody></table>
				</div>
				<div class="col col-lg-4 col-md-6 col-sm-12 align-self-stretch">
					<table class="mobiletable d-sm-table d-md-none"><tbody>
						<tr>
							<td class="subheading w-50">LEVEL {{level}}</td>
							<td v-if="bonusWord !== ''" rowspan="2">
								<p class="subheading">BONUS WORD</p>
								<p class="bonusword">{{ bonusWord }}</p>
							</td>
							<td rowspan="2">
								<p class="subheading">BANKED</p>
								<div :class="'tile ' + (bankedTile === '' ? '' : (bankedTile[1] !== '0' ? 'gemtile tile'+bankedTile[1] : ''))">
									<div class="fixed-height"><p>{{(bankedTile === '' ? "&nbsp;" : (bankedTile.length >= 4 && bankedTile[3] === 'M' ? '?' : bankedTile[0]))}}</p></div>
									<span class="tooltiptext" v-if="bankedTile !== '' && !['0','~','@'].includes(bankedTile[1])">{{gemTitles[bankedTile[1]]}}</span>
									<span class="tooltiptext" v-if="bankedTile.length >= 4 && ![' '].includes(bankedTile[3])">{{gemTitles[bankedTile[3]]}}</span>
								</div>
							</td>
						</tr>
						<tr>
							<td class="subheading">SCORE:  {{totalScore}}</td>
						</tr>
					</tbody></table>
				
					<p v-if="gameOver" class="subheading">GAME OVER</p>
					<p v-else-if="lastMoveGem == 7 && lastMoveScore > 0" :class="'subheading moveScore score' + lastMoveGem">
						<span v-for="(item,i) in ('+' + lastMoveScore.toString()).split('')" :class="'score' + ([1,4,2,0,3].indexOf(i%5)+1)">{{('+' + lastMoveScore.toString())[i]}}</span>
					</p>
					<p v-else :class="'subheading moveScore score' + lastMoveGem">{{ lastMoveScore > 0 ? '+' + lastMoveScore : '&nbsp;' }}</p>
					<br />
					<table class="overhead">
						<tr v-for="(row, rowIndex) in nextBlock">
							<td :class="'tile ' + (tile === '' ? 'emptytile' : (tile[1] !== '0' ? 'gemtile tile'+tile[1] : '') + ' ' + (tile.length >= 4 ? 'tile' + tile[3] : ''))" v-for="(tile, colIndex) in row">
								<div class="fixed-height"><p>{{(tile.length >= 4 && tile[3] === 'M' ? '?' : tile[0])}}</p></div>
								<span class="tooltiptext" v-if="tile !== '' && !['0','~','@'].includes(tile[1])">{{gemTitles[tile[1]]}}</span>
								<span class="tooltiptext" v-if="tile.length >= 4 && ![' '].includes(tile[3])">{{gemTitles[tile[3]]}}</span>
							</td>
						</tr>
					</table>
					<br />
					<table :class="'box' + (isFlipping ? ' gridflip' : '') + (turnsCloaked > 0 ? ' gridcloaked' : '')">
						<tr v-for="(row, rowIndex) in grid">
							<td :class="'tile ' + (tile === '' ? 'emptytile' : ((tile[1] !== '0' ? (tile[1] === '~' ? 'gemspin' : (tile[1] === '@' ? 'warpspin' : (tile.length < 4 || !['W'].includes(tile[3]) ? 'gemtile tile'+tile[1] : ''))) : '') + ' ' + (tile.length >= 4 ? 'tile' + tile[3] : '') + ' ' + (tile[2] === 'X' ? 'vanquishX' : (tile[2] === 'Y' ? 'vanquishY' : (tile[2] === 'Z' ? 'vanquishZ' : '')))))" v-for="(tile, colIndex) in row">
								<div class="fixed-height"><p>{{tile[0]}}</p></div>
								<span class="tooltiptext" v-if="tile !== '' && turnsCloaked === 0 && !['0','~','@'].includes(tile[1])">{{gemTitles[tile[1]]}}</span>
								<span class="tooltiptext" v-if="tile.length >= 4 && turnsCloaked === 0 && !['M',' '].includes(tile[3])">{{gemTitles[tile[3]]}}</span>
							</td>
						</tr>
					</table>
				</div>
				<div class="col col-lg-4 col-md-3 col-sm-0 d-flex align-self-stretch">
					<table class="sidebartable"><tbody>
						<tr>
							<td>
								<p class="subheading">SCORE</p><p class="subheading">{{totalScore}} <span class="levelupScore">{{(level >= levelThresholds.length ? '' : '/ ' + levelThresholds[level])}}</span></p>
							</td>
						</tr>
						<tr>
							<td>
								<p class="subheading">LETTERS DROPPED</p><p class="subheading">{{totalLettersDropped}}</p>
							</td>
						</tr>
						<tr>
							<td>
								<p class="subheading">WORDS FORMED</p><p class="subheading">{{totalWordsMade}}</p>
							</td>
						</tr>
						<tr>
							<td>
								<p class="subheading">BANKED</p>
								<div :class="'tile ' + (bankedTile === '' ? '' : (bankedTile === '' ? 'emptytile' : ((bankedTile[1] !== '0' ? (bankedTile.length < 4 || !['W'].includes(bankedTile[3]) ? 'gemtile tile'+bankedTile[1] : '') : '') + ' ' + (bankedTile.length >= 4 ? 'tile' + bankedTile[3] : ''))))">
									<div class="fixed-height"><p>{{(bankedTile === '' ? "&nbsp;" : (bankedTile.length >= 4 && bankedTile[3] === 'M' ? '?' : bankedTile[0]))}}</p></div>
									<span class="tooltiptext" v-if="bankedTile !== '' && !['0','~','@'].includes(bankedTile[1])">{{gemTitles[bankedTile[1]]}}</span>
									<span class="tooltiptext" v-if="bankedTile.length >= 4 && ![' '].includes(bankedTile[3])">{{gemTitles[bankedTile[3]]}}</span>
								</div>
							</td>
						</tr>
						<tr v-if="bonusWord !== ''">
							<td>
								<p class="subheading">BONUS WORD</p>
								<p class="bonusword">{{ bonusWord }}</p>
							</td>
						</tr>
					</tbody></table>
				</div>
			</div>
			<div id="mobilebuttons" class="mobilebuttons">
				<button type="button" class="btn btn-secondary buttonLeft subheading" @click="handleKeyDown('ArrowLeft')">&lt;</button>
				<button type="button" class="btn btn-secondary buttonDown subheading" @click="handleKeyDown('ArrowDown')">DROP</button>
				<button type="button" class="btn btn-secondary buttonRight subheading" @click="handleKeyDown('ArrowRight')">&gt;</button>
				<button type="button" class="btn btn-secondary buttonBank subheading" @click="handleKeyDown('ArrowUp')">BANK</button>
			</div>
			<br />
		</div>
	</div>`
}