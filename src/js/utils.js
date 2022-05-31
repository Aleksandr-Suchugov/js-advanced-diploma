export function calcTileType(index, boardSize) {
  // TODO: write logic here
  // to test it
  const tableSize = boardSize ** 2;
  const lineSize = boardSize - 1;
  if (index === 0) {
    return 'top-left';
  }
  if (index === lineSize) {
    return 'top-right';
  }
  if (index > 0 && index < lineSize) {
    return 'top';
  }
  if (index === tableSize - lineSize) {
    return 'bottom-left';
  }
  if (index === tableSize - 1) {
    return 'bottom-right';
  }
  if (index > tableSize - lineSize && index < tableSize - 1) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'lrft';
  }
  if ((index + 1) % boardSize === 0) {
    return "right";
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
