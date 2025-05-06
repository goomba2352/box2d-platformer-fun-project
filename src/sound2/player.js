// Provides API to play, seek and pause a sound tracker. 
//
// Also manages the memory buffer for sound and the 
// life cycle of the async rendering pipeline.
//
// The buffer which holds the sound has four sections, each section
// is rendered in a separate thread in worker.js
// Buffer: |SECTION_1|SECTION_2|SECTION_3|SECTION_4|
//
class SoundPlayer {

  // Private pls do not touch.
  #tracker;
  #abuf = null;
  #actx = null
  #asrc = null;
  #current_row = 0;
  #current_segment = 0;
  #is_playing = false;
  #loop = true;
  #play_on_next_render = false;
  #playing = false;
  #start_render_time = 0;
  #on_bar_change = [];
  #stop_on_next = false;
  #worker = null;
  #shared_buffer = null;
  #view = null;
  #gain_node = null;
  #ignore_end = false;

  constructor() {
    this.#actx = new AudioContext({ sampleRate: 44100 });
    if (window.location.href.indexOf("github.io")==-1) {
      this.#worker = new Worker("/src/sound2/worker.js");
    } else {
      this.#worker = new Worker("https://html-preview.github.io/?url=https://github.com/goomba2352/box2d-platformer-fun-project/blob/main/src/sound2.worker.js");
    }
    
    this.#gain_node = this.#actx.createGain();
    this.#gain_node.connect(this.#actx.destination);
    this.#gain_node.gain.value = 0;
    
    this.#worker.onmessage = this.#OnRenderFinish.bind(this);
  }
  // Public API:

  // Stops audio and loads in a new sound.
  LoadTracker(tracker) {
    this.#shared_buffer = new SharedArrayBuffer(tracker.sample_length*4*4);
    this.#view = new Float32Array(this.#shared_buffer);
    this.#tracker = tracker;
    this.#abuf = this.#actx.createBuffer(1, this.#view.length, 44100);
    this.#current_row = 0;
    this.#current_segment = 0;
    this.#playing = false;
    this.#ignore_end = false;
    if (this.#asrc) {
      this.#asrc.disconnect();
      this.#asrc.stop(0);
      this.#asrc = null;
    }
    for (let i = 0; i < this.#tracker.instruments.length; i++) {
      this.#worker.postMessage({
        snd: {
          name: this.#tracker.instruments[i][0],
          factory_string: this.#tracker.instruments[i][1]
        }
      }
      );
      this.#worker.postMessage(tracker.echo)
    }
    return this;
  }

  // Plays the current 
  Play(track_num=-1, loop = true) {
    if (this.#tracker == null) {
      throw new RangeError("No tracker loaded, call LoadTracker() first.");
    }
    this.#loop = loop;
    if (this.#asrc == null) {
      if (track_num==-1) {
        track_num = this.#current_row;
      }
      this.#asrc = this.#actx.createBufferSource();
      this.#asrc.connect(this.#actx.destination);
      this.#asrc.connect(this.#gain_node);
      this.#asrc.buffer = this.#abuf;
      this.#asrc.loop=true; // always loop, this class manages stopping.
      this.#current_segment = 0;
      this.#current_row = track_num;
      this.#play_on_next_render = true;
      this.#Render(track_num);
    } else {
      this.#ignore_end = true;
      if (track_num==-1) {
        // Play was called with no specific position in mind, and we are already playing.
        // Just return gracefully.
        return this;
      }
      // playnext/seek behavior intended, set
      // current_row to 1 less than intended row
      // so it plays next.
      track_num--;
      if (track_num<0) {
        track_num=this.#tracker.compiled_tracks.length-1;
      }
      this.#current_row = track_num;
    }
    return this;
  }

  // Pauses at the current location
  Pause() {
  // Even though the implementation looks like it stops, state is 
  // actually saved via current_track. Sorry, no ms granularity.
    if (this.#playing) {
      this.#playing = false;
      if (this.#asrc) {
        this.#asrc.disconnect();
        this.#asrc.stop(0);
        this.#asrc=null;
      }
    }
    return this;
  }

  Volume(percentage) {
    // Gain should be between -1 and 1, so percentage*2-1 will yeild
    // the correct result if -1<percentage<1
    this.#gain_node.gain.value = percentage * 2 - 1;
    return this;
  }

  #Render(track_num) {
    this.#worker.postMessage({
      snds: this.#tracker.compiled_tracks[track_num].SerializeRowForWorker(),
      len: this.#tracker.sample_length,
      segment: this.#current_segment,
      buf: this.#shared_buffer,
      index: track_num
    });
  }

  #Stop() {
    this.#worker.postMessage({
      snds: CompiledRow.End().SerializeRowForWorker(),
      len: this.#tracker.sample_length,
      segment: this.#current_segment,
      buf: this.#shared_buffer,
      index: 0
    });
  }

  #OnRenderFinish(e) {
    let copy = new Float32Array(
      this.#view.slice(
        e.data.offset, e.data.offset + this.#tracker.sample_length));
    if (e.data.end) {
      this.#stop_on_next=true;
    }
    if (this.#play_on_next_render) {
      if (!this.#playing && this.#asrc) {
        this.#asrc.start();
      }
      this.#actx.resume();
      this.#playing = true;
      this.#start_render_time = this.#actx.currentTime;
      this.#play_on_next_render=false;
      this.#UpdateRender();
    }
    if (this.#asrc && this.#asrc.buffer) {
      this.#asrc.buffer.copyToChannel(
        new Float32Array(copy), 0, e.data.offset);
    }
  }

  #UpdateRender() {
    if (!this.#playing) {
      return;
    }
    if (this.#start_render_time < this.#actx.currentTime) {
      this.#on_bar_change.forEach(callback => { callback(this.#current_row) });
      if (this.#stop_on_next) {
        this.Pause();
        this.#stop_on_next = false;
        this.#current_row = 0
        this.#current_segment = 0;
        return;
      }
      let next_row = (this.#current_row+1)%this.#tracker.compiled_tracks.length;
      let end = next_row == 0 && !this.#loop && !this.#ignore_end;
      this.#current_segment++;
      this.#current_segment%=4;
      if (this.#ignore_end) {
        this.#ignore_end = false
      }
      if (!end) {
        this.#Render(next_row);
      } else {
        this.#Stop();
      }
      this.#start_render_time = this.#start_render_time + this.#tracker.sample_length / 44100;
      this.#current_row=next_row;
    }
    setTimeout(this.#UpdateRender.bind(this), 5);
  }

  // only public for debugging. Pls readonly, this is a shared memory buffer.
  MemoryView() {
    return this.#view;
  }
}