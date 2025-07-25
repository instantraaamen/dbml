const { escapeCSV, arrayToCSVRow, dataToCSV } = require('../pkg/csvUtils');

describe('CSV Utils', () => {
  
  describe('escapeCSV', () => {
    test('should return empty string for null/undefined', () => {
      expect(escapeCSV(null)).toBe('');
      expect(escapeCSV(undefined)).toBe('');
    });

    test('should not escape simple strings', () => {
      expect(escapeCSV('simple')).toBe('simple');
      expect(escapeCSV('test123')).toBe('test123');
    });

    test('should escape strings with commas', () => {
      expect(escapeCSV('hello,world')).toBe('"hello,world"');
    });

    test('should escape strings with quotes', () => {
      expect(escapeCSV('say "hello"')).toBe('"say ""hello"""');
    });

    test('should escape strings with newlines', () => {
      expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"');
    });

    test('should handle numbers', () => {
      expect(escapeCSV(123)).toBe('123');
      expect(escapeCSV(45.67)).toBe('45.67');
    });
  });

  describe('arrayToCSVRow', () => {
    test('should convert array to CSV row', () => {
      expect(arrayToCSVRow(['a', 'b', 'c'])).toBe('a,b,c');
    });

    test('should escape values in array', () => {
      expect(arrayToCSVRow(['hello,world', 'simple', 'say "hi"']))
        .toBe('"hello,world",simple,"say ""hi"""');
    });

    test('should handle empty array', () => {
      expect(arrayToCSVRow([])).toBe('');
    });
  });

  describe('dataToCSV', () => {
    test('should convert 2D array to CSV string', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['John', '30', 'Tokyo'],
        ['Jane', '25', 'Osaka']
      ];
      
      const expected = 'Name,Age,City\nJohn,30,Tokyo\nJane,25,Osaka';
      expect(dataToCSV(data)).toBe(expected);
    });

    test('should handle empty data', () => {
      expect(dataToCSV([])).toBe('');
    });

    test('should handle single row', () => {
      expect(dataToCSV([['a', 'b', 'c']])).toBe('a,b,c');
    });

    test('should escape values in 2D array', () => {
      const data = [
        ['Name', 'Message'],
        ['John', 'Hello, World!'],
        ['Jane', 'Say "Hi"']
      ];
      
      const expected = 'Name,Message\nJohn,"Hello, World!"\nJane,"Say ""Hi"""';
      expect(dataToCSV(data)).toBe(expected);
    });
  });
});