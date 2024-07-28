import React, { useState, useEffect, useRef } from 'react';
import './Game.css';

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = () => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
};

const checkWin = (board) => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (checkDirection(board, row, col, 0, 1) ||
          checkDirection(board, row, col, 1, 0) ||
          checkDirection(board, row, col, 1, 1) ||
          checkDirection(board, row, col, 1, -1)) {
        return board[row][col];
      }
    }
  }
  return null;
};

const checkDirection = (board, row, col, rowDir, colDir) => {
  const player = board[row][col];
  if (!player) return false;
  for (let i = 1; i < 4; i++) {
    const newRow = row + rowDir * i;
    const newCol = col + colDir * i;
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol] !== player) {
      return false;
    }
  }
  return true;
};

const Game = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState('Red');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const redAudioRef = useRef(null);
  const yellowAudioRef = useRef(null);

  const playSound = (player) => {
    if (player === 'Red') {
      redAudioRef.current.play();
    } else {
      yellowAudioRef.current.play();
    }
  };

  const onRedWin = () => {
    console.log("Red wins! Perform custom action here.");
  };

  const handleClick = (col) => {
    if (winner || currentPlayer === 'Yellow') return;

    const newBoard = board.map(row => row.slice());
    let row = ROWS - 1;
    while (row >= 0 && newBoard[row][col]) {
      row--;
    }

    if (row >= 0) {
      newBoard[row][col] = currentPlayer;
      setLastMove({ row, col });
      setBoard(newBoard);
      
      playSound('Red');

      const newWinner = checkWin(newBoard);
      setWinner(newWinner);
      setCurrentPlayer('Yellow');
    }
  };

  const findBestMove = (board) => {
    // Check for winning move
    for (let col = 0; col < COLS; col++) {
      const newBoard = board.map(row => row.slice());
      let row = ROWS - 1;
      while (row >= 0 && newBoard[row][col]) {
        row--;
      }
      if (row >= 0) {
        newBoard[row][col] = 'Yellow';
        if (checkWin(newBoard) === 'Yellow') {
          return col;
        }
      }
    }

    // Block opponent's winning move
    for (let col = 0; col < COLS; col++) {
      const newBoard = board.map(row => row.slice());
      let row = ROWS - 1;
      while (row >= 0 && newBoard[row][col]) {
        row--;
      }
      if (row >= 0) {
        newBoard[row][col] = 'Red';
        if (checkWin(newBoard) === 'Red') {
          return col;
        }
      }
    }

    // Choose center column if available
    const centerCol = 3;
    if (!board[0][centerCol]) {
      return centerCol;
    }

    // Prefer columns that are part of a winning strategy
    const winningMoves = [centerCol];
    for (let col = 0; col < COLS; col++) {
      if (!board[0][col] && col !== centerCol) {
        winningMoves.push(col);
      }
    }

    return winningMoves[Math.floor(Math.random() * winningMoves.length)];
  };

  useEffect(() => {
    if (winner === 'Red') {
      onRedWin();
    }
  }, [winner]);

  useEffect(() => {
    if (currentPlayer === 'Yellow' && !winner) {
      const botMove = () => {
        const newBoard = board.map(row => row.slice());
        const col = findBestMove(newBoard);

        let row = ROWS - 1;
        while (row >= 0 && newBoard[row][col]) {
          row--;
        }

        if (row >= 0) {
          newBoard[row][col] = 'Yellow';
          setLastMove({ row, col });
          setBoard(newBoard);
          
          playSound('Yellow');

          const newWinner = checkWin(newBoard);
          setWinner(newWinner);
          setCurrentPlayer('Red');
        }
      };

      const timer = setTimeout(botMove, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, winner]);

  return (
    <div className="board-container">
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className="cell" onClick={() => handleClick(colIndex)}>
                <div className={`disc ${cell} ${lastMove && lastMove.row === rowIndex && lastMove.col === colIndex ? 'drop' : ''}`}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {winner && (
      <h2 style={{ color: winner === 'Red' ? 'red' : 'yellow' }}>{winner} wins!</h2>)}
      <audio ref={redAudioRef} src="sound/coin_drop.mp3" />
      <audio ref={yellowAudioRef} src="sound/coin_drop.mp3" />
    </div>
  );
};

export default Game;
