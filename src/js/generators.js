/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

import Themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';

export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const type = Math.round(Math.random() * allowedTypes.length);
  const level = Math.round(Math.random() * maxLevel);
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];
  while (team.length < characterCount) {
    team.push(...characterGenerator(allowedTypes, maxLevel));
  }
  return team;
}
