export default function generateRandomNumber(length = 6): string | null {
  if (length < 1) {
    return null;
  }

  if (length > 10) {
    return null;
  }

  const Length = Math.round(length);

  const numbers = '0123456789';
  let result = '';

  let count = 0;

  while (count < Length) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    count++;
  }

  return result;
}
