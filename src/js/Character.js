export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    // to test it
    if (new.target.name === 'Character') {
      throw Error('Please do not use "new Character()"');
    }
  }
}
