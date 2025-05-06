class SoundOp {
  op(old_val,new_val,t) { 
    return new_val;
  }
}

class AddSoundOp extends SoundOp {
  op(old_val, new_val) {
    return old_val+new_val;
  }
}

class MultSoundOp extends SoundOp {
  op (old_val, new_val) {
    return old_val * new_val;
  }
}

class MixOp extends SoundOp {
  new_weight = .5;
  constructor(new_weight) {
    super();
    this.new_weight = new_weight;
  }

  op(old_val, new_val) {
    return old_val * (1 - this.new_weight) + new_val * this.new_weight;
  }
}

class SoundFn {
  // Unless set, sounds are mixed with equal weighting.
  // The first operation will set the sound wave to the first SoundFn, i.e. a
  // MixOp with 100% weighting to new sound. Each subsequent call will weight
  // new/old as 50-50% ,66-33%, etc to naturally blend 3+ sound waves. This ensures
  // no clipping can occur with default settings.
  op = null;
  fm_mod = []
  begin = 0;
  end = 1;

  SetOp(new_op) {
    this.op = new_op;
    return this;
  }

  SetBegin(begin) {
    this.begin = begin;
    return this;
  }

  SetEnd(end) {
    this.end = end;
    return this;
  }

  fn(t) {
    return 0;
  }
}

class RandomFn extends SoundFn {
  fn(t, len) {
    return -1 + Math.random() * 2;
  }
}
class Waves {
  static Square(t) {
    return t < Math.PI ? -1 : 1;
  }
  
  static Triangle(t) {
    if (t < Math.PI / 2) {
      // return 0 at 0 and 1 at PI/2
      return t / (Math.PI / 2);
    } else if (t < 3 * Math.PI / 2) {
      // return 1 at PI/2 and -1 at 3PI/2
      return 1 - (t - Math.PI / 2) / (Math.PI / 2);
    }
    // return -1 at 3PI/2 and 0 at 2PI
    return -1 + (t - 3 * Math.PI / 2) / (Math.PI / 2);
  }

  static HalfTriangle(t) {
    return -1 + t / (Math.PI);
  }

}
class FMMod {
  fn(freq, t) {
    throw new RangeError("Unimplemented base class called :(");
  }
}
class NoOpFMMod {
  // Takes in original, unmodified frequency, and outputs some modification to it.
  fn(freq,t) {
    return freq;
  }
}

class ChaoticFMMod extends FMMod {
  steps;
  vib_freq;

  // Something fun that happened when I tried to vibrate between two waves.
  constructor(vib_freq, steps) {
    super();
    this.steps = steps;
    this.vib_freq = vib_freq;
  }
  fn(freq, t) {
    let new_freq=freq*(2**(this.steps/12))
    let delta = new_freq-freq;
    let new_freq_amt = (Math.sin((t)*this.vib_freq*Math.PI*2)+1)/2;
    return freq+new_freq_amt*delta;
  }
}

class SampledWave extends SoundFn {
  freq = 440;
  // a function with domain [0,Math.PI*2] and range [-1,1]
  wave;
  fm_mod = new NoOpFMMod();

  SetFMMod(fm_mod) {
    this.fm_mod = fm_mod;
    return this;
  }
  
  constructor(freq, wave) {
    super();
    this.freq = freq;
    this.wave = wave;
  }

  fn(t) {
    return this.wave((t*Math.PI*2*this.fm_mod.fn(this.freq,t)) % (Math.PI*2))
  }
}

class SquareFn extends SampledWave {
  constructor(freq) {
    super(freq, Waves.Square);
  }
}

class TriangleFn extends SampledWave {
  constructor(freq) {
    super(freq, Waves.Triangle);
  }
}

class HalfTriangleFn extends SampledWave {
  constructor(freq) {
    super(freq, Waves.HalfTriangle);
  }
}

class SinFn extends SampledWave {
  constructor(freq) {
    super(freq, Math.sin);
  }
}

class SinAddFn extends SoundFn {
  freq;
  fm;
  fma;
  wave1 = Math.sin;
  wave2 = Math.sin;

  constructor(freq,fm,fma) {
    super();
    this.freq = freq;
    this.fm = fm;
    this.fma = fma;
  }

  fn(t, len) {
    return this.wave1((t*Math.PI*2*this.freq+this.fma*this.wave2((Math.PI*2*this.fm*t)%(Math.PI*2)))%(Math.PI*2));
  }
}

class EffectFn {
  begin = 0;
  end = 0;
  apply_out_of_bounds=false;
  op = new MultSoundOp();

  OOB() {
    // toggle.
    this.apply_out_of_bounds=!this.apply_out_of_bounds;
    return this;
  }

  // p is percentage between begin and end, where t is time.
  fn(p, t) {

  }
}

class LinearFade extends EffectFn {
  begin_amp;
  end_amp;

  static In(end = .1, begin=0) {
    let a = new LinearFade(begin, /*begin_amp=*/0, end, /*end_amp=*/1);
    a.apply_out_of_bounds = true;
    return a;
  }

  static Out(begin = .9, end=1) {
    let a = new LinearFade(begin, /*begin_amp=*/1, end, /*end_amp=*/0);
    a.apply_out_of_bounds = true;
    return a;
  }

  constructor(begin, begin_amp, end, end_amp) {
    super();
    this.begin = begin;
    this.begin_amp = begin_amp;
    this.end = end;
    this.end_amp = end_amp;
  }

  fn(p, t) {
    // at p=0, value is begin_amp, at p=1, value is end_amp
    let val = (1 - p) * this.begin_amp + p * this.end_amp;
    return val; 
  }

}

// Belnds two waves together using a third wave.
class VibratoFn extends SoundFn {
  a;
  b;
  sampled_blend_wave;
  constructor(a, b, sampled_blend_wave) {
    super();
    this.a = a;
    this.b = b;
    this.sampled_blend_wave = sampled_blend_wave;
  }

  fn(t) {
    let amplitude=this.sampled_blend_wave.fn(t)/2+.5;
    return this.a.fn(t)*amplitude+(this.b.fn(t)*(1-amplitude));
  }
}

class Sound {
  fns=[];
  /** return {Sound} */
  static New() {
    return new Sound();
  }

  /** return {Sound} */
  AddFn(fn) {
    this.fns.push(fn);
    return this;
  }

  // builds and returns array buffer of sample to play.
  Sample(big_len, amplitude=1, from_index=0, to_index=-1, samplerate = 44100) {
    if (to_index == -1) {
      to_index = big_len;
    }
    let arr = new Float32Array(to_index-from_index);
    let sounds_at = new Int32Array(arr.length);

    for (let o = 0; o < this.fns.length; o++) {
      let fn = this.fns[o];
      let global_begin = Math.floor(big_len * fn.begin);
      let begin = Math.max(global_begin, from_index) - from_index;
      let global_end = Math.floor(big_len * fn.end);
      let end = Math.min(global_end, to_index) - from_index;
      if (fn instanceof EffectFn) {
        let e_begin = fn.apply_out_of_bounds ? 0 : begin;
        let e_end = fn.apply_out_of_bounds ? arr.length : end
        for (let i = e_begin; i < e_end; i++) {
          let global_i = from_index + i;
          let t = global_i / samplerate;
          let p = ((global_i - global_begin) / (global_end - global_begin));
          if (p < 0) {
            p=0
          } else if (p > 1) {
            p=1;
          }
          let op = fn.op;
          arr[i] = op.op(arr[i], fn.fn(p, t));
        }
      } else if (fn instanceof SoundFn) {
        for (let i = begin; i < end; i++) {
          let global_i = from_index + i;
          let op = (fn.op == null) ? new MixOp(1 - (sounds_at[i] / (sounds_at[i] + 1))) : fn.op;
          let t = global_i / samplerate;
          arr[i] = op.op(arr[i], fn.fn(t));
          sounds_at[i]++;
        }
      }
    }
    if (amplitude != 1) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * amplitude;
      }
    }
    return arr;
  }
}

class CompiledRow {
  cells = {};
  end = false;

  static End() {
    return new CompiledRow([], true)
  }

  constructor(cells, end = false) {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] == null) {
        continue;
      }
      if (this.cells[cells[i].GetKey()] == null) {
        this.cells[cells[i].GetKey()] = [];
      } 
      this.cells[cells[i].GetKey()].push(cells[i]);
    }
    this.end = end;
  }

  Get(key) {
    if (this.cells[key] != null) {
      return this.cells[key][this.cells[key].length - 1];
    }
    return this.cells[key];
  }

  SerializeRowForWorker() {
    let snds=[]
    let vals = Object.values(this.cells);
    for (let i = 0; i < vals.length; i++) {
      for (let j = 0; j < vals[i].length; j++) {
        snds.push({
          name: vals[i][j].name,
          render_begin: vals[i][j].from_index,
          render_end: vals[i][j].to_index,
          big_len: vals[i][j].total_len,
          freq: vals[i][j].freq,
          amplitude: vals[i][j].amplitude,
          start_offset: vals[i][j].start_offset
        })
      }
  }
    if (this.end) {
      snds.push({ end: true });
    }

    return snds;
  }
}

// class CompiledCell {
//   name;
//   column_index;
//   amplitude=0;
//   from_index=0;
//   to_index=0;
//   total_len = 0;
//   freq = [];
//   freqi=[];
//   last = null;
//   start_offset = 0;
//   do_not_link = false;

//   UpdateTotalLength(added_length) {
//     this.total_len += added_length;
//     if (this.last != null) {
//       this.last.UpdateTotalLength(added_length);
//     }
//   }

//   GetKey() {
//     return this.name + "." + this.column_index + "." + this.freqi.join(",");
//   }

//   static Parse(name, column_index, cell, sample_length, default_amplitude, chords, transpose, quarter_mode) {
//     if (quarter_mode == "q" || quarter_mode=="b") {
//       let cells=[];
//       for (let i = 0; i < 4; i++) {
//         let note_i = null;
//         let amplitude_part = cell.substring(5);
//         if (quarter_mode == "q") {
//           note_i = _Note_.key_map[cell.substr(i,1)];
//         } else {
//           let beat = cell.substr(i, 1).replaceAll(" ", "").replaceAll(".", "");
//           if (beat.length>0) {
//             note_i = 36
//             let q_amp = parseInt(beat)*11;
//             q_amp = parseInt(q_amp*default_amplitude)
//             if (q_amp == null || Number.isNaN(q_amp)) {
//               throw new RangeError("Could not parse beat's amplitude '" + beat + "' in cell: '" + cell + "'. Must use numbers 0-9");
//             }
//             amplitude_part = String(q_amp).padStart(2,"0");
//           }
//         }
//         if (note_i == null) {
//           cells.push(null);
//           continue;
//         } else {
//           let note_part = String(note_i).padStart(3, "0");
//           let chord_part = ".";
//           let effect_part = cell.substr(4,1);
//           let rewritten = note_part + chord_part + effect_part + amplitude_part;
//           let quarter_cells = CompiledCell.Parse(name,
//             column_index,
//             rewritten,
//             sample_length / 4,
//             default_amplitude,
//             chords, transpose,
//             "i");
//           for (let j = 0; j < quarter_cells.length; j++) {
//             quarter_cells[j].start_offset = i * sample_length / 4;
//             if (quarter_mode=="b") {
//               quarter_cells[j].do_not_link=true;
//             }
//             cells.push(quarter_cells[j]);
//           }
//         }
//       }
//       return cells;
//     }
    
//     if (cell.length != 7) {
//       throw new RangeError("cell must have 7 characters, found '" + cell + "'");
//     }
//     let note_i = -1;
//     if (quarter_mode == "i") {
//       note_i = parseInt(cell.substr(0, 3).replaceAll(".", "").replaceAll(" ", ""));
//     } else {
//       note_i = _Note_.Index(cell.substr(0, 3).replaceAll(".", "").replaceAll(" ", ""));
//     }
    
//     let freq = Note(note_i);
//     if (freq == null) {
//       // No note istended
//       return [];
//     }
//     let c = new CompiledCell();
//     c.name = name;
//     let chord_letter = cell.substring(3,4);
//     let chord = [0];
//     if (chords != null && chord_letter != " " && chord_letter != ".") {
//       chord=chords[chord_letter];
//       if (chord == null) {
//         throw new RangeError("Chord (" + chord_letter + ") not defined in cell: " + cell);
//       }
//     }
//     for (let i = 0; i < chord.length; i++) {
//       let freqi = note_i + transpose + chord[i];
//       c.freqi.push(freqi);
//       c.freq.push(Note(freqi));
//     }
//     c.to_index = sample_length;
//     c.total_len = sample_length;
//     c.sample_length = sample_length;

//     c.column_index = column_index;

//     // TODO implement me
//     let effect = cell.substr(4, 1);
//     if (effect=="x") {
//       c.do_not_link=true;
//     }
    
//     let final_amplitude = cell.substr(5).replaceAll(" ", "").replaceAll(".", "");
//     if (final_amplitude.length>0) {
//       c.amplitude = parseInt(final_amplitude)/99;
//       if (Number.isNaN(c.amplitude) || c.amplitude==null) {
//         throw new RangeError("Could not parse amplitude '"+ final_amplitude +"'  in cell: '" + cell + "'. Must use numbers 00-99");
//       }
//     } else {
//       c.amplitude = default_amplitude;
//     }
//     return [c];
//   }

//   PostParse(last) {
//     if (last != null && last.GetKey() == this.GetKey()) {
//       this.last=last;
//       this.from_index = this.last.to_index;
//       this.to_index = this.from_index + this.sample_length;
//       this.total_len = last.total_len + this.sample_length;
//       this.last.UpdateTotalLength(this.sample_length);
//     }
//   }
// }

class CompiledCell {
  name;
  column_index;
  amplitude=0;
  from_index=0;
  to_index=0;
  total_len = 0;
  freq = [];
  freqi=[];
  last = null;
  start_offset = 0;
  do_not_link = false;

  UpdateTotalLength(added_length) {
    this.total_len += added_length;
    if (this.last != null) {
      this.last.UpdateTotalLength(added_length);
    }
  }

  GetKey() {
    return this.name + "." + this.column_index + "." + this.freqi.join(",");
  }

  static Parse(name, column_index, cell, sample_length, default_amplitude, chords, transpose, quarter_mode) {
    if (quarter_mode == "q" || quarter_mode=="b") {
      let cells=[];
      for (let i = 0; i < 4; i++) {
        let note_i = null;
        let amplitude_part = cell.substring(5);
        if (quarter_mode == "q") {
          note_i = _Note_.key_map[cell.substr(i,1)];
        } else {
          let beat = cell.substr(i, 1).replaceAll(" ", "").replaceAll(".", "");
          if (beat.length>0) {
            note_i = 36
            let q_amp = parseInt(beat)*11;
            q_amp = parseInt(q_amp*default_amplitude)
            if (q_amp == null || Number.isNaN(q_amp)) {
              throw new RangeError("Could not parse beat's amplitude '" + beat + "' in cell: '" + cell + "'. Must use numbers 0-9");
            }
            amplitude_part = String(q_amp).padStart(2,"0");
          }
        }
        if (note_i == null) {
          cells.push(null);
          continue;
        } else {
          let note_part = String(note_i).padStart(3, "0");
          let chord_part = ".";
          let effect_part = cell.substr(4,1);
          let rewritten = note_part + chord_part + effect_part + amplitude_part;
          let quarter_cells = CompiledCell.Parse(name,
            column_index,
            rewritten,
            sample_length / 4,
            default_amplitude,
            chords, transpose,
            "i");
          for (let j = 0; j < quarter_cells.length; j++) {
            quarter_cells[j].start_offset = i * sample_length / 4;
            if (quarter_mode=="b") {
              quarter_cells[j].do_not_link=true;
            }
            cells.push(quarter_cells[j]);
          }
        }
      }
      return cells;
    }
    
    if (cell.length != 7) {
      throw new RangeError("cell must have 7 characters, found '" + cell + "'");
    }
    let note_i = -1;
    if (quarter_mode == "i") {
      note_i = parseInt(cell.substr(0, 3).replaceAll(".", "").replaceAll(" ", ""));
    } else {
      note_i = _Note_.Index(cell.substr(0, 3).replaceAll(".", "").replaceAll(" ", ""));
    }
    
    let freq = Note(note_i);
    if (freq == null) {
      // No note istended
      return [];
    }
    let c = new CompiledCell();
    c.name = name;
    let chord_letter = cell.substring(3,4);
    let chord = [0];
    if (chords != null && chord_letter != " " && chord_letter != ".") {
      chord=chords[chord_letter];
      if (chord == null) {
        throw new RangeError("Chord (" + chord_letter + ") not defined in cell: " + cell);
      }
    }
    for (let i = 0; i < chord.length; i++) {
      let freqi = note_i + transpose + chord[i];
      c.freqi.push(freqi);
      c.freq.push(Note(freqi));
    }
    c.to_index = sample_length;
    c.total_len = sample_length;
    c.sample_length = sample_length;

    c.column_index = column_index;

    // TODO implement me
    let effect = cell.substr(4, 1);
    if (effect=="x") {
      c.do_not_link=true;
    }
    
    let final_amplitude = cell.substr(5).replaceAll(" ", "").replaceAll(".", "");
    if (final_amplitude.length>0) {
      c.amplitude = parseInt(final_amplitude)/99;
      if (Number.isNaN(c.amplitude) || c.amplitude==null) {
        throw new RangeError("Could not parse amplitude '"+ final_amplitude +"'  in cell: '" + cell + "'. Must use numbers 00-99");
      }
    } else {
      c.amplitude = default_amplitude;
    }
    return [c];
  }

  PostParse(last) {
    if (last != null && last.GetKey() == this.GetKey()) {
      this.last=last;
      this.from_index = this.last.to_index;
      this.to_index = this.from_index + this.sample_length;
      this.total_len = last.total_len + this.sample_length;
      this.last.UpdateTotalLength(this.sample_length);
    }
  }
}

class SoundTracker {
  sample_length = 0;
  columns = [];

  amplitudes = [];
  transpose = [];
  quarter_mode = [];
  track_params = [];

  chords = {};
  overw=-1;
  instruments=[];
  compiled_tracks = [];
  echo = {
    echo_len: 0,
    echo_str: 0
  }
  
  constructor(beat_time) {
    this.sample_length = Math.floor(Math.floor(beat_time * 44100)/4)*4;
    this.AddChord("m", [0, 3, 7]);
    this.AddChord("M", [0, 4, 7]);
    this.AddChord("o", [0, 12]);
    this.AddChord("7", [0, 7]);
  }

  AddInstrument(snd_name, sound_factory) {
    this.instruments.push([snd_name,sound_factory.toString()]);
    return this;
  }

  GlobalEcho(len, str) {
    this.echo.echo_len = Math.floor(len * 44100);
    this.echo.echo_str = str;
    return this;
  }

  // Adds chord to play
  // e.g. basic minor (m) and major (M) chord are set by default with,
  // .AddChord("m",[0,3,7])
  // .AddChord("M",[0,4,7]).
  AddChord(letter, chord) {
    if (letter.length != 1) {
      throw new RangeError("Must supply single letter for chord.");
    }
    if (chord.length == 0) {
      throw new RangeError("Must supply at least 1 note for chord");
    }
    this.chords[letter] = chord;
    return this;
  }

  #GetCellVals(row, remove_space) {
    if (row.startsWith("|")) {
      row = row.substr(1);
    }
    if (row.endsWith("|")) {
      row = row.substr(0, row.length - 1);
    }
    let vals = row.split("|");
    if (!remove_space) {
      return vals;
    }
    for (let i = 0; i < vals.length; i++) {
      vals[i] = vals[i].replaceAll(" ", "").replaceAll(".", "");
    }
    return vals;
  }

  // columns fmt: "|Inst1 |Inst2 |Inst3 |Inst4 |Beat1 |"
  //         e.g. "|piano |bass  |toot  |flute |hihat |"
  Sound(row) {
    this.columns = this.#GetCellVals(row, true);
    this.amplitudes=[];
    this.transposes=[];
    this.quarter_mode=[];
    for (var i = 0; i < this.columns.length; i++) {
      this.amplitudes.push(1/this.columns.length);
      this.transposes.push(0);
      this.quarter_mode.push("n")
    }
    return this;
  }

  // Sets the default params (volume) for each row when
  // none are provided. May be called more than once.
  // number of cells must match number of instruments provided.
  // fmt: "|ttq..ll|ttq..ll|ttq..ll|ttq..ll|ttq..ll|"
  // tt: the amount to transpose the row up/down.
  // ll: number between 00 and 99 for the volume level of the row.
  // q: either 'q' for quarter-note mode 
  //    'b' for beat mode, or 'n' for regular note (A4) mode.
  //     
  //    q: In quarter-note mode music can be expresesd 1-character at a time
  //    by mapping keyboard keys to location of a keyboard.
  //     
  //     2 3   5 6 7   9 0
  //    ||||| ||||||| ||||| |
  //    ||||| ||||||| ||||| | 
  //    | | | | | | | | | | |
  //    | | | | | | | | | | |
  //     q w e r t y u i o p
  //     \C5         \C6
  //
  //     e.g. |qwet.40| represents play C5 D5 E5 F5 in rapid succession at volume 40.
  //     Shifting a note raises it an octave (e.g. Q is C6), "@" is C#6. The bottom
  //     rows of keys are also available, "z" maps to C3, "s"
  //     maps to C#3, etc... Notes can still be fused together, given they match the
  //     same pitch.
  // 
  //     b: In beat mode, frequency is not used (it will be passed in as -1), and
  //     quarter note like semantics are used, but 0-9 is used in place, to signal
  //     amplitude of each beat e.g. |5.55  40|, and notes cannot be fused. Amplitudes
  //     are multipleied by 11, so 5 represents 55, etc...
  Param(row) {
    let unparsed = this.#GetCellVals(row, false);
    if (unparsed.length != this.columns.length) {
      throw new RangeError("expected " + this.columns.length + " cells, got " 
      + unparsed.length + " when setting global sound params.")
    }
    let new_amplitudes = [];
    let new_transposes = [];
    let new_quarter_mode = [];
    for (let i = 0; i < unparsed.length; i++) {
      if (unparsed[i].length != 7) {
        throw new RangeError("Param doesn't use 7 character format: " + unparsed[i]);
      }
      let level = unparsed[i].substr(5).replaceAll(".", "").replaceAll(" ", "");
      if (level.length > 0) {
        new_amplitudes.push(parseInt(level)/99);
      } else if (this.amplitudes.length == this.columns.length) {
        new_amplitudes.push(this.amplitudes[i]);
      } else {
        new_amplitudes.push(1 / this.columns.length)
      }
      let transpose = unparsed[i].substr(0,2).replaceAll(".", "").replaceAll(" ", "");
      if (transpose.length > 0) {
        new_transposes.push(parseInt(transpose));
      } else if (this.transposes.length == this.columns.length) {
        new_transposes.push(this.transposes[i]);
      } else {
        new_transposes.push(1 / this.columns.length)
      }
      let quarter = unparsed[i].substr(2,1).replaceAll(".", "").replaceAll(" ", "");
      if (quarter.length > 0) {
        new_quarter_mode.push(quarter);
      } else if (this.quarter_mode.length == this.columns.length) {
        new_quarter_mode.push(this.quarter_mode[i]);
      } else {
        new_quarter_mode.push("n");
      }
    }
    this.amplitudes = new_amplitudes;
    this.transposes = new_transposes;
    this.quarter_mode = new_quarter_mode;
    return this;
  }

  // Adds/overwrites an individual track (in overwrite mode).
  // cell format: |nnncell|. Any blank characters should be "." or " "
  // nnn: Note in standard format, e.g. 'C4.' 'C#4' or 'D_4'
  //      also accepts notes in number, e.g. '48.'
  // e: any special effects to apply (TODO!)
  // ll: loudness between 00 to 99. Loudness defaults to 1/n, where n is number of instruments.
  // c: chord to play
  // row fmt: |nnncell|Inst2 |Inst3 |Inst4 |Beat1 |
  Track(row) {
    let vals = this.#GetCellVals(row, false);
    let compiled_cells = [];
    let last_row = null;
    if (this.overw == -1) {
      last_row = this.compiled_tracks.length == 0 ?
        null : this.compiled_tracks[this.compiled_tracks.length - 1];
    } else {
      last_row = this.overw == 0 ? null : this.compiled_tracks[this.overw - 1];
    }
    for (let i = 0; i < vals.length; i++) {
      let sound_name = this.columns[i];
      let parse_result = CompiledCell.Parse(
        sound_name,
        i, 
        vals[i], 
        this.sample_length, 
        this.amplitudes[i], 
        this.chords, 
        this.transposes[i], 
        this.quarter_mode[i]);
      for (let j = 0; j < parse_result.length; j++) {
        if (parse_result[j] != null && !parse_result[j].do_not_link) {
          let last_cell = (j == 0) ?
            (last_row==null ? null : last_row.Get(parse_result[j].GetKey()) )
            : parse_result[j - 1];
          if (last_cell != null) {
            parse_result[j].PostParse(last_cell);
          }
        }
        compiled_cells.push(parse_result[j]);
      }
    }
    if (this.overw == -1) {
      this.compiled_tracks.push(new CompiledRow(compiled_cells));
    } else {
      this.compiled_tracks[this.overw] = new CompiledRow(compiled_cells);
      this.overw++;
    }
    return this;
  }

  // Sinals to start overwriting on next call to Track at the ith position.
  // Use -1 to begin appending to end.
  OverwriteMode(i) {
    this.overw = i;
    return this;
  }
}