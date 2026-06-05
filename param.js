/*
 Positions and UI configuration are intentionally simple and easy to edit.
 - POSITION_CONFIG: change size (px) and color for the position circles.
 - CIRCLE_CONFIG: change circle size (px) and gap (CSS length string like "5cm" or "80px").
 - POSITIONS: lists for odd / even / bait states; dx/dy are pixel offsets relative to anchor centers.
*/
const POSITION_CONFIG = {
  size: 28,          // diameter in pixels (changeable)
  color: '#ffffff'   // fill color for positions
};

// Nouvelle configuration pour cercles (modifiable ici)
const CIRCLE_CONFIG = {
  circleSize: 200,   // taille du cercle en px (correspond à --circle-size)
  gap: '7cm'         // espace entre cercles (CSS length, ex: '5cm', '80px', '10vw')
};

// Timers (en millisecondes) - modifiables
const PRE_SEQUENCE_DURATION_MS = 1500; // durée d'affichage des symboles avant la cinématique
const ERROR_DISPLAY_MS = 1500; // durée d'affichage du message d'erreur
const CORRECT_WAIT_MS = 2000; // durée d'attente après bonne réponse (ms)

// Configuration des symboles affichés au-dessus des joueurs
// offset : nombre de pixels ajouté dans le calc(-100% - offset) pour positionner verticalement
// pour le cone on définit width/height (triangle) ; pour circle/plus on définit size (diamètre)
const SYMBOL_CONFIG = {
  circle: { size: 22, offset: 30 },
  cone:   { width: 40, height: 38, offset: 8 },
  plus:   { size: 60, offset: 2 }
};

// FUTUR / PAST display config shown during even sets (center-screen)
const FUTUR_PAST_CONFIG = {
  fontSize: '56px',   // CSS font-size (changeable)
  color: '#ffd54f',   // text color
  fontFamily: 'Arial, sans-serif',
  weight: '700',      // font-weight
  // optional: control line-height (affects text height) and vertical offset
  // - lineHeight: CSS line-height value (e.g. '1', '56px')
  // - offsetY: vertical offset applied to the overlay transform (e.g. '0px', '20px', '-10px')
  lineHeight: '1',
  offsetY: '150px'
};

/*
 Adjusted dx/dy to fit wider gap between circles (~5cm).
 Tweak values here to fine-tune placement.
*/
const POSITIONS = {
  // Ecran impair (7 positions)
  odd: [
    // 1. juste au-dessus du cercle gauche (près du bord supérieur)
    { anchor: "left",  dx: 0,   dy: -140, label: "FT1" },
    // 2. en haut du cercle de gauche (plus haut que le bord)
    { anchor: "left",  dx: 0,   dy: -80, label: "LC1" },
    // 3. bas interne gauche (environ à moitié entre le bord et le centre)
    { anchor: "left",  dx: 0,   dy: 50,   label: "LS1" },
    // 4. juste en dessous du cercle de gauche
    { anchor: "left",  dx: 0,   dy: 120,  label: "FH1" },
    // 5. entre les deux cercles, mais plus proche du droit
    { anchor: "between", dx: 15, dy: 0,    label: "FD1" },
    // 6. dans le cercle de droite mais sur la gauche du cercle
    { anchor: "right", dx: -75, dy: 0,    label: "RS1" },
    // 7. dans le cercle de droite mais sur la droite du cercle
    { anchor: "right", dx: 75,  dy: 0,    label: "RP1" }
  ],

  // Ecran paire (8 positions)
  even: [
    // 1. nord du centre des deux cercles, assez loin, un peu à gauche
    { anchor: "between", dx: -80, dy: -300, label: "FT2" },
    // 2. nord du centre des deux cercles, assez loin, un peu à droite
    { anchor: "between", dx:  80, dy: -300, label: "FM2" },
    // 3. nord-ouest du cercle de gauche
    { anchor: "left",    dx: -75, dy: -105, label: "FH2" },
    // 4. en haut du cercle de gauche
    { anchor: "left",    dx: 40,   dy: -80, label: "LC2" },
    // 5. en bas du cercle de gauche
    { anchor: "left",    dx: 0,   dy: 90,  label: "LP2" },
    // 6. nord-est du cercle de droite
    { anchor: "right",   dx: 75,  dy: -105, label: "FR2" },
    // 7. en haut du cercle de droite
    { anchor: "right",   dx: -40,   dy: -80, label: "RC2" },
    // 8. en bas du cercle de droite
    { anchor: "right",   dx: 0,   dy: 90,  label: "RP2" }
  ],

  // Ecran bait (2 positions)
  bait: [
    // 1. au nord au-dessus des deux cercles assez loin
    { anchor: "between", dx: 0,  dy: -350, label: "BF" },
    // 2. entre les deux cercles (centre)
    { anchor: "between", dx: 0,  dy: 0,    label: "BP" }
  ]
};
