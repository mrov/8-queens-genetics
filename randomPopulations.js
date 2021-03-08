const POPULATION_QTY = 100
const BOARD_SIZE = 8
const ALGORITHM_RUNS = 1000
const GENE_MUTATION_RATE = 40

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

// Controladores de execução e de tempo e contador de geração
var count = 0
var condition = true
var timeAverage = 0
var maxTime = 0
var minTime = 30000
var MIN_GENERATIONS = 100000000
var MAX_GENERATIONS = 0
var AVG_GENERATIONS_UNTIL_CONVERGE = 0

while (count < ALGORITHM_RUNS) {
    var timeIn = new Date()
    var condition = true
    var GENERATIONS_UNTIL_CONVERGE = 0
    // Roda aleatoriamente até achar a solução
    while (condition) {
        var populationList = []
        // Criar a primeira geração
        for (let population = 0; population < POPULATION_QTY; population++) {
            var board = []
            for (let queen = 0; queen < BOARD_SIZE; queen++) {
                board.push(Math.round(Math.random() * BOARD_SIZE))
            }
            populationList.push(board)
        }

        // console.log(populationList)

        populationList.forEach(board => {
            if (fitnessMeasure(board) < 1) {
                // console.log(board)
                condition = false
            }
        });
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
    Tempo médio de execução até agora: ${(timeAverage / count).toFixed(2)} \n`)
}

console.log(`  Numero de execuções: ${count}, Numero Maximo de gerações: ${MAX_GENERATIONS}, Numero Minimo de gerações: ${MIN_GENERATIONS},
    Gerações até convergir (Média): ${AVG_GENERATIONS_UNTIL_CONVERGE / ALGORITHM_RUNS}, Tempo maximo de execução: ${maxTime}, Tempo minimo de exercução: ${minTime},
    Tempo médio de execução: ${timeAverage / ALGORITHM_RUNS} \n`)