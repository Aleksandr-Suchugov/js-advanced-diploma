export default function allowedPositions(position, distance, boardSize) {
  const allowedPositionsArray = [];
  const row = Math.floor(position / boardSize);
  const column = position % boardSize;
  for (let i = 1; i <= distance; i += 1) {
    if ((column + i) < 8) {
      allowedPositionsArray.push((row * 8) + (column + i));
    }
    if ((column - i) >= 0) {
      allowedPositionsArray.push((row * 8) + (column - i));
    }
    if ((row + i) < 8) {
      allowedPositionsArray.push(((row + i) * 8) + column);
    }
    if ((row - i) >= 0) {
      allowedPositionsArray.push(((row - i) * 8) + column);
    }
    if ((row + i) < 8 && (column + i) < 8) {
      allowedPositionsArray.push(((row + i) * 8) + (column + i));
    }
    if ((row - i) >= 0 && (column - i) >= 0) {
      allowedPositionsArray.push(((row - i) * 8) + (column - i));
    }
    if ((row + i) < 8 && (column - i) >= 0) {
      allowedPositionsArray.push(((row + i) * 8) + (column - i));
    }
    if ((row - i) >= 0 && (column + i) < 8) {
      allowedPositionsArray.push(((row - i) * 8) + (column + i));
    }
  }
  return allowedPositionsArray;
}
