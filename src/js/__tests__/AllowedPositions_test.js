import allowedPositions from '../allowedPositions';

test('returns allowed positions', () => {
  const received = allowedPositions(2, 2, 8);
  const expected = [3, 1, 10, 11, 9, 4, 0, 18, 20, 16];
  expect(received).toEqual(expected);
});
