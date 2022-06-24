import "./App.css"
import * as GLOBALS from "./Globals.js"
import React, { useState } from "react"
import ReactDOM from "react-dom"
let GAME_NUMBER = 0

function GameBoard(GAME_NUMBER) {
  return (
    <div className="GAME" id="GAME">
      <div class="start" id="start">
        <button
          id="startBtn"
          onClick={() => {
            startGame(GAME_NUMBER)
          }}
        >
          Start
        </button>
        <div className="select" id="select">
          <select id="selectNum">
            <option value="5">5x5</option>
            <option value="7">7x7</option>
            <option value="10">10x10</option>
          </select>
        </div>
      </div>
      <div id="main">
        <div id="board"></div>
        <div id="buttons"></div>
      </div>
    </div>
  )
}

function startGame(GAME_NUMBER) {
  const array = CreateArray()
  const gameState = {
    array,
    isGameOver: false,
    gameMessage: "",
    GAME_NUMBER
  }
  setPositions(array)
  console.log(array)
  DrawBoard(gameState)
  createButtons()
  const buttons = document.querySelectorAll(`#buttons`)
  for (let button of buttons) {
    button.addEventListener("click", function (event) {
      eventMove(gameState, event.target.id)
    })
  }
}
function eventMove(gameState, step) {
  rabbitStep(gameState, step)
  //message(gameState)
  DrawBoard(gameState)
}
function getRabbitNearCell(cell, step) {
  const [x, y] = cell
  let index = []
  if (step === "left") {
    index = [x, y - 1]
  } else if (step === "up") {
    index = [x - 1, y]
  } else if (step === "right") {
    index = [x, y + 1]
  } else if (step === "down") {
    index = [x + 1, y]
  }
  return index
}

function rabbitStep(gameState, step) {
  if (gameState.isGameOver === false) {
    const listOfIndexes = getCurrentDir(gameState.array, GLOBALS.RABBIT_CELL)[0]
    const nearCell = getRabbitNearCell(listOfIndexes, step)
    moveRabbit(gameState, nearCell, listOfIndexes)
  }
}
function isInRange([x, y], array) {
  if (x !== array.length && x >= 0 && y !== array.length && y >= 0) {
    return true
  }
}
function getCurrentDir(array, character) {
  const getFromArray = function (acc, row, i) {
    row.forEach((item, j) => {
      if (item === character) {
        acc.push([i, j])
      }
    })
    return acc
  }
  return array.reduce(getFromArray, [])
}

function moveRabbit(gameState, [newX, newY], [oldX, oldY]) {
  const array = gameState.array
  let x = ""
  let y = ""
  if (isInRange([newX, newY], array)) {
    ;[x, y] = [newX, newY]
  } else {
    ;[x, y] = getRabbitJumpCoord(array, [newX, newY], [oldX, oldY])
  }
  moveRabbitToNewDirection(gameState, [x, y], [oldX, oldY])
}

function getRabbitJumpCoord(array, [newX, newY], [oldX, oldY]) {
  let coord = ""
  if (newX === -1) {
    coord = [array.length - 1, oldY]
  } else if (newY === -1) {
    coord = [oldX, array.length - 1]
  } else if (newX === array.length) {
    coord = [0, oldY]
  } else if (newY === array.length) {
    coord = [oldX, 0]
  }
  return coord
}

function moveRabbitToNewDirection(gameState, [newX, newY], [oldX, oldY]) {
  //iswin(gameState, [newX, newY])
  if (
    gameState.isGameOver === false &&
    gameState.array[newX][newY] !== GLOBALS.FENCE_CELL
  ) {
    gameState.array[newX][newY] = GLOBALS.RABBIT_CELL
    gameState.array[oldX][oldY] = GLOBALS.EMPTY_CELL
  }
}

function DrawBoard(gameState) {
  const array = gameState.array
  const board = document.getElementById(`board`)
  const width = array.length * 60 + 2 * array.length
  board.style.width = `${width}px`
  board.style.height = `${width}px`
  const divs = []
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      const id = `${i}${j}`
      const src = generateImgSrc(array[i][j])
      if (src !== "") {
        divs.push(
          <div className="box" id={id}>
            <img src={src} alt="pic" />
          </div>
        )
      } else {
        divs.push(<div className="box" id={id}></div>)
      }
    }
  }
  ReactDOM.render(divs, board)
}

function createButton(step) {
  return <button id={step}>{step}</button>
}

function createButtons() {
  const ButtonsDiv = document.getElementById(`buttons`)
  const buttons = []
  buttons.push(createButton("up"))
  buttons.push(createButton("left"))
  buttons.push(createButton("down"))
  buttons.push(createButton("right"))
  ReactDOM.render(buttons, ButtonsDiv)
}

function generateImgSrc(coord) {
  let src = ""
  if (coord === GLOBALS.RABBIT_CELL) {
    src = "images/rabbit.png"
  }
  if (coord === GLOBALS.FENCE_CELL) {
    src = "images/fence.png"
  }
  if (coord === GLOBALS.HOME_CELL) {
    src = "images/home.png"
  }
  if (coord === GLOBALS.WOLF_CELL) {
    src = "images/wolf.png"
  }
  return src
}

function setPositions(array) {
  const wolfCount = Math.ceil(array.length * GLOBALS.WOLF_PROCENT)
  const fenceCount = Math.ceil(array.length * GLOBALS.FENCE_PROCENT)
  setRabbitPosition(array)
  setHomePosition(array)
  for (let i = 0; i < wolfCount; i++) {
    setWolfPosition(array)
  }
  for (let i = 0; i < fenceCount; i++) {
    setFencePosition(array)
  }
}

function setRabbitPosition(array) {
  setIndexes("rabbit", array)
}
function setHomePosition(array) {
  setIndexes("home", array)
}
function setWolfPosition(array) {
  setIndexes("wolf", array)
}
function setFencePosition(array) {
  setIndexes("fence", array)
}

function setIndexes(characterName, array) {
  const x = Math.floor(Math.random() * array.length)
  const y = Math.floor(Math.random() * array.length)

  if (array[x][y] === GLOBALS.EMPTY_CELL) {
    const element = GLOBALS.character.find(
      (item) => item.name === characterName
    )
    array[x][y] = element.num
  } else {
    setIndexes(characterName, array)
  }
}

function CreateArray() {
  const arraySize = parseInt(document.getElementById("selectNum").value)
  const array = new Array(arraySize)
    .fill(GLOBALS.EMPTY_CELL)
    .map(() => new Array(arraySize).fill(GLOBALS.EMPTY_CELL))
  return array
}

function App() {
  const [board, setBoard] = useState("")
  return (
    <div>
      <button
        id="newGame"
        onClick={() => {
          GAME_NUMBER++
          setBoard([...board, GameBoard(GAME_NUMBER)])
        }}
      >
        new Game
      </button>
      {board}
    </div>
  )
}

export default App
