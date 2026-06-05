// Controls the UI flow and renders positions from POSITIONS object.

(function(){
  // appliquer la configuration des cercles définie dans positions.js
  if (typeof CIRCLE_CONFIG !== 'undefined') {
    const root = document.documentElement;
    // circleSize attendu en px (nombre) ou chaîne ; normaliser en px si nombre
    const sizeValue = (typeof CIRCLE_CONFIG.circleSize === 'number') ? (CIRCLE_CONFIG.circleSize + 'px') : CIRCLE_CONFIG.circleSize;
    const gapValue = CIRCLE_CONFIG.gap || '5cm';
    root.style.setProperty('--circle-size', sizeValue);
    root.style.setProperty('--gap', gapValue);
  }

  const titleScreen = document.getElementById('titleScreen');
  const arenaScreen = document.getElementById('arenaScreen');
  const positionsContainer = document.getElementById('positionsContainer');
  const phaseLabel = document.getElementById('phaseLabel');
  const leftCircle = document.getElementById('leftCircle');
  const rightCircle = document.getElementById('rightCircle');

  // show/hide screens by id (e.g. 'titleScreen' or 'arenaScreen')
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>{
      if (s.id === id) s.classList.add('active'); else s.classList.remove('active');
    });
    
  }

  function hidePairElements() {
    const selectors = [
        '#pairList > div > div.playerBox.active > div',
        '#pairList > div > div:nth-child(1) > div'
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.style.display = 'none';
        });
    });
    }
  // render title UI: clear selection visuals and show title
  function renderTitle(){
    document.querySelectorAll('.partyMember').forEach(m=>m.classList.remove('selected'));
    selectedPlayerIndex = null;
    lastDraw = null;
    currentPattern = null;
    showScreen('titleScreen');
  }

  // placeholder expected label functions for even/bait modes
  function expectedLabelForEven(){
    if (typeof RESOLUTION_RULES === 'undefined') return null;
    if (!currentPattern) return null;
    // decide which even rule set to use based on sequenceCounter (SET)
    const setNum = sequenceCounter || 0;
    let key = null;
    if (setNum === 2 || setNum === 8) key = 'even2_8';
    else if (setNum === 4 || setNum === 6) key = 'even4_6';
    else return null; // no rules for other sets

    const container = RESOLUTION_RULES[key];
    if (!container) return null;
    const rules = container[currentPattern];
    if (!rules) return null;

    const playerIdx = selectedPlayerIndex;
    if (playerIdx === null || playerIdx === undefined) return null;
    const partnerIdx = getPartnerIndex(playerIdx);
    const playerRole = ROLE_ORDER[playerIdx];
    // prefer pairSymbolsState if present and matching the selected player/partner; fall back to lastDraw
    function symbolFromLastDraw(idx){
      if (!lastDraw) return null;
      if (idx === lastDraw.plusSupportIndex || idx === lastDraw.plusDpsIndex) return 'plus';
      const supports = ['H1','MT','H2','OT'];
      const role = ROLE_ORDER[idx];
      if (supports.includes(role)) return lastDraw.supportsSymbol;
      return lastDraw.dpsSymbol;
    }
    let playerSym = null, partnerSym = null;
    if (pairSymbolsState && Array.isArray(pairSymbolsState.indices) && pairSymbolsState.indices.length===2) {
      // check that the pairSymbolsState corresponds to the currently selected pair
      const [aIdx,bIdx] = pairSymbolsState.indices;
      if ((aIdx === playerIdx && bIdx === partnerIdx) || (aIdx === partnerIdx && bIdx === playerIdx)){
        // map symbols according to stored indices order
        if (pairSymbolsState.indices[0] === playerIdx) playerSym = pairSymbolsState.symbols[0];
        else playerSym = pairSymbolsState.symbols[1];
        if (pairSymbolsState.indices[0] === partnerIdx) partnerSym = pairSymbolsState.symbols[0];
        else partnerSym = pairSymbolsState.symbols[1];
      }
    }
    if (!playerSym || !partnerSym){
      playerSym = symbolFromLastDraw(playerIdx);
      partnerSym = symbolFromLastDraw(partnerIdx);
    }

    for (const r of rules){
      let ok = true;
      if (r.role && r.role !== 'any' && r.role !== playerRole) ok = false;
      if (r.playerHas && r.playerHas !== playerSym) ok = false;
      if (r.partnerHas && r.partnerHas !== partnerSym) ok = false;
      if (typeof r.sameAsPartner !== 'undefined'){
        if (r.sameAsPartner && playerSym !== partnerSym) ok = false;
        if (!r.sameAsPartner && playerSym === partnerSym) ok = false;
      }
      if (!ok) continue;
      return r.pos;
    }
    return null;
  }

  function expectedLabelForBait(){
    if (!futurPastState) return null;
    return (futurPastState === 'FUTUR') ? 'BF' : 'BP';
  }

  // sequence requested: Title -> (impair->paire->bait) repeated 4 times
  const sequence = [
    'impair','paire','bait',
    'impair','paire','bait',
    'impair','paire','bait',
    'impair','paire','bait'
  ];

  const screens = {
    'title': () => { showScreen('titleScreen'); },
    'impair': () => { showArenaWithPositions('odd', 'Impair'); },
    'paire':  () => { showArenaWithPositions('even', 'Paire'); },
    'bait':   () => { showArenaWithPositions('bait', 'Bait'); }
  };

  // show arena and prepare pair list + positions for given mode and label
  function showArenaWithPositions(mode, label){
    showScreen('arenaScreen');
    phaseLabel.textContent = label || '';
    phaseLabel.dataset.mode = mode;
    // render pair list (ensures pair boxes exist for potential draw)
    renderPairList();
    // if we have previously drawn pair symbols, restore them onto the newly created boxes
    /*
    if (pairSymbolsState && Array.isArray(pairSymbolsState.indices) && pairSymbolsState.indices.length===2){
      restorePairSymbols();
    }*/
    // If entering an even/paire screen, pick and show FUTUR/PAST
    if (mode === 'even' || mode === 'paire'){
      setFuturPastRandom();
    }
    // For bait we keep the futurPastState value but hide the overlay (should not remain visible)
    if (mode === 'bait'){
      renderFuturPastOverlay(false);
    }
    // For other non-even modes we hide the overlay as well
    if (mode !== 'even' && mode !== 'paire' && mode !== 'bait'){
      renderFuturPastOverlay(false);
    }
    // render the positions for this mode
    renderPositions(mode);
  }

  // restore existing pairSymbolsState into the DOM (used when pair boxes are recreated)
  function restorePairSymbols(){
    if (!pairSymbolsState || !Array.isArray(pairSymbolsState.indices)) return;
    const indices = pairSymbolsState.indices;
    const symbols = pairSymbolsState.symbols;
    indices.forEach((idx, i)=>{
      const box = document.querySelector(`.playerBox[data-idx='${idx}']`);
      if (!box) return;
      // create a matching symbol element using createSymbolElement
      const type = symbols[i];
      const el = createSymbolElement(type);
      el.classList.add('pairSymbol');
      el.style.position = 'absolute';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      box.appendChild(el);
    });
  }

  // state for click-driven cinematic
  let cinematicRunning = false;
  let currentSeqIndex = -1;
  // persistent draw state
  let lastDraw = null; // { supportsSymbol, dpsSymbol, plusSupportIndex, plusDpsIndex }
  // selected player and partner to follow
  let selectedPlayerIndex = null; // index in ROLE_ORDER
  // current resolution pattern ('A' or 'B')
  let currentPattern = null;
  // sequence counter for impair/paire occurrences
  let sequenceCounter = null;
  // store the last pair-symbols drawn (for player and partner)
  let pairSymbolsState = null; // { indices: [playerIdx, partnerIdx], symbols: [symA, symB], mode }
  // store FUTUR/PAST shown during even sets
  let futurPastState = null; // 'FUTUR' | 'PAST' | null

  // overlay element for FUTUR/PAST (created on demand)
  let futurPastEl = null;

  function renderFuturPastOverlay(show){
    if (!futurPastEl){
      futurPastEl = document.createElement('div');
      futurPastEl.id = 'futurPastOverlay';
      futurPastEl.style.position = 'absolute';
      futurPastEl.style.left = '50%';
      futurPastEl.style.top = '50%';
      futurPastEl.style.transform = 'translate(-50%, -50%)';
      futurPastEl.style.pointerEvents = 'none';
      // higher than pair list and other UI pieces
      futurPastEl.style.zIndex = '10001';
      // append to arena container so positioning and stacking work with overflow rules
      const arena = document.querySelector('.arena') || document.body;
      arena.appendChild(futurPastEl);
    }
    // If asked to hide, always hide
    if (!show){
      futurPastEl.style.display = 'none';
  // console.debug('renderFuturPastOverlay: hiding overlay');
      return;
    }
    // If asked to show, only allow showing when we're currently on an even/paire screen
    const currentMode = (phaseLabel && phaseLabel.dataset) ? phaseLabel.dataset.mode : null;
    if (currentMode !== 'even' && currentMode !== 'paire'){
      // don't show overlay if not in the even/paire mode (keeps it hidden during bait)
      futurPastEl.style.display = 'none';
  // console.debug('renderFuturPastOverlay: requested show but currentMode=', currentMode, '-> overlay suppressed');
      return;
    }
    // apply styles from FUTUR_PAST_CONFIG if available
    if (typeof FUTUR_PAST_CONFIG !== 'undefined'){
      futurPastEl.style.fontSize = FUTUR_PAST_CONFIG.fontSize || '56px';
      futurPastEl.style.color = FUTUR_PAST_CONFIG.color || '#ffd54f';
      futurPastEl.style.fontFamily = FUTUR_PAST_CONFIG.fontFamily || 'Arial, sans-serif';
      futurPastEl.style.fontWeight = FUTUR_PAST_CONFIG.weight || '700';
      // optional line height
      if (FUTUR_PAST_CONFIG.lineHeight) futurPastEl.style.lineHeight = FUTUR_PAST_CONFIG.lineHeight;
      // allow a vertical offset to nudge the overlay up/down
      const offsetY = FUTUR_PAST_CONFIG.offsetY || '0px';
      futurPastEl.style.transform = `translate(-50%, calc(-50% + ${offsetY}))`;
    }
    futurPastEl.style.display = 'block';
    futurPastEl.textContent = futurPastState || '';
  }

  function setFuturPastRandom(){
    // randomly choose FUTUR or PAST and persist
    futurPastState = (Math.random() < 0.5) ? 'FUTUR' : 'PAST';
    renderFuturPastOverlay(true);
  }

  // Start from title
  showScreen('titleScreen');

  // attach click handlers to party members (select or start cinematic)
  document.querySelectorAll('.partyMember').forEach((el, idx)=>{
    el.addEventListener('click', (ev)=>{
      if (cinematicRunning) return; // ignore while running
      // if title screen: select the clicked player (toggle) and show symbols then start
      if (titleScreen.classList.contains('active')){
        // toggle selection
        if (selectedPlayerIndex === idx) {
          // deselect
          selectedPlayerIndex = null;
          el.classList.remove('selected');
          // still show pre-sequence symbols but don't start cinematic
          showPreSequenceSymbols().then(()=> {});
        } else {
          // select this player and mark partner visually
          selectedPlayerIndex = idx;
          document.querySelectorAll('.partyMember').forEach((m,i)=> m.classList.toggle('selected', i===idx || i===getPartnerIndex(idx)));
          // show symbols for configured duration then compute pattern and start cinematic
          showPreSequenceSymbols().then(()=>{
            computePatternForSelection();
            startCinematic();
          });
        }
      }
    });
  });

  // roles mapping according to order in title grid
  const ROLE_ORDER = ['H1','MT','M1','R1','H2','OT','M2','R2'];

  // helper to show symbols under party members for 3 seconds
  function showPreSequenceSymbols(){
    return new Promise((resolve)=>{
      const members = Array.from(document.querySelectorAll('.partyMember'));
      // determine roles groups
      const supports = ['H1','MT','H2','OT'];
      const dps = ['M1','R1','M2','R2'];

      // decide which group gets cone vs circle randomly
      let supportsSymbol, dpsSymbol;
      if (Math.random() < 0.5) {
        supportsSymbol = 'cone';
        dpsSymbol = 'circle';
      } else {
        supportsSymbol = 'circle';
        dpsSymbol = 'cone';
      }
  // console.log('SET', supportsSymbol, dpsSymbol);

  // pick one random index in each group to be the '+' instead
  const supportIndices = [0,1,4,5]; // positions in ROLE_ORDER for supports
  const dpsIndices = [2,3,6,7];
  const plusSupport = supportIndices[Math.floor(Math.random() * supportIndices.length)];
  const plusDps = dpsIndices[Math.floor(Math.random() * dpsIndices.length)];
  // persist draw
  lastDraw = { supportsSymbol, dpsSymbol, plusSupportIndex: plusSupport, plusDpsIndex: plusDps };
  // explicit TIRAGE log for debugging/visibility
  // persist draw (no console logging here)

      // clear any existing symbols
      members.forEach(m=>{
        const existing = m.querySelector('.symbol');
        if (existing) existing.remove();
      });

      members.forEach((m, i)=>{
        const role = ROLE_ORDER[i] || m.textContent.trim();
        // determine which symbol this member receives
        let type = '';
        if (i === plusSupport || i === plusDps) {
          type = 'plus';
        } else if (supports.includes(role)){
          type = supportsSymbol; // 'cone' or 'circle'
        } else {
          type = dpsSymbol; // 'circle' or 'cone'
        }
        const symbol = createSymbolElement(type);
        m.appendChild(symbol);
      });

      // remove symbols after configured pre-sequence duration
      setTimeout(()=>{
        members.forEach(m=>{
          const existing = m.querySelector('.symbol');
          if (existing) existing.remove();
        });
        resolve();
      }, (typeof PRE_SEQUENCE_DURATION_MS !== 'undefined') ? PRE_SEQUENCE_DURATION_MS : 3000);
    });
  }

  // compute pattern A/B based on lastDraw and selected player/partner
  function computePatternForSelection(){
    currentPattern = null;
    if (!lastDraw || selectedPlayerIndex === null) return;
    const partner = getPartnerIndex(selectedPlayerIndex);
    const plusA = lastDraw.plusSupportIndex;
    const plusB = lastDraw.plusDpsIndex;
    // if either the player or partner has the plus index -> pattern A
    if (selectedPlayerIndex === plusA || selectedPlayerIndex === plusB || partner === plusA || partner === plusB){
      currentPattern = 'A';
    } else {
      currentPattern = 'B';
    }
  // console.log('PATTERN', currentPattern);
  }

  // helper: get partner index for a given player index
  function getPartnerIndex(idx){
    // pairs: MT(1)-H1(0), OT(5)-H2(4), M1(2)-R1(3), M2(6)-R2(7)
    const map = {0:1,1:0,4:5,5:4,2:3,3:2,6:7,7:6};
    return map[idx];
  }

  // create a symbol element (cone/circle/plus) using SYMBOL_CONFIG and shared styles
  function createSymbolElement(type){
    const el = document.createElement('div');
    el.classList.add('symbol', type);
    // default placement consistent with title symbols
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '0';
    // apply config
    if (typeof SYMBOL_CONFIG !== 'undefined' && SYMBOL_CONFIG[type]){
      const cfg = SYMBOL_CONFIG[type];
      const offset = (typeof cfg.offset === 'number') ? cfg.offset : 8;
      if (type === 'cone'){
        const w = cfg.width || 20;
        const h = cfg.height || 18;
        el.style.width = '0';
        el.style.height = '0';
        el.style.borderLeft = (w/2) + 'px solid transparent';
        el.style.borderRight = (w/2) + 'px solid transparent';
        el.style.borderBottom = h + 'px solid #ffffff';
        el.style.transform = `translate(-50%, calc(-100% - ${offset}px))`;
      } else if (type === 'circle' || type === 'plus'){
        const size = (cfg.size || 20) + 'px';
        el.style.width = size;
        el.style.height = size;
        el.style.transform = `translate(-50%, calc(-100% - ${offset}px))`;
        if (type === 'circle'){
          el.style.borderRadius = '50%';
          el.style.background = '#ffffff';
        } else {
          el.textContent = '+';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontWeight = 'bold';
          el.style.fontSize = Math.max(12, (cfg.size ? cfg.size/1.2 : 16)) + 'px';
        }
      }
    }
    return el;
  }

  // show message overlay and optional callback after delay
  function showMessage(text, duration=(typeof ERROR_DISPLAY_MS !== 'undefined' ? ERROR_DISPLAY_MS : 3000)){
    const overlay = document.getElementById('messageOverlay');
    const box = document.getElementById('messageBox');
    box.textContent = text;
    overlay.style.display = 'flex';
    setTimeout(()=>{
      overlay.style.display = 'none';
    }, duration);
  }
  // render the partner pairs in the arena; only show the selected pair if one is chosen
  function renderPairList(){
    const listEl = document.getElementById('pairList');
    if (!listEl) return;
    listEl.innerHTML = '';
    const pairs = [ [1,0], [5,4], [2,3], [6,7] ]; // each pair as [idxA, idxB]
    pairs.forEach(pair=>{
      const [a,b] = pair;
      const roleA = ROLE_ORDER[a];
      const roleB = ROLE_ORDER[b];
      // if a player is selected, only show that pair
      if (selectedPlayerIndex !== null && selectedPlayerIndex !== a && selectedPlayerIndex !== b) return;

      const item = document.createElement('div');
      item.className = 'pairItem';
      const boxA = document.createElement('div');
      boxA.className = 'playerBox'+((selectedPlayerIndex===a)?' active':'');
      boxA.textContent = roleA;
      boxA.dataset.idx = a;
      const boxB = document.createElement('div');
      boxB.className = 'playerBox'+((selectedPlayerIndex===b)?' active':'');
      boxB.textContent = roleB;
      boxB.dataset.idx = b;
      item.appendChild(boxA);
      item.appendChild(boxB);
      listEl.appendChild(item);
    });
  }

  // clear any pair symbols displayed above pair boxes
  function clearPairSymbols(){
    document.querySelectorAll('.pairSymbol').forEach(el=>el.remove());
    pairSymbolsState = null;
  }

  // draw symbols above the player boxes for the selected player and partner
  // mode is 'odd' or 'even' (or 'paire')
  function drawPairSymbols(mode){
    // ensure pair boxes exist and are up-to-date
      // capture previous state for logging, ensure pair boxes exist and are up-to-date
      const prevPairState = pairSymbolsState ? JSON.parse(JSON.stringify(pairSymbolsState)) : null;
      renderPairList();
      clearPairSymbols();
  // pair symbol generation - minimal logging handled below
    if (selectedPlayerIndex === null) return;
    const partner = getPartnerIndex(selectedPlayerIndex);
    const indices = [selectedPlayerIndex, partner];

  // decide symbols according to rules
    let symA, symB;
    if (mode === 'odd'){
      // independently cone or circle
      const choices = ['cone','circle'];
      symA = choices[Math.floor(Math.random()*choices.length)];
      symB = choices[Math.floor(Math.random()*choices.length)];
    } else if (mode === 'even' || mode === 'paire'){
      // choose from circle, cone, plus but cannot have both circle or both cone
      const choices = ['circle','cone','plus'];
      symA = choices[Math.floor(Math.random()*choices.length)];
      // choose symB ensuring not both circle or both cone
      do {
        symB = choices[Math.floor(Math.random()*choices.length)];
      } while((symA === 'circle' && symB === 'circle') || (symA === 'cone' && symB === 'cone'));
    } else {
      // default: same as odd
      const choices = ['cone','circle'];
      symA = choices[Math.floor(Math.random()*choices.length)];
      symB = choices[Math.floor(Math.random()*choices.length)];
    }

  // log the new symbols in French using the requested format
  // Note: we log after persisting pairSymbolsState so click handler can read it

    // apply to boxes
      indices.forEach((idx, i)=>{ 
      const box = document.querySelector(`.playerBox[data-idx='${idx}']`);
      if (!box) return;
      const type = (i===0)? symA : symB;
      // create a symbol element that reuses the title 'symbol' styles for consistency
      const el = document.createElement('div');
      // keep pairSymbol for positioning if needed, and symbol for shared styles
      el.classList.add('pairSymbol','symbol', type);
      // ensure visibility and absolute positioning above the box
      el.style.position = 'absolute';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      // style according to SYMBOL_CONFIG (reuse same sizing/offset logic as pre-sequence)
      if (typeof SYMBOL_CONFIG !== 'undefined' && SYMBOL_CONFIG[type]){
        const cfg = SYMBOL_CONFIG[type];
        const offset = (typeof cfg.offset === 'number') ? cfg.offset : 8;
        // common placement matching pre-sequence: top 0, left 50%, translate upward by offset
        el.style.top = '0';
        el.style.left = '50%';
        if (type === 'cone'){
          const w = cfg.width || 20;
          const h = cfg.height || 18;
          el.style.width = '0';
          el.style.height = '0';
          el.style.borderLeft = (w/2) + 'px solid transparent';
          el.style.borderRight = (w/2) + 'px solid transparent';
          el.style.borderBottom = h + 'px solid #ffffff';
          el.style.transform = `translate(-50%, calc(-100% - ${offset}px))`;
        } else {
          const size = (cfg.size || 20) + 'px';
          el.style.width = size;
          el.style.height = size;
          el.style.transform = `translate(-50%, calc(-100% - ${offset}px))`;
          if (type === 'circle'){
            el.style.borderRadius = '50%';
            el.style.background = '#ffffff';
          } else if (type === 'plus'){
            el.textContent = '+';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontWeight = 'bold';
            // match title font-size for plus
            el.style.fontSize = Math.max(12, (cfg.size ? cfg.size/1.2 : 16)) + 'px';
          }
        }
      }
  box.appendChild(el);
    });
    // persist and log the drawn symbols using the requested simple format
    pairSymbolsState = { indices: indices.slice(), symbols: [symA, symB], mode };
    console.log('Symbole du joueur : ' + symA);
    console.log('Symbole du partenaire : ' + symB);
  }

  // decide whether to redraw pair symbols after a correct click
  // Rules: only redraw for certain labels depending on mode and if sequenceCounter not equal to 7 or 8
  function shouldRedrawAfter(label, mode, setNumber){
  // minimal: no debug logs
    if (!label) return false;
    if (setNumber === 7 || setNumber === 8) return false;
    const oddAllowed = ['LS1','LC1','RS1','RP1'];
    const evenAllowed = ['LC2','LP2','RC2','RP2'];
    if (mode === 'odd' || mode === 'impair') return oddAllowed.includes(label);
    if (mode === 'even' || mode === 'paire'){
      // draw ONLY when the solution is one of LC2/LP2/RC2/RP2 and set is not 7 or 8
      return evenAllowed.includes(label);
    }
    return false;
  }

  function renderPositions(mode){
    positionsContainer.innerHTML = '';
    const list = mode === 'odd' || mode === 'impair' ? POSITIONS.odd
               : mode === 'even' || mode === 'paire' ? POSITIONS.even
               : mode === 'bait' ? POSITIONS.bait
               : POSITIONS[mode] || [];

    // compute anchor centers in page coordinates
    const arenaRect = document.querySelector('.arena').getBoundingClientRect();
    const leftRect = leftCircle.getBoundingClientRect();
    const rightRect = rightCircle.getBoundingClientRect();
    const leftCenter = { x: leftRect.left + leftRect.width/2, y: leftRect.top + leftRect.height/2 };
    const rightCenter = { x: rightRect.left + rightRect.width/2, y: rightRect.top + rightRect.height/2 };
    const mid = { x: (leftCenter.x + rightCenter.x)/2, y: (leftCenter.y + rightCenter.y)/2 };

    const size = (typeof POSITION_CONFIG !== 'undefined' && POSITION_CONFIG.size) ? POSITION_CONFIG.size : 20;
    const color = (typeof POSITION_CONFIG !== 'undefined' && POSITION_CONFIG.color) ? POSITION_CONFIG.color : '#ffffff';

    list.forEach((p, idx)=>{
      let pageX = mid.x, pageY = mid.y;
      if (p.anchor === 'left') {
        pageX = leftCenter.x + (p.dx || 0);
        pageY = leftCenter.y + (p.dy || 0);
      } else if (p.anchor === 'right') {
        pageX = rightCenter.x + (p.dx || 0);
        pageY = rightCenter.y + (p.dy || 0);
      } else if (p.anchor === 'between') {
        pageX = mid.x + (p.dx || 0);
        pageY = mid.y + (p.dy || 0);
      } else {
        pageX = (arenaRect.left + (p.xPercent||50)/100 * arenaRect.width) + (p.dx||0);
        pageY = (arenaRect.top  + (p.yPercent||50)/100 * arenaRect.height) + (p.dy||0);
      }

      const el = document.createElement('div');
      el.className = 'position';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = (pageX - arenaRect.left) + 'px';
      el.style.top  = (pageY - arenaRect.top) + 'px';
      el.style.background = color;
      el.style.border = '1px solid rgba(0,0,0,0.6)';
      el.title = p.label || ('pos'+(idx+1));
      el.dataset.posIndex = idx;

      // clickable behavior: validate selection
      el.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        // small visual flash
        el.style.boxShadow = '0 0 0 4px rgba(255,215,0,0.95)';
        setTimeout(()=> el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.6)', 300);

        if (!cinematicRunning) return;

        // validation logic using RESOLUTION_RULES and lastDraw
        let correct = false;
        const mode = phaseLabel.dataset.mode;
        // helper to get symbol for an index
        function getSymbolForIndex(idx){
          if (!lastDraw) return null;
          if (idx === lastDraw.plusSupportIndex || idx === lastDraw.plusDpsIndex) return 'plus';
          const role = ROLE_ORDER[idx];
          const supports = ['H1','MT','H2','OT'];
          if (supports.includes(role)) return lastDraw.supportsSymbol; // 'cone' or 'circle'
          return lastDraw.dpsSymbol;
        }

        // function to compute expected position label for odd screens (uses odd1 rules)
        function expectedLabelForOdd(){
          if (typeof RESOLUTION_RULES === 'undefined') return null;
          if (!currentPattern) return null;
          const setNum = sequenceCounter || 0;
          let key = null;
          if (setNum === 1) key = 'odd1';
          else if (setNum === 3) key = 'odd3';
          else if (setNum === 5) key = 'odd5';
          else if (setNum === 7) key = 'odd5';
          else key = 'odd1'; // fallback to odd1

          const container = RESOLUTION_RULES[key];
          if (!container) return null;
          const rules = container[currentPattern];
          if (!rules) return null;

          const playerIdx = selectedPlayerIndex;
          if (playerIdx === null || playerIdx === undefined) return null;
          const partnerIdx = getPartnerIndex(playerIdx);
          const playerRole = ROLE_ORDER[playerIdx];

          // prefer pairSymbolsState if present and matching the selected pair; fall back to lastDraw
          function lastSymbol(idx){
            if (!lastDraw) return null;
            if (idx === lastDraw.plusSupportIndex || idx === lastDraw.plusDpsIndex) return 'plus';
            const supports = ['H1','MT','H2','OT'];
            const role = ROLE_ORDER[idx];
            if (supports.includes(role)) return lastDraw.supportsSymbol;
            return lastDraw.dpsSymbol;
          }
          let playerSym = null, partnerSym = null;
          if (pairSymbolsState && Array.isArray(pairSymbolsState.indices) && pairSymbolsState.indices.length===2){
            const [aIdx,bIdx] = pairSymbolsState.indices;
            if ((aIdx === playerIdx && bIdx === partnerIdx) || (aIdx === partnerIdx && bIdx === playerIdx)){
              if (pairSymbolsState.indices[0] === playerIdx) playerSym = pairSymbolsState.symbols[0]; else playerSym = pairSymbolsState.symbols[1];
              if (pairSymbolsState.indices[0] === partnerIdx) partnerSym = pairSymbolsState.symbols[0]; else partnerSym = pairSymbolsState.symbols[1];
            }
          }
          if (!playerSym || !partnerSym){
            playerSym = lastSymbol(playerIdx);
            partnerSym = lastSymbol(partnerIdx);
          }

          // verbose rule testing log
          for (const r of rules){
            let ok = true;
            const reasons = [];
            if (r.role && r.role !== 'any' && r.role !== playerRole) { ok = false; reasons.push('role mismatch'); }
            if (r.playerHas && r.playerHas !== playerSym) { ok = false; reasons.push('playerHas mismatch'); }
            if (r.partnerHas && r.partnerHas !== partnerSym) { ok = false; reasons.push('partnerHas mismatch'); }
            if (typeof r.sameAsPartner !== 'undefined'){
              if (r.sameAsPartner && playerSym !== partnerSym) { ok = false; reasons.push('sameAsPartner failed'); }
              if (!r.sameAsPartner && playerSym === partnerSym) { ok = false; reasons.push('sameAsPartner failed'); }
            }
            if (!ok) continue;
            return r.pos;
          }
          return null;
        }

        let expected = null;
        if (mode === 'odd'){
          expected = expectedLabelForOdd();
        } else if (mode === 'even' || mode === 'paire'){
          expected = expectedLabelForEven();
        } else if (mode === 'bait'){
          // do NOT show the FUTUR/PAST overlay on bait; keep futurPastState persisted for logic only
          expected = expectedLabelForBait();
        }

        if (expected) {
          correct = (p.label === expected);
        } else {
          correct = false;
        }

        if (!correct){
          // determine duration from config (fallback to 2000)
          const errDur = (typeof ERROR_DISPLAY_MS !== 'undefined') ? ERROR_DISPLAY_MS : 2000;
          // show NOPE for configured duration and reset
          showMessage('NOPE', errDur);
          // reset state after delay and go back to title
          setTimeout(()=>{
            // clear persistent draw and selection
            lastDraw = null;
            selectedPlayerIndex = null;
            currentPattern = null;
            sequenceCounter = null;
            document.querySelectorAll('.partyMember').forEach(m=>m.classList.remove('selected'));
            cinematicRunning = false;
            currentSeqIndex = -1;
            //showScreen('titleScreen');
          }, errDur);
        } else {
          // correct: visually mark the clicked box green
          el.classList.add('correct');
          // decide immediately whether to redraw pair symbols and draw them now
          const shouldRedrawNow = shouldRedrawAfter(p.label, mode, sequenceCounter);
          if (shouldRedrawNow){
            // only clear existing symbols if we're about to redraw
            clearPairSymbols();
            drawPairSymbols(mode === 'odd' ? 'odd' : (mode === 'even' ? 'even' : 'paire'));
          }
          // wait the configured duration so the player sees the highlight and pair symbols, then advance
          const wait = (typeof CORRECT_WAIT_MS !== 'undefined') ? CORRECT_WAIT_MS : 1500;
          setTimeout(()=>{
            el.classList.remove('correct');
            advanceSequence();
          }, wait);
        }

        // log the single-line result requested by the user
        console.log('Position cliqué  : ' + (p.label || '') + ' ; Position attendu : ' + (expected || '') + ' ;');
      });

      positionsContainer.appendChild(el);
    });
  }

  // start cinematic: show first state and wait for clicks on positions to advance
  function startCinematic(){
    cinematicRunning = true;
    currentSeqIndex = 0;
    // initialize sequence counter at 1 after title
    sequenceCounter = 1;
    console.log('SET ' + sequenceCounter);
    showScreen('arenaScreen');
    const firstKey = sequence[currentSeqIndex];
    screens[firstKey === 'impair' ? 'impair' : firstKey === 'paire' ? 'paire' : 'bait']();
    
  }

  function advanceSequence(){
    // move to next index and show it; if past end, stop cinematic
    currentSeqIndex++;
    if (currentSeqIndex >= sequence.length) {
      cinematicRunning = false;
      // leave last visible (stay on last state)
      return;
    }
    const key = sequence[currentSeqIndex];
    if (key === 'impair') {
      screens.impair();
      // increment sequence counter and log
  sequenceCounter = (sequenceCounter || 0) + 1;
  console.log('SET ' + sequenceCounter);
    }
    else if (key === 'paire') {
      screens.paire();
  sequenceCounter = (sequenceCounter || 0) + 1;
  console.log('SET ' + sequenceCounter);
    }
    else if (key === 'bait') screens.bait();
  }

  // keep initial mode empty
  phaseLabel.dataset.mode = '';
})();