importScripts("tracker.js");
importScripts("user_defined_sounds.js");

let snds = {};
let echo_len = 0;
let echo_str = 0 ;

function BuildSound(data) {
  snds[data.name] = eval(data.factory_string);
}

function GetSnd(name, freq) {
  return snds[name](freq);
}

self.onmessage = (e) => {
  if (e.data.snd != null) {
    BuildSound(e.data.snd);
    return;
  }
  if (e.data.echo_len != null) {
    echo_len = e.data.echo_len;
    echo_str = e.data.echo_str;
    return;
  }
  let buf = new Float32Array(e.data.buf);
  if (e.data.snds != null && e.data.snds.length == 1 && e.data.snds[0].end == true) {
    for (let i = 0; i < e.data.len; i++) {
      buf[e.data.segment * e.data.len + i] = 0
    }
    postMessage({ end: true, offset: e.data.segment * e.data.len, segment: e.data.segment, index: e.data.index })
    return;
  }
  let begin = performance.now();
  let rendered = new Float32Array(e.data.len);
  for (let i = 0; i < e.data.snds.length; i++) {
    let s = e.data.snds[i];
    let chord_length = s.freq.length;
    for (let j = 0; j < chord_length; j++) {
      let snd = GetSnd(s.name, s.freq[j]).Sample(s.big_len, s.amplitude * 1 / chord_length, s.render_begin, s.render_end);
      for (let k = 0; k < snd.length; k++) {
        rendered[k+s.start_offset] += snd[k];
      }
    }
  }
  for (let i = 0; i < e.data.len; i++) {
    buf[e.data.segment * e.data.len + i] = rendered[i];
    if (echo_str > 0) {
      let j = e.data.segment * e.data.len + i - echo_len;
      if (j<0) {
        j += buf.length;
      }
      buf[e.data.segment * e.data.len + i] += buf[j]*echo_str;
    }
  }
  let end = performance.now();
  
  // console.log("Async render time: " + (end - begin) + " ms. Budget: " + e.data.len/44.1 + "ms");
  postMessage({ end: false, offset: e.data.segment * e.data.len, segment:e.data.segment, index:e.data.index });
}