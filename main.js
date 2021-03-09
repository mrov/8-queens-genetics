// Modificação grande desse algoritmo para os anteriores é que cada board, além do genótipo, ele será um objeto composto de genótipo e fitness e outras variantes
// Indv vai ser a abreviação para individuo nesse codigo
// Exemplo de Indv: { board: [boardSize], fitness: 0-colisões }
const POPULATION_QTY = 10
const BOARD_SIZE = 8
const ALGORITHM_RUNS = 1000
const GENE_MUTATION_RATE = 40
const FITNESS_EVALUATIONS_LIMIT = 10000
const FITNESS_THRESHOLD = 3
const RANKING_LENGTH = 5
const TOURNAMENT_PROBABILITY = .70

// Função para utilizar no sort
function compararFitness (a,b) {
    if (a.fitness < b.fitness) { return -1 }
    if (a.fitness > b.fitness) { return 1 }
    return 0
}

// Vai ver quantas colisões tem para determinado board
// Idealmente as rainhas nunca estarão na mesma coluna, ja que cada indice é uma coluna
function fitnessMeasure(board) {
    var colisions = 0
    Fitness_evaluations++
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
function mutateGenes (children) {
    // console.log(newPopulation)
    var mutatedPopulation = children.map((individual, boardIndex) => {
        // Calcular quantos genes deve ser alterados nessa mutação dado a porcentagem
        var mutatedBoard = [...individual.board]
        var genesLength = individual.board.length
        var mutateGenesQty = Math.round(genesLength * (GENE_MUTATION_RATE / 100))
        // Alterar os genes aleatoriamente
        for (let i = 0; i < mutateGenesQty; i++) {
            // Coluna e linha, o gene é a linha e o index é a coluna
            var mutatedGene = Math.floor(Math.random() * BOARD_SIZE)
            var randomIndex = Math.floor(Math.random() * BOARD_SIZE)
            mutatedBoard[randomIndex] = mutatedGene
        }
        // console.log(board, mutatedBoard)
        return { board: mutatedBoard, fitness: fitnessMeasure(mutatedBoard) }
    });
    // console.log('aaaaaaaaaaaaaaaaa', mutatedPopulation)
    return mutatedPopulation
}

function replaceWorse (currentPopulation, newChildren) {
    var _currentPopulation = currentPopulation

    // console.log('population: ' , _currentPopulation, 'Children: ', newChildren)
    newChildren.forEach((child, childIndex) => {
        var replaced = false
        for (let index = _currentPopulation.length - 1; (index >= 0 && !replaced); index--) {
            const element = _currentPopulation[index];
            if (element.fitness > child.fitness) { _currentPopulation[index] = child; replaced = true }
            // console.log(child.fitness, element.fitness)
        }
    });

    // _currentPopulation = _currentPopulation.splice(2, _currentPopulation.length-2)
    // _currentPopulation = _currentPopulation.concat(newChildren)
    return _currentPopulation
}

// Gera um board aleatório
function generateRandom () {
    var indv = { board: [], fitness: Math.pow(BOARD_SIZE, 2) }
    var board = []
    for (let queen = 0; queen < BOARD_SIZE; queen++) {
        board.push(Math.floor(Math.random() * BOARD_SIZE))
    }
    indv.board = board
    indv.fitness = fitnessMeasure(board)
    return indv
}

// Criar uma matriz de fitness para a população atual e selecionar os melhores e descartar os piores dado um determinado limiar
function selectParentsByFitness (currentPopulation) {
    return [currentPopulation[selectedParentsIndexes[0]].board, currentPopulation[selectedParentsIndexes[1]].board]
}


// A ideia aqui é selecionar 5 individuos da população e escolher os com melhor fitness
// Como a população ja vem ordenada do menor fitness para o maior só pegar os menores indices dos numeros aleatórios gerádos que serão os melhores dos 5
function selectParentsByRanking (currentPopulation) {
    var selectedParentsIndexes = []
    for (let index = 0; index < RANKING_LENGTH; index++) {
        var possibleParentIndex = Math.round(Math.random() * (currentPopulation.length - 1))
        selectedParentsIndexes.push(possibleParentIndex)
    }
    selectedParentsIndexes.sort()
    return [currentPopulation[selectedParentsIndexes[0]].board, currentPopulation[selectedParentsIndexes[1]].board]
}

// Algoritmo roleta para seleção dos parentes
function roulleteSelection (currentPopulation) {
    var fitnessTotal = 0
    var fullProb = 0
    var selectedParentsGenotipes = []
    currentPopulation.forEach(indv => {
        fitnessTotal += indv.fitness
    });
    for (let individuals = 0; individuals < 2; individuals++) {
        var r = Math.round(Math.random() * (fitnessTotal - 1))
        var acumulador = 0
        currentPopulation.forEach(indv => {
            acumulador += indv.fitness
            if (acumulador >= r) {
                selectedParentsGenotipes.push(indv.board)
            }
        });
    }
    return selectedParentsGenotipes
}

// Torneio
function tournamentSelection (currentPopulation) {
    
}

function cutAndCrossfill (parentsGenotipes) {
    var children = []
    // console.log(parentsGenotipes)
    var firstParentPercentageIndex = Math.round(parentsGenotipes[0].length * (0.7))
    var secondParentPercentageIndex = Math.round(parentsGenotipes[1].length * (0.3))
    var firstPart = parentsGenotipes[0].slice(0, firstParentPercentageIndex)
    var secondPart = parentsGenotipes[1].slice(firstParentPercentageIndex)
    var crossOver = firstPart.concat(secondPart)
    children.push({ board: crossOver, fitness: Math.pow(BOARD_SIZE, 2) })
    var firstPart = parentsGenotipes[1].slice(0, firstParentPercentageIndex)
    var secondPart = parentsGenotipes[0].slice(firstParentPercentageIndex)
    var crossOver = firstPart.concat(secondPart)
    children.push({ board: crossOver, fitness: Math.pow(BOARD_SIZE, 2) })
    return children
}


// Controladores de execução e de tempo e contador de geração
var count = 0
var notHasSolution = true
var timeAverage = 0
var maxTime = 0
var minTime = 30000
var MIN_GENERATIONS = 100000000
var MAX_GENERATIONS = 0
var AVG_GENERATIONS_UNTIL_CONVERGE = 0
var foundSolution = 0

while (count < ALGORITHM_RUNS) {
    var timeIn = new Date()
    var notHasSolution = true
    var populationList = []
    var GENERATIONS_UNTIL_CONVERGE = 0
    var Fitness_evaluations = 0
    // Criar a primeira geração
    for (let population = 0; population < POPULATION_QTY; population++) {
        populationList.push(generateRandom())
    }
    // Roda aleatoriamente até achar a solução
    while (notHasSolution && Fitness_evaluations < FITNESS_EVALUATIONS_LIMIT) {
        
        if (populationList.some(function (indv) { return indv.fitness === 0 })) {
            // console.log(indv)
            notHasSolution = false
            foundSolution++
        }

        // Sort Na população pelo fitness
        populationList = populationList.sort(compararFitness)

        if (notHasSolution) {
            // Retorna apenas o genótipo na selectParents
            // var selectedParentsGenotipes = selectParentsByFitness(populationList)
            // var selectedParentsGenotipes = selectParentsByRanking(populationList)
            var selectedParentsGenotipes = roulleteSelection(populationList)
            // Retorna ja um individuo com fitness muito alto na cutAndCrossfill
            var crossOveredChildren = cutAndCrossfill(selectedParentsGenotipes)
            // console.log('Pais selecionados: ', selectedParents.length)
            var mutatedChildren = mutateGenes(crossOveredChildren)
            // console.log('before: ', populationList, 'mutated: ', mutatedChildren)
            populationList = replaceWorse(populationList, mutatedChildren)
        }
        
        GENERATIONS_UNTIL_CONVERGE++
    }
    var timeOut = new Date()
    timeAverage += timeOut - timeIn
    maxTime = Math.max(timeOut - timeIn, maxTime)
    minTime = Math.min(timeOut - timeIn, minTime)
    MAX_GENERATIONS = Math.max(MAX_GENERATIONS, GENERATIONS_UNTIL_CONVERGE)
    MIN_GENERATIONS = Math.min(MIN_GENERATIONS, GENERATIONS_UNTIL_CONVERGE)
    AVG_GENERATIONS_UNTIL_CONVERGE += GENERATIONS_UNTIL_CONVERGE
    count++
    console.log(`   Execução N: ${count}, Numero Maximo de gerações: ${MAX_GENERATIONS}, Numero Minimo de gerações: ${MIN_GENERATIONS}
    Gerações até convergir: ${GENERATIONS_UNTIL_CONVERGE}, Tempo maximo de execução: ${maxTime}, Tempo minimo de exercução: ${minTime},
    Tempo médio de execução até agora: ${(timeAverage / count).toFixed(2)}, Avaliações de Fitness: ${Fitness_evaluations}, Encontrou solução: ${notHasSolution ? "Não" : "Sim"} \n`)
}

console.log(`  Numero de execuções: ${count}, Numero Maximo de gerações: ${MAX_GENERATIONS}, Numero Minimo de gerações: ${MIN_GENERATIONS},
    Gerações até convergir (Média): ${AVG_GENERATIONS_UNTIL_CONVERGE / ALGORITHM_RUNS}, Tempo maximo de execução: ${maxTime}, Tempo minimo de exercução: ${minTime},
    Tempo médio de execução: ${timeAverage / ALGORITHM_RUNS}, Encontrou ${foundSolution} Soluções \n`)