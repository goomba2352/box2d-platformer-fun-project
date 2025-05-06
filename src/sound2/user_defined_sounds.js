// This file is imported by async worker and has access to everything.
// Add any custom sound effects here.

class PianoFn extends SoundFn {
  freq;

  constructor(freq) {
    super();
    this.freq = freq;
  }

  fn(t) {
    // example taken from https://dsp.stackexchange.com/questions/46598/mathematical-equation-for-the-sound-wave-that-a-piano-makes
    let val = Math.sin(2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t);
    val += Math.sin(2 * 2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t) / 2;
    val += Math.sin(3 * 2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t) / 4;
    val += Math.sin(4 * 2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t) / 8;
    val += Math.sin(5 * 2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t) / 16;
    val += Math.sin(6 * 2 * Math.PI * this.freq * t) * Math.exp(-0.0004 * 2 * Math.PI * this.freq * t) / 32;
    return val;
  }
}

Piano = (freq) => {
  return Sound.New().AddFn(new PianoFn(freq));
}

SqaureV = (freq) => {
  return Sound.New()
    .AddFn(new VibratoFn(
      new SquareFn(freq),
      new SquareFn(freq * 1.015),
      new SinFn(6)))
    .AddFn(LinearFade.Out());
}

Sawtooth = (freq) => {
  return Sound.New()
    .AddFn(
      new HalfTriangleFn(freq))
    .AddFn(LinearFade.Out());
}

Harmonica = (freq) => {
  return Sound.New()
    .AddFn(new SquareFn(freq).SetOp(new MixOp(1)))
    .AddFn(new SquareFn(freq * 1.5).SetOp(new MixOp(.25)))
    .AddFn(new SquareFn(freq * .99).SetOp(new MixOp(.25)))
    .AddFn(new SquareFn(freq * 2).SetOp(new MixOp(.25)))
    .AddFn(new SquareFn(freq * 3).SetOp(new MixOp(.015)))
    .AddFn(LinearFade.Out(.7));
}

PianoV = (freq) => {
  return Sound.New()
    .AddFn(new VibratoFn(
      new PianoFn(freq),
      new PianoFn(freq * 1.001),
      new SinFn(6)))
    .AddFn(LinearFade.Out(.6));
}

ExpSound = (freq) => {
  let fn = new SinAddFn(freq,8,.4);
  fn.wave1=Waves.Square;
  return Sound.New().AddFn(fn)
}