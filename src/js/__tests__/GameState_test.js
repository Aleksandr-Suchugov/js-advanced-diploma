import GameState from '../gameState_test/GameState';
import GameStateService from '../gameState_test/GameStateService';

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
