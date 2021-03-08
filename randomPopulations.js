const POPULATION_QTY = 100
const BOARD_SIZE = 8
const ALGORITHM_RUNS = 100
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

var count = 0
var condition = true
var timeAverage = 0
var maxTime = 0
var minTime = 30000

while (count < ALGORITHM_RUNS) {
    var timeIn = new Date()
    var condition = true
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
    }
    var timeOut = new Date()
    timeAverage += timeOut - timeIn
    maxTime = Math.max(timeOut - timeIn, maxTime)
    minTime = Math.min(timeOut - timeIn, minTime)
    count++
    console.log(count, maxTime, minTime, (timeAverage / count).toFixed(2))
}

console.log(timeAverage, timeAverage / ALGORITHM_RUNS)