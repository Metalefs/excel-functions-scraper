# scrape-excell-functions

Will search for updated list of all excel functions and save them to _links.json file in following format:
`
{
	"name": "Função ABS",
	"link": "/pt-br/office/fun%C3%A7%C3%A3o-abs-3420200f-5628-4e8c-99da-c99d7c87713c",
	"type": "Math and trigonometry:",
	"description": "Retorna o valor absoluto de um número. Esse valor é o número sem o seu sinal.",
	"syntax": {
		"code": "ABS(núm)",
		"arguments": ["Número    Obrigatório. O número real cujo valor absoluto você deseja obter."]
	},
	"example": {
		"formula": "=ABS(A2) undefined",
		"description": "Valor absoluto de -4 undefined",
		"result": "4 undefined"
	}
}
`
