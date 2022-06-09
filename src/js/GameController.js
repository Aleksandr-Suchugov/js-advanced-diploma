import themes from './themes';
import Team from './Team';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import propIcons from './Characters/propIcons';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

let selectedCharacterIdx = 0;
let playerPositions = [];
let computerPositions = [];
let boardSize;
let allowedDistance;
let allowedDistanceAttack;
let allowedPosition;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentAction = 'player';
    this.selectedCharacter = {};
    this.selected = false;
    this.point = 0;
    this.level = 1;
    this.currentTheme = themes.prairie;
    this.blockedBoard = false;
    this.playerTeam = [];
    this.computerTeam = [];
    this.idx = 0;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.events();
    this.nextLevel();
  }

  events() {
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  nextLevel() {
    this.currentAction = 'player';
    if (this.level === 1) {
      this.playerTeam = Team.getStartPlayerTeam();
      this.computerTeam = generateTeam(Team.getComputerTeam(), 1, 2);
      this.addCharacterPosition(this.playerTeam, this.computerTeam);
    } else if (this.level === 2) {
      this.currentTheme = themes.desert;
      this.playerTeam = generateTeam(Team.getPlayerTeam(), 1, 1);
      this.computerTeam = generateTeam(
        Team.getComputerTeam(), 2, (this.playerTeam.length + playerPositions.length),
      );
      this.addCharacterPosition(this.playerTeam, this.computerTeam);
    } else if (this.level === 3) {
      this.currentTheme = themes.arctic;
      this.playerTeam = generateTeam(Team.getPlayerTeam(), 2, 2);
      this.computerTeam = generateTeam(
        Team.getComputerTeam(), 3, (this.playerTeam.length + playerPositions.length),
      );
      this.addCharacterPosition(this.playerTeam, this.computerTeam);
    } else if (this.level === 4) {
      this.currentTheme = themes.mountain;
      this.playerTeam = generateTeam(Team.getPlayerTeam(), 3, 2);
      this.computerTeam = generateTeam(
        Team.getComputerTeam(), 4, (this.playerTeam.length + playerPositions.length),
      );
      this.addCharacterPosition(this.playerTeam, this.computerTeam);
    } else {
      this.blockedBoard = true;
      GamePlay.showMessage(`Your score ${this.point}. Best score: ${this.maxPoints()}.`);
      return;
    }
    const characterPositions = this.getPositions(playerPositions.length);
    for (let i = 0; i < playerPositions.length; i += 1) {
      playerPositions[i].position = characterPositions.player[i];
      computerPositions[i].position = characterPositions.computer[i];
    }

    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions([...playerPositions, ...computerPositions]);
  }

  newGame() {
    this.blockedBoard = false;
    const maxPoint = this.maxPoints();
    const currentGameState = this.stateService.load();
    if (currentGameState) {
      currentGameState.maxPoint = maxPoint;
      this.stateService.save(GameState.from(currentGameState));
    }
    playerPositions = [];
    computerPositions = [];
    this.level = 1;
    this.point = 0;
    this.currentTheme = themes.prairie;
    this.nextLevel();
    GamePlay.showMessage('New Game Begins!');
  }

  saveGame() {
    const maxPoint = this.maxPoints();
    const currentGameState = {
      point: this.point,
      maxPoint,
      level: this.level,
      currentTheme: this.currentTheme,
      playerPositions: playerPositions,
      computerPositions: computerPositions,
    };
    this.stateService.save(GameState.from(currentGameState));
    GamePlay.showMessage('Game Saved!');
  }

  loadGame() {
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentTheme = loadGameState.currentTheme;
        playerPositions = loadGameState.playerPositions;
        computerPositions = loadGameState.computerPositions;
        this.gamePlay.drawUi(this.currentTheme);
        this.gamePlay.redrawPositions([...playerPositions, ...computerPositions]);
      }
      GamePlay.showMessage('Game loaded!');
    } catch (e) {
      console.log(e);
      GamePlay.showError('Loading failed!');
      this.newGame();
    }
  }

  async onCellClick(index) {
    // TODO: react to click
    this.idx = index;
    if (!this.blockedBoard) {
      if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
        GamePlay.showError('invalid action');
      } else if (this.getIndex([...playerPositions]) !== -1) {
        this.gamePlay.deselectCell(selectedCharacterIdx);
        this.gamePlay.selectCell(index);
        selectedCharacterIdx = index;
        this.selectedCharacter = [...playerPositions].find((item) => item.position === index);
        this.selected = true;
      } else if (!this.selected && this.getIndex([...computerPositions]) !== -1) {
        GamePlay.showError('Cannot choose this character!');
      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'pointer') {
        this.selectedCharacter.position = index;
        this.gamePlay.deselectCell(selectedCharacterIdx);
        this.gamePlay.deselectCell(index);
        this.selected = false;
        this.gamePlay.redrawPositions([...playerPositions, ...computerPositions]);
        this.currentAction = 'computer';
        this.computerStrategy();
      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair') {
        const thisAttackComputer = [...computerPositions].find((item) => item.position === index);
        this.gamePlay.deselectCell(selectedCharacterIdx);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        this.selected = false;
        await this.characterAttacker(this.selectedCharacter.character, thisAttackComputer);
        if (computerPositions.length > 0) {
          this.computerStrategy();
        }
      }
    }
  }

  getIndex(arr) {
    return arr.findIndex((item) => item.position === this.idx);
  }

  maxPoints() {
    let maxPoint = 0;
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        maxPoint = Math.max(loadGameState.maxPoint, this.point);
      }
    } catch (e) {
      maxPoint = this.point;
      console.log(e);
    }
    return maxPoint;
  }

  getPositions(length) {
    const position = { player: [], computer: [] };
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.player.includes(random));
      position.player.push(random);

      do {
        random = this.randomPosition(6);
      } while (position.computer.includes(random));
      position.computer.push(random);
    }
    return position;
  }

  randomPosition(column = 0) {
    return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + column));
  }

  levelUp() {
    for (const item of playerPositions) {
      const current = item.character;
      current.level += 1;
      current.attack = this.attackAndDefenceLevelUp(current.attack, current.health);
      current.defence = this.attackAndDefenceLevelUp(current.defence, current.health);
      current.health = (current.health + 80) < 100 ? current.health + 80 : 100;
    }
  }

  attackAndDefenceLevelUp(attackBefore, health) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - health / 100)));
  }

  addCharacterPosition(playersTeam, computersTeam) {
    for (let i = 0; i < playersTeam.length; i += 1) {
      playerPositions.push(new PositionedCharacter(playersTeam[i], 0));
    }
    for (let i = 0; i < computersTeam.length; i += 1) {
      computerPositions.push(new PositionedCharacter(computersTeam[i], 0));
    }
  }

  async characterAttacker(character, target) {
    const targetedCharacter = target.character;
    let damage = Math.max(character.attack - targetedCharacter.defence, character.attack * 0.1);
    damage = Math.floor(damage);
    await this.gamePlay.showDamage(target.position, damage);
    targetedCharacter.health -= damage;
    this.currentAction = this.currentAction === 'computer' ? 'player' : 'computer';
    if (targetedCharacter.health <= 0) {
      playerPositions = playerPositions.filter((item) => item.position !== target.position);
      computerPositions = computerPositions.filter((item) => item.position !== target.position);
      if (playerPositions.length === 0) {
        GamePlay.showMessage('Game over');
        this.blockedBoard = true;
      }
      if (computerPositions.length === 0) {
        for (const item of playerPositions) {
          this.point += item.character.health;
        }
        this.levelUp();
        this.level += 1;
        this.nextLevel();
      }
    }
    this.gamePlay.redrawPositions([...playerPositions, ...computerPositions]);
  }

  async computerAttacks(character, target) {
    await this.characterAttacker(character, target);
    this.currentAction = 'player';
  }

  allowedPositions(position, distance, boardSize) {
    const allowedPositionsArray = [];
    const row = Math.floor(position / boardSize);
    const column = position % boardSize;
  
    for (let i = 1; i <= distance; i += 1) {
      if ((column + i) < 8) {
        allowedPositionsArray.push((row * 8) + (column + i));
      }
      if ((column - i) >= 0) {
        allowedPositionsArray.push((row * 8) + (column - i));
      }
      if ((row + i) < 8) {
        allowedPositionsArray.push(((row + i) * 8) + column);
      }
      if ((row - i) >= 0) {
        allowedPositionsArray.push(((row - i) * 8) + column);
      }
      if ((row + i) < 8 && (column + i) < 8) {
        allowedPositionsArray.push(((row + i) * 8) + (column + i));
      }
      if ((row - i) >= 0 && (column - i) >= 0) {
        allowedPositionsArray.push(((row - i) * 8) + (column - i));
      }
      if ((row + i) < 8 && (column - i) >= 0) {
        allowedPositionsArray.push(((row + i) * 8) + (column - i));
      }
      if ((row - i) >= 0 && (column + i) < 8) {
        allowedPositionsArray.push(((row - i) * 8) + (column + i));
      }
    }
    return allowedPositionsArray;
  }

  computerStrategy() {
    if (this.currentAction === 'computer') {
      for (const computer of [...computerPositions]) {
        allowedDistanceAttack = this.selectedCharacter.character.distanceAttack;
        allowedPosition = computer.position;
        boardSize = this.gamePlay.boardSize;
        const allowAttack = this.allowedPositions(allowedPosition, allowedDistanceAttack, boardSize);
        const target = this.computerAttack(allowAttack);
        if (target !== null) {
          this.computerAttacks(computer.character, target);
          return;
        }
      }
      const randomIndex = Math.floor(Math.random() * [...computerPositions].length);
      const randomComputer = [...computerPositions][randomIndex];
      this.computerMove(randomComputer);
      this.gamePlay.redrawPositions([...playerPositions, ...computerPositions]);
      this.currentAction = 'player';
    }
  }

  computerMove(itemComputer) {
    const currentComputerCharacter = itemComputer;
    const itemComputerDistance = itemComputer.character.distance;
    let tempPRow;
    let tempPCOlumn;
    let stepRow;
    let stepColumn;
    let Steps;
    const itemComputerRow = this.positionRow(currentComputerCharacter.position);
    const itemComputerColumn = this.positionColumn(currentComputerCharacter.position);
    let nearPlayer = {};

    for (const itemPlayer of [...playerPositions]) {
      const itemPlayerRow = this.positionRow(itemPlayer.position);
      const itemPlayerColumn = this.positionColumn(itemPlayer.position);
      stepRow = itemComputerRow - itemPlayerRow;
      stepColumn = itemComputerColumn - itemPlayerColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if (nearPlayer.steps === undefined || Steps < nearPlayer.steps) {
        nearPlayer = {
          steprow: stepRow,
          stepcolumn: stepColumn,
          steps: Steps,
          positionRow: itemPlayerRow,
          positionColumn: itemPlayerColumn,
        };
      }
    }
    if (Math.abs(nearPlayer.steprow) === Math.abs(nearPlayer.stepcolumn)) {
      if (Math.abs(nearPlayer.steprow) > itemComputerDistance) {
        tempPRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearPlayer.steprow)));
        tempPCOlumn = (itemComputerColumn - (itemComputerDistance * Math.sign(nearPlayer.stepcolumn)));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, tempPCOlumn);
      } else {
        tempPRow = (itemComputerRow - (nearPlayer.steprow - (1 * Math.sign(nearPlayer.steprow))));
        tempPCOlumn = (itemComputerColumn - (nearPlayer.stepcolumn - (1 * Math.sign(nearPlayer.steprow))));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, tempPCOlumn);
      }
    } else if (nearPlayer.stepcolumn === 0) {
      if (Math.abs(nearPlayer.steprow) > itemComputerDistance) {
        tempPRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearPlayer.steprow)));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, (itemComputerColumn));
      } else {
        tempPRow = (itemComputerRow - (nearPlayer.steprow - (1 * Math.sign(nearPlayer.steprow))));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, (itemComputerColumn));
      }
    } else if (nearPlayer.steprow === 0) {
      if (Math.abs(nearPlayer.stepcolumn) > itemComputerDistance) {
        tempPCOlumn = (itemComputerColumn - (itemComputerDistance * Math.sign(nearPlayer.stepcolumn)));

        currentComputerCharacter.position = this.rowColumnToIndex((itemComputerRow), tempPCOlumn);
      } else {
        const tempFormul = (nearPlayer.stepcolumn - (1 * Math.sign(nearPlayer.stepcolumn)));
        tempPCOlumn = (itemComputerColumn - tempFormul);

        currentComputerCharacter.position = this.rowColumnToIndex((itemComputerRow), tempPCOlumn);
      }
    } else if (Math.abs(nearPlayer.steprow) > Math.abs(nearPlayer.stepcolumn)) {
      if (Math.abs(nearPlayer.steprow) > itemComputerDistance) {
        tempPRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearPlayer.steprow)));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, (itemComputerColumn));
      } else {
        tempPRow = (itemComputerRow - (nearPlayer.steprow));

        currentComputerCharacter.position = this.rowColumnToIndex(tempPRow, (itemComputerColumn));
      }
    } else if (Math.abs(nearPlayer.stepcolumn) > itemComputerDistance) {
      tempPCOlumn = (itemComputerColumn - (itemComputerDistance * Math.sign(nearPlayer.stepcolumn)));

      currentComputerCharacter.position = this.rowColumnToIndex((itemComputerRow), tempPCOlumn);
    } else {
      currentComputerCharacter.position = this.rowColumnToIndex((itemComputerRow), (itemComputerColumn));
    }
  }

  positionRow(index) {
    return Math.floor(index / this.gamePlay.boardSize);
  }

  positionColumn(index) {
    return index % this.gamePlay.boardSize;
  }

  rowColumnToIndex(row, column) {
    return (row * 8) + column;
  }

  computerAttack(allowAttack) {
    for (const itemPlayer of [...playerPositions]) {
      if (allowAttack.includes(itemPlayer.position)) {
        return itemPlayer;
      }
    }
    return null;
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.idx = index;
    if (!this.blockedBoard) {
      for (const item of [...playerPositions, ...computerPositions]) {
        if (item.position === index) {
          this.gamePlay.showCellTooltip(propIcons(item.character), index);
        }
      }

      if (this.selected) {
        allowedPosition = this.selectedCharacter.position;
        allowedDistance = this.selectedCharacter.character.distance;
        boardSize = this.gamePlay.boardSize;

        const allowPositions = this.allowedPositions(allowedPosition, allowedDistance, boardSize);

        allowedDistanceAttack = this.selectedCharacter.character.distanceAttack;
        const allowAttack = this.allowedPositions(allowedPosition, allowedDistanceAttack, boardSize);

        if (this.getIndex(playerPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (allowPositions.includes(index)
          && this.getIndex([...playerPositions, ...computerPositions]) === -1) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (allowAttack.includes(index) && this.getIndex(computerPositions) !== -1) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }
}
