import Character from '../Character';
import Swordsman from '../characters/swordsman';
import propIcons from '../characters/propIcons';
import GameState from '../gameState_test/GameState';
import GameStateService from '../gameState_test/GameStateService';
import { calcTileType } from '../utils';
import allowedPositions from '../allowedPositions';

test('the character was created successfully', () => {
  const mikeShortArms = new Swordsman();
  expect(mikeShortArms.attack).toBe(40);
});

test('throws error: Please do not use "new Character()"', () => {
  const result = 'Please do not use "new Character()"';
  expect(() => {
    const daemon = new Character();
    return daemon;
  }).toThrow(result);
});

test('returns info about character with icons', () => {
  const dennyBlindEyes = new Swordsman(1);
  const received = propIcons(dennyBlindEyes);
  const expected = `${'\u{1F396}'}1 ${'\u{2694}'}40 ${'\u{1F6E1}'}0 ${'\u{2764}'}50`;
  expect(received).toBe(expected);
});

test.each([
  [0, 8, 'top-left'],
  [1, 8, 'top'],
  [7, 8, 'top-right'],
  [8, 8, 'left'],
  [15, 8, 'right'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [20, 8, 'center'],
  [0, 9, 'top-left']])(('should return tile type'), (index, boardSize, result) => {
  const received = calcTileType(index, boardSize);
  expect(received).toBe(result);
});

test('returns allowed positions', () => {
  const received = allowedPositions(2, 2, 8);
  const expected = [3, 1, 10, 11, 9, 4, 0, 18, 20, 16];
  expect(received).toEqual(expected);
});

jest.mock('../gameState_test/GameState');
beforeEach(() => {
  jest.resetAllMocks();
});

test('loads actual game state', () => {
  const expected = '{"point":10,"maxPoint":10,"level":1,"currentTheme":"prairie","userPositions":[]}';
  GameState.mockReturnValue(expected);
  const received = GameStateService.load();
  expect(JSON.stringify(received)).toEqual(expected);
});

test('throws error: "Game state is empty or was not read."', () => {
  const expected = '';
  GameState.mockReturnValue(expected);

  expect(() => GameStateService.load()).toThrow();
});
