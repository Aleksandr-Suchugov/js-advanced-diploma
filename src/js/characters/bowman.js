import Character from '../Character';

export default class Bowman extends Character {
  constructor(...props) {
    super(...props);
    this.attack = 25;
    this.deffence = 25;
    this.type = "bowman";
  }
}