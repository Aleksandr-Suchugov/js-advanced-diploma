import GameState from './GameState';

export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  static load() {
    try {
      return JSON.parse(GameState());
    } catch (e) {
      throw new Error('Game state is empty or was not read.');
    }
  }
}
