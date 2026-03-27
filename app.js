(function () {
  const STORAGE_KEY = 'fight-flow-state-v2';
  const HISTORY_LIMIT = 20;
  const RING_RADIUS = 92;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const coachVoicePresets = [
    { id: 'auto', label: 'Auto detect' },
    { id: 'coach-1', label: 'American coach voice 1' },
    { id: 'coach-2', label: 'American coach voice 2' },
    { id: 'coach-3', label: 'American coach voice 3' },
  ];

  const builtInPresets = [
    {
      id: 'builtin-8-boxing',
      name: '8 Round Boxing Conditioning',
      mode: 'Boxing',
      rounds: 8,
      workDuration: 120,
      restDuration: 30,
      difficulty: 'Intermediate',
      comboStyle: 'Balanced',
      calloutFrequency: 'Every 7 sec',
      voicePreset: 'auto',
      builtIn: true,
    },
    {
      id: 'builtin-6-beginner',
      name: '6 Round Beginner Boxing',
      mode: 'Boxing',
      rounds: 6,
      workDuration: 90,
      restDuration: 45,
      difficulty: 'Beginner',
      comboStyle: 'Defense',
      calloutFrequency: 'Every 7 sec',
      voicePreset: 'auto',
      builtIn: true,
    },
    {
      id: 'builtin-5-kickboxing',
      name: '5 Round Kickboxing Sharpness',
      mode: 'Kickboxing',
      rounds: 5,
      workDuration: 120,
      restDuration: 40,
      difficulty: 'Intermediate',
      comboStyle: 'Balanced',
      calloutFrequency: 'Every 5 sec',
      voicePreset: 'auto',
      builtIn: true,
    },
    {
      id: 'builtin-10-pressure',
      name: '10 Round Pressure Mode',
      mode: 'Boxing',
      rounds: 10,
      workDuration: 120,
      restDuration: 30,
      difficulty: 'Advanced',
      comboStyle: 'Pressure',
      calloutFrequency: 'Random',
      voicePreset: 'coach-2',
      builtIn: true,
    },
    {
      id: 'builtin-3-quick',
      name: '3 Round Quick Sweat',
      mode: 'Kickboxing',
      rounds: 3,
      workDuration: 90,
      restDuration: 25,
      difficulty: 'Beginner',
      comboStyle: 'Freestyle',
      calloutFrequency: 'Every 5 sec',
      voicePreset: 'auto',
      builtIn: true,
    },
  ];

  const quickLaunchModes = {
    boxing: {
      entryMode: 'Boxing',
      mode: 'Boxing',
      comboStyle: 'Balanced',
      difficulty: 'Intermediate',
      coachPersonality: 'Coach',
      calloutFrequency: 'Every 7 sec',
    },
    'muay-thai': {
      entryMode: 'Muay Thai',
      mode: 'Kickboxing',
      comboStyle: 'Balanced',
      difficulty: 'Intermediate',
      coachPersonality: 'Coach',
      calloutFrequency: 'Every 7 sec',
    },
    chaos: {
      entryMode: 'Chaos',
      mode: 'Kickboxing',
      comboStyle: 'Freestyle',
      difficulty: 'Advanced',
      coachPersonality: 'Aggressive',
      calloutFrequency: 'Random',
    },
    cardio: {
      entryMode: 'Cardio',
      mode: 'Boxing',
      comboStyle: 'Pressure',
      difficulty: 'Beginner',
      coachPersonality: 'Aggressive',
      calloutFrequency: 'Every 10 sec',
    },
  };

  const segmentDefinitions = {
    mode: ['Boxing', 'Kickboxing'],
    difficulty: ['Beginner', 'Intermediate', 'Advanced'],
    comboStyle: ['Balanced', 'Pressure', 'Counter', 'Defense', 'Body shots', 'Freestyle'],
    coachPersonality: ['Minimal', 'Coach', 'Aggressive'],
    calloutFrequency: ['Every 5 sec', 'Every 7 sec', 'Every 10 sec', 'Random'],
  };

  const flavorLines = ['Sharp work.', 'Good engine.', 'You stayed in it.', 'That was clean.', 'Solid round management.'];
  const restLines = ['Breathe', 'Reset', 'Hands up', 'Next round coming'];
  const voiceLeadIns = {
    Minimal: [''],
    Coach: ['Sharp.', 'Set it.', 'Clean.'],
    Aggressive: ['Drive.', 'Rip it.', 'Go.'],
  };

  const comboFamilies = {
    Boxing: {
      Balanced: [
        ['jab', 'cross'],
        ['jab', 'cross', 'lead hook'],
        ['double jab', 'cross'],
        ['jab', 'rear uppercut', 'lead hook'],
        ['jab', 'cross', 'roll'],
      ],
      Pressure: [
        ['double jab', 'cross', 'lead hook'],
        ['jab', 'cross', 'lead hook', 'cross'],
        ['jab', 'cross', 'lead hook', 'rear uppercut'],
        ['jab', 'jab', 'cross', 'lead hook'],
      ],
      Counter: [
        ['slip left', 'cross', 'lead hook'],
        ['pull back', 'cross', 'lead hook'],
        ['roll', 'cross', 'lead hook'],
        ['slip right', 'cross', 'lead hook'],
      ],
      Defense: [
        ['jab', 'cross', 'pivot left'],
        ['jab', 'cross', 'roll'],
        ['slip left', 'cross'],
        ['jab', 'pull back', 'cross'],
      ],
      'Body shots': [
        ['jab', 'cross', 'lead hook to body'],
        ['lead hook to body', 'lead hook to head'],
        ['cross', 'lead hook to body', 'cross'],
      ],
      Freestyle: [
        ['jab', 'cross', 'lead hook'],
        ['slip left', 'cross', 'lead hook'],
        ['lead uppercut', 'rear uppercut', 'lead hook'],
      ],
    },
    Kickboxing: {
      Balanced: [
        ['jab', 'cross', 'rear low kick'],
        ['lead teep', 'cross'],
        ['jab', 'cross', 'rear body kick'],
        ['jab', 'cross', 'rear knee'],
      ],
      Pressure: [
        ['jab', 'cross', 'lead hook', 'rear low kick'],
        ['lead teep', 'jab', 'cross', 'rear body kick'],
        ['jab', 'cross', 'lead hook', 'rear knee'],
      ],
      Counter: [
        ['slip left', 'cross', 'rear low kick'],
        ['pull back', 'cross', 'rear body kick'],
        ['slip right', 'cross', 'lead hook', 'rear body kick'],
      ],
      Defense: [
        ['lead teep', 'reset'],
        ['jab', 'cross', 'pivot left'],
        ['check', 'cross', 'rear low kick'],
      ],
      'Body shots': [
        ['jab', 'cross', 'rear body kick'],
        ['lead hook to body', 'rear low kick'],
        ['cross', 'lead hook to body', 'rear knee'],
      ],
      Freestyle: [
        ['jab', 'cross', 'rear low kick'],
        ['lead teep', 'cross', 'lead hook'],
        ['jab', 'cross', 'rear head kick'],
      ],
    },
  };

  const offenseMoves = ['jab', 'cross', 'lead hook', 'rear hook', 'lead uppercut', 'rear uppercut'];
  const kickMoves = ['lead teep', 'rear teep', 'lead low kick', 'rear low kick', 'rear body kick', 'lead body kick', 'rear knee', 'lead knee'];
  const defensiveMoves = ['slip left', 'slip right', 'roll', 'pull back', 'pivot left', 'pivot right', 'reset', 'check'];

  const defaultState = {
    screen: 'home',
    returnScreen: 'home',
    setup: {
      entryMode: 'Boxing',
      mode: 'Boxing',
      rounds: 8,
      workDuration: 120,
      restDuration: 30,
      difficulty: 'Intermediate',
      comboStyle: 'Balanced',
      calloutFrequency: 'Every 7 sec',
      voicePreset: 'auto',
      coachPersonality: 'Coach',
    },
    preferences: {
      voiceEnabled: true,
      bellsEnabled: true,
      warningCues: true,
      speechRate: 0.92,
      selectedVoiceURI: '',
      largeText: false,
      keepAwake: false,
      vibrateOnStart: true,
      vibrateOnWarning: true,
      vibrateOnRest: true,
      muted: false,
    },
    presets: [],
    history: [],
  };

  const runtime = {
    state: loadState(),
    voices: [],
    countdownTimer: null,
    phaseTimer: null,
    comboTimer: null,
    phaseEndTime: 0,
    countdownValue: 3,
    currentSession: null,
    warningTriggered: false,
    wakeLock: null,
    deferredPrompt: null,
  };

  const els = cacheElements();

  function cacheElements() {
    return {
      screens: Array.from(document.querySelectorAll('.screen')),
      typeSegment: document.getElementById('typeSegment'),
      difficultySegment: document.getElementById('difficultySegment'),
      styleSegment: document.getElementById('styleSegment'),
      coachSegment: document.getElementById('coachSegment'),
      voiceSegment: document.getElementById('voiceSegment'),
      frequencySegment: document.getElementById('frequencySegment'),
      roundsInput: document.getElementById('roundsInput'),
      workInput: document.getElementById('workInput'),
      restInput: document.getElementById('restInput'),
      countdownRound: document.getElementById('countdownRound'),
      countdownMode: document.getElementById('countdownMode'),
      countdownNumber: document.getElementById('countdownNumber'),
      liveRoundLabel: document.getElementById('liveRoundLabel'),
      livePhase: document.getElementById('livePhase'),
      liveModeLabel: document.getElementById('liveModeLabel'),
      liveTimer: document.getElementById('liveTimer'),
      liveStatusText: document.getElementById('liveStatusText'),
      progressRing: document.getElementById('progressRing'),
      comboCard: document.getElementById('comboCard'),
      restCard: document.getElementById('restCard'),
      comboTag: document.getElementById('comboTag'),
      comboText: document.getElementById('comboText'),
      comboPreview: document.getElementById('comboPreview'),
      restMessage: document.getElementById('restMessage'),
      restPreview: document.getElementById('restPreview'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      completeRounds: document.getElementById('completeRounds'),
      completeTime: document.getElementById('completeTime'),
      completeCombos: document.getElementById('completeCombos'),
      completeMode: document.getElementById('completeMode'),
      completeFlavor: document.getElementById('completeFlavor'),
      presetList: document.getElementById('presetList'),
      historySessions: document.getElementById('historySessions'),
      historyRounds: document.getElementById('historyRounds'),
      historyMinutes: document.getElementById('historyMinutes'),
      historyMode: document.getElementById('historyMode'),
      historyList: document.getElementById('historyList'),
      settingsBackButton: document.getElementById('settingsBackButton'),
      installButton: document.getElementById('installButton'),
      resetDataButton: document.getElementById('resetDataButton'),
      speechRateInput: document.getElementById('speechRateInput'),
      speechRateValue: document.getElementById('speechRateValue'),
      voiceSelect: document.getElementById('voiceSelect'),
      voiceEnabledInput: document.getElementById('voiceEnabledInput'),
      bellEnabledInput: document.getElementById('bellEnabledInput'),
      warningEnabledInput: document.getElementById('warningEnabledInput'),
      wakeLockInput: document.getElementById('wakeLockInput'),
      largeTextInput: document.getElementById('largeTextInput'),
      vibrateStartInput: document.getElementById('vibrateStartInput'),
      vibrateWarningInput: document.getElementById('vibrateWarningInput'),
      vibrateRestInput: document.getElementById('vibrateRestInput'),
      soundToggle: document.getElementById('soundToggle'),
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState, presets: [...builtInPresets] };
      const parsed = JSON.parse(raw);
      return {
        ...(() => {
          const mergedSetup = { ...defaultState.setup, ...(parsed.setup || {}) };
          if (!mergedSetup.entryMode) {
            mergedSetup.entryMode = mergedSetup.mode === 'Kickboxing' ? 'Muay Thai' : mergedSetup.mode;
          }
          return {
            ...defaultState,
            ...parsed,
            setup: mergedSetup,
          };
        })(),
        preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) },
        presets: mergePresets(parsed.presets || []),
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    } catch (_error) {
      return { ...defaultState, presets: [...builtInPresets] };
    }
  }

  function mergePresets(customPresets) {
    const custom = customPresets.filter((preset) => !preset.builtIn);
    return [...builtInPresets, ...custom];
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime.state));
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (Number.isNaN(number)) return min;
    return Math.min(Math.max(number, min), max);
  }

  function formatClock(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.max(0, seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function formatMinutes(seconds) {
    return `${Math.round(seconds / 60)}`;
  }

  function formatSessionDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function createSegmentButtons(container, items, key, mapper) {
    container.innerHTML = '';
    items.forEach((item) => {
      const button = document.createElement('button');
      button.className = 'segment-button';
      button.type = 'button';
      button.textContent = mapper ? mapper(item) : item;
      button.dataset.key = key;
      button.dataset.value = typeof item === 'string' ? item : item.id;
      button.addEventListener('click', () => updateSetupValue(key, button.dataset.value));
      container.appendChild(button);
    });
  }

  function renderSegments() {
    createSegmentButtons(els.typeSegment, segmentDefinitions.mode, 'mode', (item) => (item === 'Kickboxing' ? 'Muay Thai' : item));
    createSegmentButtons(els.difficultySegment, segmentDefinitions.difficulty, 'difficulty');
    createSegmentButtons(els.styleSegment, segmentDefinitions.comboStyle, 'comboStyle');
    createSegmentButtons(els.coachSegment, segmentDefinitions.coachPersonality, 'coachPersonality');
    createSegmentButtons(els.frequencySegment, segmentDefinitions.calloutFrequency, 'calloutFrequency');
    createSegmentButtons(els.voiceSegment, coachVoicePresets, 'voicePreset', (item) => item.label);
  }

  function updateSegmentSelection() {
    document.querySelectorAll('.segment-button').forEach((button) => {
      const key = button.dataset.key;
      const value = button.dataset.value;
      button.classList.toggle('selected', String(runtime.state.setup[key]) === value);
    });
  }

  function updateSetupValue(key, value) {
    runtime.state.setup[key] = value;
    if (key === 'mode') {
      runtime.state.setup.entryMode = value === 'Kickboxing' ? 'Muay Thai' : value;
    }
    updateSegmentSelection();
    saveState();
  }

  function renderSetupForm() {
    els.roundsInput.value = runtime.state.setup.rounds;
    els.workInput.value = runtime.state.setup.workDuration;
    els.restInput.value = runtime.state.setup.restDuration;
    updateSegmentSelection();
  }

  function renderPreferences() {
    const prefs = runtime.state.preferences;
    els.voiceEnabledInput.checked = prefs.voiceEnabled;
    els.bellEnabledInput.checked = prefs.bellsEnabled;
    els.warningEnabledInput.checked = prefs.warningCues;
    els.speechRateInput.value = prefs.speechRate;
    els.speechRateValue.textContent = `${Number(prefs.speechRate).toFixed(2)}x`;
    els.voiceSelect.value = prefs.selectedVoiceURI;
    els.wakeLockInput.checked = prefs.keepAwake;
    els.largeTextInput.checked = prefs.largeText;
    els.vibrateStartInput.checked = prefs.vibrateOnStart;
    els.vibrateWarningInput.checked = prefs.vibrateOnWarning;
    els.vibrateRestInput.checked = prefs.vibrateOnRest;
    document.body.classList.toggle('large-text', prefs.largeText);
    els.soundToggle.textContent = prefs.muted ? '🔇' : '🔊';
  }

  function showScreen(name) {
    runtime.state.screen = name;
    els.screens.forEach((screen) => {
      screen.classList.toggle('screen-active', screen.dataset.screen === name);
    });
    saveState();
    if (name === 'history') renderHistory();
    if (name === 'presets') renderPresets();
    if (name === 'settings') renderPreferences();
  }

  function goToScreen(name, options) {
    if (options && options.returnScreen) {
      runtime.state.returnScreen = options.returnScreen;
    }
    showScreen(name);
  }

  function readNumericInputs() {
    runtime.state.setup.rounds = clampNumber(els.roundsInput.value, 1, 20);
    runtime.state.setup.workDuration = clampNumber(els.workInput.value, 10, 600);
    runtime.state.setup.restDuration = clampNumber(els.restInput.value, 5, 180);
    els.roundsInput.value = runtime.state.setup.rounds;
    els.workInput.value = runtime.state.setup.workDuration;
    els.restInput.value = runtime.state.setup.restDuration;
    saveState();
  }

  function currentVoiceURI() {
    const prefs = runtime.state.preferences;
    const preset = runtime.state.setup.voicePreset;
    if (preset === 'auto' || !preset) return prefs.selectedVoiceURI;
    const index = coachVoicePresets.findIndex((item) => item.id === preset);
    const available = runtime.voices.filter((voice) => voice.lang.toLowerCase().startsWith('en-us'));
    const voice = available[index - 1] || available[0] || runtime.voices[0];
    return voice ? voice.voiceURI : '';
  }

  function pickPreferredVoice(voices) {
    const priorities = [
      (voice) => /en-us/i.test(voice.lang) && /(david|guy|roger|jason|mark|tony|samantha|allison)/i.test(voice.name),
      (voice) => /en-us/i.test(voice.lang) && /(microsoft|natural|enhanced|premium)/i.test(voice.name),
      (voice) => /en-us/i.test(voice.lang),
      (voice) => /en/i.test(voice.lang),
    ];
    for (const matcher of priorities) {
      const match = voices.find(matcher);
      if (match) return match;
    }
    return voices[0];
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    runtime.voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (!runtime.state.preferences.selectedVoiceURI && runtime.voices.length > 0) {
      const preferred = pickPreferredVoice(runtime.voices);
      runtime.state.preferences.selectedVoiceURI = preferred.voiceURI;
      saveState();
    }
    els.voiceSelect.innerHTML = runtime.voices.length
      ? runtime.voices.map((voice) => `<option value="${voice.voiceURI}">${voice.name} (${voice.lang})</option>`).join('')
      : '<option value="">No English voices found</option>';
    renderPreferences();
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(text, priority) {
    if (!runtime.state.preferences.voiceEnabled || runtime.state.preferences.muted) return;
    if (!('speechSynthesis' in window)) return;
    const voiceURI = currentVoiceURI();
    if (!voiceURI) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = runtime.voices.find((item) => item.voiceURI === voiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = runtime.state.preferences.speechRate;
    utterance.volume = 1;
    utterance.pitch = 0.78;
    if (priority !== 'queue') window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  let audioContext = null;
  function audioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioContext) audioContext = new Ctx();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function playTone(frequency, duration, delay, volume) {
    const context = audioCtx();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  function playCue(kind) {
    if (!runtime.state.preferences.bellsEnabled || runtime.state.preferences.muted) return;
    if (kind === 'start') {
      playTone(880, 0.18, 0.02, 0.16);
      playTone(1174, 0.22, 0.25, 0.18);
      return;
    }
    if (kind === 'rest') {
      playTone(520, 0.2, 0.02, 0.15);
      playTone(440, 0.28, 0.24, 0.13);
      return;
    }
    if (kind === 'warning') {
      playTone(700, 0.08, 0.02, 0.12);
      playTone(700, 0.08, 0.18, 0.12);
      return;
    }
    playTone(784, 0.18, 0.02, 0.16);
    playTone(988, 0.18, 0.22, 0.18);
    playTone(1318, 0.34, 0.42, 0.2);
  }

  function vibrate(pattern) {
    if ('vibrate' in navigator && !runtime.state.preferences.muted) navigator.vibrate(pattern);
  }

  function getLeadIn() {
    const personality = runtime.state.setup.coachPersonality || 'Coach';
    const lines = voiceLeadIns[personality] || voiceLeadIns.Coach;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function familyPool() {
    const mode = runtime.state.setup.mode;
    const style = runtime.state.setup.comboStyle;
    return comboFamilies[mode][style] || comboFamilies[mode].Balanced;
  }

  function frequencyRange() {
    switch (runtime.state.setup.calloutFrequency) {
      case 'Every 5 sec':
        return [5, 5];
      case 'Every 7 sec':
        return [7, 7];
      case 'Every 10 sec':
        return [10, 10];
      default:
        return [4, 8];
    }
  }

  function difficultyLength() {
    if (runtime.state.setup.difficulty === 'Beginner') return 2;
    if (runtime.state.setup.difficulty === 'Advanced') return 5;
    return 4;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildProceduralCombos(maxLength) {
    const mode = runtime.state.setup.mode;
    const style = runtime.state.setup.comboStyle;
    const attackPool = mode === 'Kickboxing' ? [...offenseMoves, ...kickMoves] : [...offenseMoves];
    const combos = [];
    for (let i = 0; i < 4; i += 1) {
      const combo = [];
      combo.push(attackPool[Math.floor(Math.random() * attackPool.length)]);
      combo.push(attackPool[Math.floor(Math.random() * attackPool.length)]);
      if (style === 'Counter' || style === 'Defense') {
        combo.unshift(defensiveMoves[Math.floor(Math.random() * 4)]);
      }
      if (style === 'Pressure' || style === 'Body shots') {
        combo.push(attackPool[Math.floor(Math.random() * attackPool.length)]);
      } else if (Math.random() > 0.5) {
        combo.push(defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)]);
      }
      combos.push(combo.slice(0, maxLength));
    }
    return combos;
  }

  function generateCombo(previous) {
    const pool = shuffle(familyPool());
    const maxLength = difficultyLength();
    const candidates = pool
      .map((combo) => combo.slice(0, Math.min(combo.length, maxLength)))
      .concat(buildProceduralCombos(maxLength))
      .filter((combo) => combo.join(', ') !== previous);
    return candidates[0] || pool[0];
  }

  function describeComboStyle() {
    const style = runtime.state.setup.comboStyle;
    if (style === 'Pressure') return 'Pressure combo';
    if (style === 'Counter') return 'Counter reset';
    if (style === 'Defense') return 'Defense reset';
    if (style === 'Body shots') return 'Body attack';
    if (style === 'Freestyle') return 'Freestyle call';
    return 'Balanced combo';
  }

  function updateRing(progress) {
    els.progressRing.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    els.progressRing.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
  }

  function startCountdown() {
    readNumericInputs();
    runtime.countdownValue = 3;
    els.countdownRound.textContent = `Round 1 / ${runtime.state.setup.rounds}`;
    els.countdownMode.textContent = runtime.state.setup.mode;
    els.countdownNumber.textContent = '3';
    showScreen('countdown');
    stopSpeech();
    clearInterval(runtime.countdownTimer);
    if (runtime.state.preferences.voiceEnabled && !runtime.state.preferences.muted) speak('Get ready');
    runtime.countdownTimer = window.setInterval(() => {
      runtime.countdownValue -= 1;
      if (runtime.countdownValue > 0) {
        els.countdownNumber.textContent = String(runtime.countdownValue);
        document.body.classList.toggle('warning-state', runtime.countdownValue === 1);
        return;
      }
      clearInterval(runtime.countdownTimer);
      document.body.classList.remove('warning-state');
      els.countdownNumber.textContent = 'Go';
      playCue('start');
      setTimeout(startSession, 450);
    }, 900);
  }

  function sessionTotalDuration(config) {
    return config.rounds * config.workDuration + Math.max(config.rounds - 1, 0) * config.restDuration;
  }

  function startSession() {
    runtime.currentSession = {
      ...runtime.state.setup,
      phase: 'work',
      round: 1,
      timeRemaining: runtime.state.setup.workDuration,
      totalDuration: sessionTotalDuration(runtime.state.setup),
      combosCalled: 0,
      lastCombo: '',
      currentCombo: '',
      nextCombo: '',
      singleCallout: true,
    };
    runtime.warningTriggered = false;
    showScreen('live');
    els.pauseOverlay.classList.add('hidden');
    document.querySelector('[data-screen="live"]').classList.add('working');
    document.querySelector('[data-screen="live"]').classList.remove('resting');
    beginPhase('work');
  }

  function beginPhase(phase) {
    clearInterval(runtime.phaseTimer);
    clearTimeout(runtime.comboTimer);
    runtime.warningTriggered = false;
    const session = runtime.currentSession;
    if (!session) return;
    session.phase = phase;
    session.timeRemaining = phase === 'work' ? session.workDuration : session.restDuration;
    runtime.phaseEndTime = Date.now() + session.timeRemaining * 1000;
    if (phase === 'work') {
      document.querySelector('[data-screen="live"]').classList.add('working');
      document.querySelector('[data-screen="live"]').classList.remove('resting');
      playCue('start');
      if (runtime.state.preferences.vibrateOnStart) vibrate([40, 40, 60]);
      const combo = generateCombo(session.lastCombo);
      session.currentCombo = combo.join(', ');
      session.nextCombo = '';
      session.lastCombo = session.currentCombo;
      session.combosCalled += 1;
      updateLiveCombo(true);
      speakCallout(session.currentCombo);
    } else {
      document.querySelector('[data-screen="live"]').classList.remove('working');
      document.querySelector('[data-screen="live"]').classList.add('resting');
      playCue('rest');
      if (runtime.state.preferences.vibrateOnRest) vibrate([80, 50, 80]);
      els.comboCard.classList.add('hidden');
      els.restCard.classList.remove('hidden');
      els.restMessage.textContent = restLines[Math.floor(Math.random() * restLines.length)];
      els.restPreview.textContent = session.round < session.rounds ? `Up next: Round ${session.round + 1}` : 'Last push coming';
      els.liveStatusText.textContent = 'Reset and breathe';
      speak(els.restMessage.textContent);
    }
    renderLiveFrame();
    runtime.phaseTimer = window.setInterval(tickPhase, 250);
  }

  function tickPhase() {
    const session = runtime.currentSession;
    if (!session) return;
    const remaining = Math.max(0, Math.ceil((runtime.phaseEndTime - Date.now()) / 1000));
    session.timeRemaining = remaining;
    renderLiveFrame();
    if (remaining === 10 && !runtime.warningTriggered && runtime.state.preferences.warningCues && session.phase === 'work') {
      runtime.warningTriggered = true;
      playCue('warning');
      if (runtime.state.preferences.vibrateOnWarning) vibrate([60, 80, 60]);
      speak('10 seconds');
      document.body.classList.add('warning-state');
    }
    if (remaining > 0) return;

    document.body.classList.remove('warning-state');
    clearInterval(runtime.phaseTimer);
    if (session.phase === 'work') {
      if (session.round >= session.rounds) {
        completeSession();
      } else {
        beginPhase('rest');
      }
      return;
    }

    session.round += 1;
    beginPhase('work');
  }

  function scheduleCombo() {
    const session = runtime.currentSession;
    if (!session || session.phase !== 'work' || session.singleCallout) return;
    const range = frequencyRange();
    const seconds = range[0] === range[1] ? range[0] : range[0] + Math.random() * (range[1] - range[0]);
    runtime.comboTimer = window.setTimeout(() => {
      if (!runtime.currentSession || runtime.currentSession.phase !== 'work') return;
      runtime.currentSession.currentCombo = runtime.currentSession.nextCombo;
      runtime.currentSession.nextCombo = generateCombo(runtime.currentSession.currentCombo).join(', ');
      runtime.currentSession.lastCombo = runtime.currentSession.currentCombo;
      runtime.currentSession.combosCalled += 1;
      updateLiveCombo();
      speakCallout(runtime.currentSession.currentCombo);
      scheduleCombo();
    }, seconds * 1000);
  }

  function speakCallout(comboText) {
    const leadIn = getLeadIn();
    const phrase = formatCoachCallout(comboText, leadIn);
    speak(phrase);
  }

  function formatCoachCallout(comboText, leadIn) {
    const replacements = {
      'lead hook': 'left hook',
      'rear hook': 'right hook',
      'lead uppercut': 'left uppercut',
      'rear uppercut': 'right uppercut',
      'lead low kick': 'left low kick',
      'rear low kick': 'right low kick',
      'lead body kick': 'left body kick',
      'rear body kick': 'right body kick',
      'lead head kick': 'left head kick',
      'rear head kick': 'right head kick',
      'lead knee': 'left knee',
      'rear knee': 'right knee',
      'lead teep': 'left teep',
      'rear teep': 'right teep',
    };
    const actions = comboText
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
      .map((part) => replacements[part] || part);
    const body = actions.map((action) => action.charAt(0).toUpperCase() + action.slice(1)).join('. ');
    return leadIn ? `${leadIn} ${body}.` : `${body}.`;
  }

  function updateLiveCombo(initial) {
    const session = runtime.currentSession;
    if (!session) return;
    els.comboCard.classList.remove('hidden');
    els.restCard.classList.add('hidden');
    els.comboTag.textContent = describeComboStyle();
    els.comboText.textContent = session.currentCombo;
    els.comboPreview.textContent = 'Hold this combo for the round';
    els.liveStatusText.textContent = initial ? 'One call. Work it clean.' : 'Stay on the call';
  }

  function renderLiveFrame() {
    const session = runtime.currentSession;
    if (!session) return;
    els.liveRoundLabel.textContent = `Round ${session.round} / ${session.rounds}`;
    els.livePhase.textContent = session.phase === 'work' ? 'WORK' : 'REST';
    els.livePhase.className = `phase-pill ${session.phase === 'work' ? '' : 'rest'}`.trim();
    els.liveModeLabel.textContent = (session.entryMode || session.mode).toUpperCase();
    els.liveTimer.textContent = formatClock(session.timeRemaining);
    const phaseLength = session.phase === 'work' ? session.workDuration : session.restDuration;
    updateRing(Math.max(0, 1 - session.timeRemaining / phaseLength));
  }

  function pauseSession() {
    if (!runtime.currentSession) return;
    clearInterval(runtime.phaseTimer);
    clearTimeout(runtime.comboTimer);
    runtime.currentSession.timeRemaining = Math.max(0, Math.ceil((runtime.phaseEndTime - Date.now()) / 1000));
    stopSpeech();
    els.pauseOverlay.classList.remove('hidden');
  }

  function resumeSession() {
    if (!runtime.currentSession) return;
    els.pauseOverlay.classList.add('hidden');
    runtime.phaseEndTime = Date.now() + runtime.currentSession.timeRemaining * 1000;
    runtime.phaseTimer = window.setInterval(tickPhase, 250);
    if (runtime.currentSession.phase === 'work') {
      speakCallout(runtime.currentSession.currentCombo);
    }
  }

  function exitSession() {
    clearInterval(runtime.phaseTimer);
    clearTimeout(runtime.comboTimer);
    clearInterval(runtime.countdownTimer);
    stopSpeech();
    runtime.currentSession = null;
    document.body.classList.remove('warning-state');
    els.pauseOverlay.classList.add('hidden');
    showScreen('home');
  }

  function restartSession() {
    exitSession();
    startCountdown();
  }

  function completeSession() {
    if (!runtime.currentSession) return;
    clearInterval(runtime.phaseTimer);
    clearTimeout(runtime.comboTimer);
    const session = runtime.currentSession;
    playCue('complete');
    speak('Workout complete');
    const totalTime = session.totalDuration;
    const record = {
      date: new Date().toLocaleString(),
      mode: session.entryMode || session.mode,
      rounds: session.rounds,
      durationSeconds: totalTime,
      combosCalled: session.combosCalled,
    };
    runtime.state.history = [record, ...runtime.state.history].slice(0, HISTORY_LIMIT);
    saveState();
    els.completeRounds.textContent = String(session.rounds);
    els.completeTime.textContent = formatSessionDuration(totalTime);
    els.completeCombos.textContent = String(session.combosCalled);
    els.completeMode.textContent = session.entryMode || session.mode;
    els.completeFlavor.textContent = flavorLines[Math.floor(Math.random() * flavorLines.length)];
    runtime.currentSession = null;
    showScreen('complete');
  }

  function savePreset() {
    readNumericInputs();
    const setup = runtime.state.setup;
    const preset = {
      id: `custom-${Date.now()}`,
      name: `${setup.rounds} Round ${setup.entryMode || setup.mode} ${setup.comboStyle}`,
      entryMode: setup.entryMode || setup.mode,
      mode: setup.mode,
      rounds: setup.rounds,
      workDuration: setup.workDuration,
      restDuration: setup.restDuration,
      difficulty: setup.difficulty,
      comboStyle: setup.comboStyle,
      calloutFrequency: setup.calloutFrequency,
      voicePreset: setup.voicePreset,
      builtIn: false,
    };
    runtime.state.presets = mergePresets([...runtime.state.presets.filter((item) => !item.builtIn), preset]);
    saveState();
    renderPresets();
  }

  function applyPreset(id) {
    const preset = runtime.state.presets.find((item) => item.id === id);
    if (!preset) return;
    runtime.state.setup = {
      ...runtime.state.setup,
      entryMode: preset.entryMode || (preset.mode === 'Kickboxing' ? 'Muay Thai' : preset.mode),
      mode: preset.mode,
      rounds: preset.rounds,
      workDuration: preset.workDuration,
      restDuration: preset.restDuration,
      difficulty: preset.difficulty,
      comboStyle: preset.comboStyle,
      calloutFrequency: preset.calloutFrequency,
      voicePreset: preset.voicePreset || 'auto',
    };
    saveState();
    renderSetupForm();
    showScreen('setup');
  }

  function launchQuickMode(modeKey) {
    const config = quickLaunchModes[modeKey];
    if (!config) return;
    runtime.state.setup = {
      ...runtime.state.setup,
      ...config,
    };
    saveState();
    renderSetupForm();
    startCountdown();
  }

  function deletePreset(id) {
    runtime.state.presets = mergePresets(runtime.state.presets.filter((item) => item.id !== id && !item.builtIn));
    saveState();
    renderPresets();
  }

  function renderPresets() {
    if (!runtime.state.presets.length) {
      els.presetList.innerHTML = '<section class="card"><p>No presets saved yet.</p></section>';
      return;
    }
    els.presetList.innerHTML = runtime.state.presets
      .map(
        (preset) => `
          <section class="preset-row">
            <strong>${preset.name}</strong>
            <div class="preset-meta">
              <span class="pill">${preset.rounds} rounds</span>
              <span class="pill">${formatClock(preset.workDuration)} / ${formatClock(preset.restDuration)}</span>
              <span class="pill">${preset.entryMode || (preset.mode === 'Kickboxing' ? 'Muay Thai' : preset.mode)}</span>
              <span class="pill">${preset.difficulty}</span>
              <span class="pill">${preset.calloutFrequency}</span>
            </div>
            <div class="preset-actions">
              <button class="button button-secondary" data-preset-start="${preset.id}">Start</button>
              <button class="button button-ghost" data-preset-edit="${preset.id}">Edit</button>
              ${preset.builtIn ? '' : `<button class="button button-ghost" data-preset-delete="${preset.id}">Delete</button>`}
            </div>
          </section>
        `,
      )
      .join('');
  }

  function renderHistory() {
    const history = runtime.state.history;
    els.historySessions.textContent = String(history.length);
    els.historyRounds.textContent = String(history.reduce((sum, item) => sum + item.rounds, 0));
    els.historyMinutes.textContent = formatMinutes(history.reduce((sum, item) => sum + item.durationSeconds, 0));
    const modeCounts = history.reduce((acc, item) => {
      acc[item.mode] = (acc[item.mode] || 0) + 1;
      return acc;
    }, {});
    const favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
    els.historyMode.textContent = favoriteMode ? favoriteMode[0] : '-';
    els.historyList.innerHTML = history.length
      ? history
          .map(
            (item) => `
              <article class="session-row">
                <strong>${item.date}</strong>
                <div class="session-meta">
                  <span class="pill">${item.mode}</span>
                  <span class="pill">${item.rounds} rounds</span>
                  <span class="pill">${formatSessionDuration(item.durationSeconds)}</span>
                </div>
              </article>
            `,
          )
          .join('')
      : '<p class="muted-chip">No sessions logged yet.</p>';
  }

  async function requestWakeLock(enabled) {
    if (!('wakeLock' in navigator)) return;
    try {
      if (enabled && !runtime.wakeLock) {
        runtime.wakeLock = await navigator.wakeLock.request('screen');
      } else if (!enabled && runtime.wakeLock) {
        await runtime.wakeLock.release();
        runtime.wakeLock = null;
      }
    } catch (_error) {
      runtime.state.preferences.keepAwake = false;
      els.wakeLockInput.checked = false;
      saveState();
    }
  }

  async function installApp() {
    if (runtime.deferredPrompt) {
      runtime.deferredPrompt.prompt();
      await runtime.deferredPrompt.userChoice;
      runtime.deferredPrompt = null;
      return;
    }
    alert('Use your browser menu and choose "Add to Home Screen" or "Install App".');
  }

  function resetSavedData() {
    runtime.state = {
      ...defaultState,
      presets: [...builtInPresets],
    };
    saveState();
    renderSetupForm();
    renderPreferences();
    renderPresets();
    renderHistory();
    showScreen('home');
  }

  function toggleMute() {
    runtime.state.preferences.muted = !runtime.state.preferences.muted;
    if (runtime.state.preferences.muted) stopSpeech();
    renderPreferences();
    saveState();
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      return;
    }
    await document.exitFullscreen?.();
  }

  function registerEvents() {
    document.querySelectorAll('[data-go]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.go;
        const returnScreen = button.dataset.settingsReturn;
        goToScreen(target, returnScreen ? { returnScreen } : undefined);
      });
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'launch-mode') return launchQuickMode(button.dataset.launchMode);
        if (action === 'start-session') return showScreen('setup');
        if (action === 'quick-start') return startCountdown();
        if (action === 'begin-countdown') return startCountdown();
        if (action === 'save-preset') return savePreset();
        if (action === 'pause-session') return pauseSession();
        if (action === 'resume-session') return resumeSession();
        if (action === 'restart-session') return restartSession();
        if (action === 'exit-session') return exitSession();
        if (action === 'mute-session') return toggleMute();
        if (action === 'toggle-fullscreen') return toggleFullscreen();
        if (action === 'run-again') return startCountdown();
      });
    });

    els.roundsInput.addEventListener('input', readNumericInputs);
    els.workInput.addEventListener('input', readNumericInputs);
    els.restInput.addEventListener('input', readNumericInputs);

    els.voiceEnabledInput.addEventListener('change', () => {
      runtime.state.preferences.voiceEnabled = els.voiceEnabledInput.checked;
      saveState();
    });
    els.bellEnabledInput.addEventListener('change', () => {
      runtime.state.preferences.bellsEnabled = els.bellEnabledInput.checked;
      saveState();
    });
    els.warningEnabledInput.addEventListener('change', () => {
      runtime.state.preferences.warningCues = els.warningEnabledInput.checked;
      saveState();
    });
    els.speechRateInput.addEventListener('input', () => {
      runtime.state.preferences.speechRate = Number(els.speechRateInput.value);
      renderPreferences();
      saveState();
    });
    els.voiceSelect.addEventListener('change', () => {
      runtime.state.preferences.selectedVoiceURI = els.voiceSelect.value;
      saveState();
    });
    els.largeTextInput.addEventListener('change', () => {
      runtime.state.preferences.largeText = els.largeTextInput.checked;
      renderPreferences();
      saveState();
    });
    els.wakeLockInput.addEventListener('change', async () => {
      runtime.state.preferences.keepAwake = els.wakeLockInput.checked;
      await requestWakeLock(els.wakeLockInput.checked);
      saveState();
    });
    els.vibrateStartInput.addEventListener('change', () => {
      runtime.state.preferences.vibrateOnStart = els.vibrateStartInput.checked;
      saveState();
    });
    els.vibrateWarningInput.addEventListener('change', () => {
      runtime.state.preferences.vibrateOnWarning = els.vibrateWarningInput.checked;
      saveState();
    });
    els.vibrateRestInput.addEventListener('change', () => {
      runtime.state.preferences.vibrateOnRest = els.vibrateRestInput.checked;
      saveState();
    });

    els.settingsBackButton.addEventListener('click', () => showScreen(runtime.state.returnScreen || 'home'));
    els.installButton.addEventListener('click', installApp);
    els.resetDataButton.addEventListener('click', resetSavedData);
    els.soundToggle.addEventListener('click', toggleMute);

    els.presetList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.presetStart) {
        applyPreset(target.dataset.presetStart);
        startCountdown();
      }
      if (target.dataset.presetEdit) applyPreset(target.dataset.presetEdit);
      if (target.dataset.presetDelete) deletePreset(target.dataset.presetDelete);
    });

    window.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (runtime.currentSession) {
          if (els.pauseOverlay.classList.contains('hidden')) pauseSession();
          else resumeSession();
        }
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        if (runtime.currentSession) restartSession();
      }
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      runtime.deferredPrompt = event;
    });

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && runtime.state.preferences.keepAwake) {
        await requestWakeLock(true);
      }
    });
  }

  async function registerPWA() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
      } catch (_error) {
        // Ignore registration failures in file-based contexts.
      }
    }
  }

  function init() {
    if (['live', 'countdown'].includes(runtime.state.screen)) {
      runtime.state.screen = 'home';
    }
    renderSegments();
    renderSetupForm();
    renderPresets();
    renderHistory();
    renderPreferences();
    registerEvents();
    showScreen(runtime.state.screen || 'home');
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    registerPWA();
    requestWakeLock(runtime.state.preferences.keepAwake);
  }

  init();
})();
