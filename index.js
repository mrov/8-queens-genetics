const POPULATION_QTY = 1000
const BOARD_SIZE = 8
const ALGORITHM_RUNS = 1000
const GENE_MUTATION_RATE = 30
const FITNESS_THRESHOLD = 4

// Vai ver quantas colisões tem para determinado board
// Idealmente as rainhas nunca estarão na mesma coluna, ja que cada indice é uma coluna
function fitnessMeasure(board) {
    var colisions = 0
    // para cada rainha eu tenho que analisar se há colisões do tipo diagonal ou na mesma linha
    board.forEach((queenRow, queenColumn) => {
        for (let nextQueenColumn = queenColumn+1; nextQueenColumn < board.length; nextQueenColumn++) {
            const nextQueenRow = board[nextQueenColumn];
            // Se estiverem na mesma linha...
            if (queenRow === nextQueenRow) { colisions++ }
            // Se a soma e i + j de uma rainha for igual a soma do i + j de outra rainha elas estão na mesma diagonal a direita
            // a subtração indica mesma diagonal a esquerda
            if (queenRow + queenColumn === nextQueenRow + nextQueenColumn ||
                queenRow - queenColumn === nextQueenRow - nextQueenColumn) { colisions++ }
        }
    });
    return colisions
}

// Seto a porcentagem de genes que quero mutar aleatóriamente
function mutateGenes (newPopulation) {
    // console.log(newPopulation)
    var mutatedPopulation = newPopulation.map((board, boardIndex) => {
        // Calcular quantos genes deve ser alterados nessa mutação dado a porcentagem
        var mutatedBoard = [...board]
        var genesLength = board.length
        var mutateGenesQty = Math.round(genesLength * (GENE_MUTATION_RATE / 100))
        // Alterar os genes aleatoriamente
        for (let i = 0; i < mutateGenesQty; i++) {
            // Coluna e linha, o gene é a linha e o index é a coluna
            var mutatedGene = Math.floor(Math.random() * BOARD_SIZE)
            var randomIndex = Math.floor(Math.random() * BOARD_SIZE)
            mutatedBoard[randomIndex] = mutatedGene
        }
        // console.log(board, mutatedBoard)
        return mutatedBoard
    });
    // console.log('aaaaaaaaaaaaaaaaa', mutatedPopulation)
    return mutatedPopulation
}

// Gera um board aleatório
function generateRandom () {
    var board = []
    for (let queen = 0; queen < BOARD_SIZE; queen++) {
        board.push(Math.floor(Math.random() * BOARD_SIZE))
    }
    return board
}

// Criar uma matriz de fitness para a população atual e selecionar os melhores e descartar os piores dado um determinado limiar
function selectParentsByFitness (currentPopulation, fitnessList) {
    var selectedParents = []
    for (let boardIndex = 0; boardIndex < currentPopulation.length; boardIndex++) {
        if (fitnessList[boardIndex] <= FITNESS_THRESHOLD) {
            selectedParents.push(currentPopulation[boardIndex])
        }
    }
    // dado a quantidade de pais escolhidos, vou preencher o resto da população com seres aleatórios
    var restToPopulate = POPULATION_QTY - selectedParents.length
    for (let i = 0; i < restToPopulate; i++) {
        selectedParents.push(generateRandom())        
    }
    return selectedParents
}



// Vou receber os N pais e vou fazer um crossover deles, pegando 70% do de maior fitness e 30% do de menor dos 2
function makeCrossover (parentsGenotipes) {
    var newBoard = []
    // console.log(parentsGenotipes)
    var firstParentPercentageIndex = Math.round(parentsGenotipes[0].length * (0.7))
    var secondParentPercentageIndex = Math.round(parentsGenotipes[1].length * (0.3))
    var firstPart = parentsGenotipes[0].slice(0, firstParentPercentageIndex)
    var secondPart = parentsGenotipes[1].slice(firstParentPercentageIndex)
    var crossOver = firstPart.concat(secondPart)
    return crossOver
}

function populationCrossOver (selectedParents) {
    var crossOveredPopulation = []
    for (let i = 0; i < POPULATION_QTY; i++) {
        var parentsToCross = []
        var firstRandomIndex = Math.round(Math.random() * (selectedParents.length - 1))
        var secondRandomIndex = Math.round(Math.random() * (selectedParents.length - 1))
        parentsToCross.push(selectedParents[firstRandomIndex])
        parentsToCross.push(selectedParents[secondRandomIndex])
        crossOveredPopulation.push(makeCrossover(parentsToCross))
    }
    return crossOveredPopulation
}

// makeCrossover([[2,3,5,4,0,1,6,7], [0,5,4,3,6,7,1,2]])

// Controladores de execução e de tempo
var count = 0
var condition = true
var timeAverage = 0
var maxTime = 0
var minTime = 30000

while (count < ALGORITHM_RUNS) {
    var timeIn = new Date()
    var condition = true
    var populationList = []
    // Criar a primeira geração
    for (let population = 0; population < POPULATION_QTY; population++) {
        populationList.push(generateRandom())
    }
    // Roda aleatoriamente até achar a solução
    while (condition) {
        var fitnessList = []
        populationList.forEach((board, boardIndex) => {
            fitnessList.push(fitnessMeasure(board))
            if (fitnessList[boardIndex] === 0) {
                // console.log(board)
                condition = false
            }
        });

        if (condition) {
            var selectedParents = selectParentsByFitness(populationList, fitnessList)
            // console.log('Pais selecionados: ', selectedParents.length)
            var crossOveredPopulation = populationCrossOver(selectedParents)
            populationList = mutateGenes(crossOveredPopulation)
        }
        // console.log(fitnessList)
    }
    var timeOut = new Date()
    timeAverage += timeOut - timeIn
    maxTime = Math.max(timeOut - timeIn, maxTime)
    minTime = Math.min(timeOut - timeIn, minTime)
    count++
    console.log(count, maxTime, minTime, (timeAverage / count).toFixed(2))
}

console.log(timeAverage, timeAverage / ALGORITHM_RUNS)