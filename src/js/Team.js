import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';

export default class Team {
  static getStartPlayerTeam() {
    return [new Bowman(1), new Swordsman(1)];
  }

  static getPlayerTeam() {
    return [Bowman, Swordsman, Magician];
  }

  static getComputerTeam() {
    return [Daemon, Undead, Vampire];
  }
}
