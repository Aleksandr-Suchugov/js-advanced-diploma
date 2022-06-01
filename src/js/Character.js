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
      throw Error("Character can't be called with new");
    }
  }

  levelUp() {
    this.level += 1;
    this.attack = Math.max(this.attack, Math.round(this.attack * (1.8 - this.health / 100)));
    this.defence = Math.max(this.defence, Math.round(this.defence * (1.8 - this.health / 100)));
    (this.health < 20) ? this.health += 80 : this.health = 100;
  }
}
