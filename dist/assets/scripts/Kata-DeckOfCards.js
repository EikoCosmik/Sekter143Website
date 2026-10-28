import * as KT from "./KataToolKit_Single.js";

export class deckOfCards
{
	constructor()
	{
		this.deck = [];
		this.suits = ["S", "C", "H", "D"];
		this.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

		this.resetDeck();
	}

	resetDeck()
	{
		this.deck = [];

		for(let i = 0; i < this.suits.length; i++)
		{
			const suit = this.suits[i];

			for (let j = 0; j < this.ranks.length; j++)
			{
				this.deck.push({ suit: suit, rank: this.ranks[j], faceUp: true })
			}
		}
	}

	draw()
	{
		return this.deck.pop();
	}

	shuffle()
	{
		KT.fYScramble(this.deck);
	}

	getCardElement(card, hand)
	{
		const newCard = document.createElement("div");
		newCard.className = `playingCard`;
		newCard.style.zIndex = `${hand.length + 10}`;

		if(card.faceUp)
		{
			const innerCard = document.createElement("div");
			innerCard.className = `innerCard suit${card.suit} rank${card.rank}`;

			//------------------------------------------------------------------------------------------------

			const tlSuit = document.createElement("div");
			tlSuit.className = `tlSuit ${card.suit}`;
			innerCard.append(tlSuit);

			const brSuit = document.createElement("div");
			brSuit.className = `brSuit ${card.suit}`;
			innerCard.append(brSuit);

			//------------------------------------------------------------------------------------------------

			const tlRank = document.createElement("div");
			tlRank.className = `tlRank ${card.rank}`;
			tlRank.innerHTML = card.rank;
			innerCard.append(tlRank);

			const brRank = document.createElement("div");
			brRank.className = `brRank ${card.rank}`;
			brRank.innerHTML = card.rank;
			innerCard.append(brRank);

			//------------------------------------------------------------------------------------------------

			const centerImage = document.createElement("div");
			centerImage.className = "centerImage";
			for (let i = 0; i < this.rankToVal(card.rank); i++)
			{
				const imgBit = document.createElement("div");
				imgBit.className = `img${i}`;
				centerImage.append(imgBit);
			}
			innerCard.append(centerImage);
			newCard.append(innerCard);
		}
		else newCard.classList.add("faceDown");

		return newCard;
	}

	rankToVal(rank)
	{
		switch (rank)
		{
			case "A":
			case "K":
			case "Q":
			case "J":
				return 1;
			default:
				return parseInt(rank);
		}
	}
}