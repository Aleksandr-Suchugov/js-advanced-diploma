import Character from '../Character';

export default class Daemon extends Character {
  constructor(...props) {
    super(...props);
    this.attack = 10;
    this.defence = 40;
    this.type = 'daemon';
  }
}