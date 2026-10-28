import { deckOfCards } from "./Kata-DeckOfCards.js";

const delay = ms => new Promise(res => setTimeout(res, ms));

class Player
{
	constructor(tag, deckRef)
	{
		this.deckReference = deckRef;
		this.hand = [];
		this.element = document.getElementById(`${tag}Hand`);
		this.element.innerHTML = "";
		this.score = 0;
		this.dataElement = document.getElementById(`${tag}Score`);

		this.dataElement.innerHTML = this.score;
	}

	addCard(drawn)
	{
		this.hand.push(drawn);
		this.calcScore();
	}

	renderCards()
	{
		this.element.innerHTML = "";
		for (let i = 0; i < this.hand.length; i++)
		{
			const newCard = this.deckReference.getCardElement(this.hand[i], this.hand);
			this.element.append(newCard);		
		}
		if (this.hand.length > 1) this.element.classList.add("hasMultipleCards");
		this.element.setAttribute("cardCount", this.hand.length);	
	}

	calcScore()
	{
		this.score = 0;

		let aces = 0;

		for (let i = 0; i < this.hand.length; i++)
		{
			const card = this.hand[i];

			if(card.faceUp == true)
			{
				switch (card.rank)
				{
					case "A":
						aces += true;
						break;
					case "K":
					case "Q":
					case "J":
						this.score += 10
						break;
					default:
						this.score += parseInt(card.rank);
						break;
				}
			}
		}

		for (let i = 0; i < aces; i++)
		{
			if(this.score + 11 <= 21) this.score += 11;
			else this.score += 1;
		}

		this.dataElement.innerHTML = this.score;
	}
}

export class BlackJack
{
	constructor()
	{
		this.deck = new deckOfCards();
		this.gameStateMsg = document.getElementById("gameStateMsg");
		this.popup = { title: document.getElementById("pcgPopupTitle"), content: document.getElementById("pcgPopupContent"), block: document.getElementById("plaingCardGamePopup"), button: document.getElementById("pcgPopupButton") };
		this.curPopupButtonAction = () => {	this.popup.block.style.display = "none"; }
		this.popup.title.innerHTML = `Welcome to Kata Blackjack!`
		this.popup.content.innerHTML = `Blackjack was the obvious first card game to build for Kata Card Games, its simple and relatively easy to implement.<br/>To win, get as close to 21 as possible without going over. Hit to get another card, Stand to stop getting cards. The dealer will then try draw cards to beat your score. Good luck!`;

		this.allowStand = false;
		this.allowHit = false;
		this.allowReset = true;

		this.setup();
	}

	setup()
	{
		if (!this.allowReset) return;
		this.allowReset = false;
		this.allowStand = false;
		this.allowHit = false;
		this.gameStateMsg.innerHTML = "Game Start<hr/>Player Turn";
		this.deck.resetDeck();
		this.deck.shuffle();
		this.player = new Player("player", this.deck);
		this.dealer = new Player("dealer", this.deck);
		this.draw(this.dealer);
		this.draw(this.dealer, false);
		this.draw(this.player);
		this.draw(this.player);
		this.player.renderCards();
		this.dealer.renderCards();
		this.allowStand = true;
		this.allowHit = true;
		this.allowReset = true;
	}

	draw(player, faceUp = true)
	{
		const drawn = this.deck.draw();
		drawn.faceUp = faceUp;
		player.addCard(drawn);
	}

	hit()
	{
		if (!this.allowHit) return;
		this.allowHit = false;
		this.allowReset = false;
		this.allowStand = false;

		this.draw(this.player);
		this.player.renderCards();

		if (this.player.score > 21) 
		{
			this.gameStateMsg.innerHTML = "BUST<hr/>Dealer Wins";
			this.allowHit = false;
			this.allowStand = false;
			this.allowReset = true;
			return;
		}

		this.allowHit = true;
		this.allowStand = true;
		this.allowReset = true;
	}
	
	async stand()
	{
		if (!this.allowStand) return;
		this.allowHit = false;
		this.allowStand = false;
		this.allowReset = false;

		for (let i = 0; i < this.dealer.hand.length; i++)
		{
			const card = this.dealer.hand[i];
			card.faceUp = true;
		}
		this.dealer.renderCards();
		this.dealer.calcScore();
		await delay(1000);

		while (this.dealer.score < 17)
		{
			this.draw(this.dealer);
			this.dealer.renderCards();
			await delay(1000);
		}

		if (this.dealer.score > 21)
		{
			this.gameStateMsg.innerHTML = "DEALER BUST<hr/>Player Wins";
		}
		else if(this.player.score > this.dealer.score)
		{
			this.gameStateMsg.innerHTML = "PLAYER CLOSER<hr/>Player Wins";
		}
		else if (this.player.score == this.dealer.score)
		{
			this.gameStateMsg.innerHTML = "TIE<hr/>Dealer Wins";
		}
		else
		{
			this.gameStateMsg.innerHTML = "DEALER CLOSER<hr/>Dealer Wins";
		}
		this.allowReset = true;
	}
}