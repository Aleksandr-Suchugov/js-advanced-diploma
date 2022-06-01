import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';

export default class Team {
  constructor(players) {
    this.human = [Bowman, Swordsman, Magician];
    this.computer = [Undead, Daemon, Vampire];
  }
}
