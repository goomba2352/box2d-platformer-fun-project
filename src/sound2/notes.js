function Note(arg) {
  if (typeof arg == "number") {
    return _Note_.FreqI(arg);
  } else {
    return _Note_.Freq(arg);
  }
}
class _Note_ {
  static all_notes = [
    // Freq    // Note        // Index
    16.35,     // C0          0
    17.32,     // C#0, D_0    1
    18.35,     // D0          2
    19.45,     // D#0, E_0    3
    20.60,     // E0          4
    21.83,     // F0          5
    23.12,     // F#0, G_0    6
    24.50,     // G0          7
    25.96,     // G#0, A_0    8
    27.50,     // A0          9
    29.14,     // A#0, B_0    10
    30.87,     // B0          11
    32.70,     // C1          12
    34.65,     // C#1, D_1    13
    36.71,     // D1          14
    38.89,     // D#1, E_1    15
    41.20,     // E1          16
    43.65,     // F1          17
    46.25,     // F#1, G_1    18
    49.00,     // G1          19
    51.91,     // G#1, A_1    20
    55.00,     // A1          21
    58.27,     // A#1, B_1    22
    61.74,     // B1          23
    65.41,     // C2          24
    69.30,     // C#2, D_2    25
    73.42,     // D2          26
    77.78,     // D#2, E_2    27
    82.41,     // E2          28
    87.31,     // F2          29
    92.50,     // F#2, G_2    30
    98.00,     // G2          31
    103.83,    // G#2, A_2    32 
    110.00,    // A2          33 
    116.54,    // A#2, B_2    34 
    123.47,    // B2          35 
    130.81,    // C3          36
    138.59,    // C#3, D_3    37  
    146.83,    // D3          38  
    155.56,    // D#3, E_3    39  
    164.81,    // E3          40  
    174.61,    // F3          41  
    185.00,    // F#3, G_3    42  
    196.00,    // G3          43  
    207.65,    // G#3, A_3    44  
    220.00,    // A3          45  
    233.08,    // A#3, B_3    46  
    246.94,    // B3          47  
    261.63,    // C4          48  
    277.18,    // C#4, D_4    49  
    293.66,    // D4          50  
    311.13,    // D#4, E_4    51  
    329.63,    // E4          52  
    349.23,    // F4          53  
    369.99,    // F#4, G_4    54  
    392.00,    // G4          55  
    415.30,    // G#4, A_4    56  
    440.00,    // A4          57  
    466.16,    // A#4, B_4    58  
    493.88,    // B4          59  
    523.25,    // C5          60  
    554.37,    // C#5, D_5    61  
    587.33,    // D5          62  
    622.25,    // D#5, E_5    63  
    659.25,    // E5          64  
    698.46,    // F5          65  
    739.99,    // F#5, G_5    66  
    783.99,    // G5          67  
    830.61,    // G#5, A_5    68  
    880.00,    // A5          69  
    932.33,    // A#5, B_5    70  
    987.77,    // B5          71  
    1046.50,   // C6          72
    1108.73,   // C#6, D_6    73
    1174.66,   // D6          74
    1244.51,   // D#6, E_6    75
    1318.51,   // E6          76
    1396.91,   // F6          77
    1479.98,   // F#6, G_6    78
    1567.98,   // G6          79
    1661.22,   // G#6, A_6    80
    1760.00,   // A6          81
    1864.66,   // A#6, B_6    82
    1975.53,   // B6          83
    2093.00,   // C7          84
    2217.46,   // C#7, D_7    85
    2349.32,   // D7          86
    2489.02,   // D#7, E_7    87
    2637.02,   // E7          88
    2793.83,   // F7          89
    2959.96,   // F#7, G_7    90
    3135.96,   // G7          91
    3322.44,   // G#7, A_7    92
    3520.00,   // A7          93
    3729.31,   // A#7, B_7    94
    3951.07,   // B7          95
    4186.01,   // C8          96
    4434.92,   // C#8, D_8    97
    4698.63,   // D8          98
    4978.03,   // D#8, E_8    99
    5274.04,   // E8          100
    5587.65,   // F8          101
    5919.91,   // F#8, G_8    102
    6271.93,   // G8          103
    6644.88,   // G#8, A_8    104
    7040.00,   // A8          105
    7458.62,   // A#8, B_8    106
    7902.13];  // B8          107
  // Returns frequency. Supports following format:
  // [A-Z](#_)(octive)

  //  C D EF G A BC
  //  5 5 55 5 6 66
  //
  //   @ #  % ^ &  * )
  //  Q W ER T Y UI O P
  //
  static key_map = {
    "z": 36,
    "s": 37,
    "x": 38,
    "d": 39,
    "c": 40,
    "v": 41,
    "g": 42,
    "b": 43,
    "h": 44,
    "n": 45,
    "j": 46,
    "m": 47,
    ",": 48,
    "Z": 48,
    "S": 49,
    "X": 50,
    "D": 51,
    "C": 52,
    "V": 53,
    "G": 54,
    "B": 55,
    "H": 56,
    "N": 57,
    "J": 58,
    "M": 59,
    "<": 60,
    "q": 60,
    "2": 61,
    "w": 62,
    "3": 63,
    "e": 64,
    "r": 65,
    "5": 66,
    "t": 67,
    "6": 68,
    "y": 69,
    "7": 70,
    "u": 71,
    "i": 72,
    "8": 73,
    "o": 74,
    "p": 75,
    "Q": 72,
    "@": 73,
    "W": 74,
    "#": 75,
    "E": 76,
    "R": 77,
    "%": 78,
    "T": 79,
    "^": 80,
    "Y": 81,
    "&": 82,
    "U": 83,
    "I": 84,
    "*": 85,
    "O": 86,
    "P": 87
  }
  static index_map = {
    'c': 0,
    'd': 2,
    'e': 4,
    'f': 5,
    'g': 7,
    'a': 9,
    'b': 11,
  }

    // Supports format, and nothing else: [A-Za-z]([#_])?[0-8]
  static Index(note) {
    let index = 0;
    if (note.indexOf("#") != -1) {
      index++;
    } else if (note.indexOf("_") != -1) {
      index--;
    }
    let octive = parseInt(note.charAt(note.length-1));
    index += octive*12;
    index += _Note_.index_map[note.charAt(0).toLowerCase()];
    return index;
  }

  static FreqI(index) {
    return _Note_.all_notes[index];
  }


  static Freq(note) {
    return _Note_.FreqI(_Note_.Index(note));
  }
}