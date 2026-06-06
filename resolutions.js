/*
 Resolution rules for screens. This file describes which position label is the correct
 resolution depending on pattern (A/B), player's symbol and partner's symbol, and role.

 Format chosen for clarity and easy editing by hand:
 RESOLUTION_RULES = {
   odd1: {
     A: [ { role:'any', playerHas:'plus', partnerHas:'cone', pos:'LS1' }, ... ],
     B: [ { role:'MT', pos:'FT1' }, ... ]
   }
 }

 You can edit these rules to change behavior without touching main code.
*/

const RESOLUTION_RULES = {
  // first "impair" screen specific rules
  odd1: {
    A: [
      { role: 'any', playerHas: 'plus',   partnerHas: 'cone',   pos: 'LS1' },
      { role: 'any', playerHas: 'cone',   partnerHas: 'plus',   pos: 'LC1' },
      { role: 'any', playerHas: 'plus',   partnerHas: 'circle', pos: 'RS1' },
      { role: 'any', playerHas: 'circle', partnerHas: 'plus',   pos: 'RP1' }
    ],
    B: [
      { role: 'MT', pos: 'FT1' },
      { role: 'OT', pos: 'FT1' },
      { role: 'H1', pos: 'FH1' },
      { role: 'H2', pos: 'FH1' },
      { role: 'M1', pos: 'FD1' },
      { role: 'M2', pos: 'FD1' },
      { role: 'R1', pos: 'FD1' },
      { role: 'R2', pos: 'FD1' }
    ]
  }
  ,

  
  // odd screen rules for set 3
  odd3: {
    A: [
      // simple symbol -> position
      { role: 'any', playerHas: 'cone', pos: 'LC1' },
      { role: 'any', playerHas: 'circle', pos: 'RP1' },

      // plus + healer mapping (assumption: H1 -> LS1, H2 -> RS1)
      { role: 'H1', playerHas: 'plus', pos: 'LS1' },
      { role: 'H2', playerHas: 'plus', pos: 'RS1' },

      // plus + MT/OT with same/different partner symbol
      { role: 'MT', playerHas: 'plus', sameAsPartner: false, pos: 'LS1' },
      { role: 'OT', playerHas: 'plus', sameAsPartner: false, pos: 'LS1' },
      { role: 'MT', playerHas: 'plus', sameAsPartner: true, pos: 'RS1' },
      { role: 'OT', playerHas: 'plus', sameAsPartner: true, pos: 'RS1' },

      // plus + M1/M2 with same/different partner symbol (note: reversed mapping)
      { role: 'M1', playerHas: 'plus', sameAsPartner: false, pos: 'RS1' },
      { role: 'M2', playerHas: 'plus', sameAsPartner: false, pos: 'RS1' },
      { role: 'M1', playerHas: 'plus', sameAsPartner: true, pos: 'LS1' },
      { role: 'M2', playerHas: 'plus', sameAsPartner: true, pos: 'LS1' }
    ],
    B: [
      // role -> positions for pattern B
      { role: 'MT', pos: 'FT1' },
      { role: 'OT', pos: 'FT1' },
      { role: 'H1', pos: 'FH1' },
      { role: 'H2', pos: 'FH1' },
      { role: 'M1', pos: 'FD1' },
      { role: 'M2', pos: 'FD1' },
      { role: 'R1', pos: 'FD1' },
      { role: 'R2', pos: 'FD1' }
    ]
  },

  // odd screen rules for sets 5 and 7 (same rules)
  odd5: {
    A: [
      // role -> positions for pattern A (FT/FH/FM/FR)
      { role: 'MT', pos: 'FT1' },
      { role: 'OT', pos: 'FT1' },
      { role: 'H1', pos: 'FH1' },
      { role: 'H2', pos: 'FH1' },
      { role: 'M1', pos: 'FD1' },
      { role: 'M2', pos: 'FD1' },
      { role: 'R1', pos: 'FD1' },
      { role: 'R2', pos: 'FD1' }
    ],
    B: [
      // symbol based rules for pattern B (mirror of odd3 A)
      { role: 'any', playerHas: 'cone', pos: 'LC1' },
      { role: 'any', playerHas: 'circle', pos: 'RP1' },

      // plus + healer mapping (assumption: H1 -> LS1, H2 -> RS1)
      { role: 'H1', playerHas: 'plus', pos: 'LS1' },
      { role: 'H2', playerHas: 'plus', pos: 'LS1' },

      // plus + MT/OT with same/different partner symbol
      { role: 'MT', playerHas: 'plus', sameAsPartner: false, pos: 'LS1' },
      { role: 'OT', playerHas: 'plus', sameAsPartner: false, pos: 'LS1' },
      { role: 'MT', playerHas: 'plus', sameAsPartner: true, pos: 'RS1' },
      { role: 'OT', playerHas: 'plus', sameAsPartner: true, pos: 'RS1' },

      // plus + M1/M2 with same/different partner symbol
      { role: 'M1', playerHas: 'plus', sameAsPartner: false, pos: 'RS1' },
      { role: 'M2', playerHas: 'plus', sameAsPartner: false, pos: 'RS1' },
      { role: 'M1', playerHas: 'plus', sameAsPartner: true, pos: 'LS1' },
      { role: 'M2', playerHas: 'plus', sameAsPartner: true, pos: 'LS1' }
    ]
  },

  // even-screen rules for sets 2 and 8
  even2_8: {
    A: [
      // simple role + symbol rules
      { role: 'H1', playerHas: 'cone', pos: 'LC2' },
      { role: 'H2', playerHas: 'cone', pos: 'LC2' },
      { role: 'H1', playerHas: 'circle', pos: 'LP2' },
      { role: 'H2', playerHas: 'circle', pos: 'LP2' },

      { role: 'R1', playerHas: 'cone', pos: 'RC2' },
      { role: 'R2', playerHas: 'cone', pos: 'RC2' },
      { role: 'R1', playerHas: 'circle', pos: 'RP2' },
      { role: 'R2', playerHas: 'circle', pos: 'RP2' },

      // MT / OT with same/different partner symbol
      { role: 'MT', sameAsPartner: false, playerHas: 'cone', pos: 'LC2' },
      { role: 'OT', sameAsPartner: false, playerHas: 'cone', pos: 'LC2' },
      { role: 'MT', sameAsPartner: false, playerHas: 'circle', pos: 'LP2' },
      { role: 'OT', sameAsPartner: false, playerHas: 'circle', pos: 'LP2' },

      { role: 'MT', sameAsPartner: true, playerHas: 'cone', pos: 'RC2' },
      { role: 'OT', sameAsPartner: true, playerHas: 'cone', pos: 'RC2' },
      { role: 'MT', sameAsPartner: true, playerHas: 'circle', pos: 'RP2' },
      { role: 'OT', sameAsPartner: true, playerHas: 'circle', pos: 'RP2' },

      // M1 / M2 with same/different partner symbol
      { role: 'M1', sameAsPartner: false, playerHas: 'cone', pos: 'RC2' },
      { role: 'M2', sameAsPartner: false, playerHas: 'cone', pos: 'RC2' },
      { role: 'M1', sameAsPartner: false, playerHas: 'circle', pos: 'RP2' },
      { role: 'M2', sameAsPartner: false, playerHas: 'circle', pos: 'RP2' },

      { role: 'M1', sameAsPartner: true, playerHas: 'cone', pos: 'LC2' },
      { role: 'M2', sameAsPartner: true, playerHas: 'cone', pos: 'LC2' },
      { role: 'M1', sameAsPartner: true, playerHas: 'circle', pos: 'LP2' },
      { role: 'M2', sameAsPartner: true, playerHas: 'circle', pos: 'LP2' }
    ],
    B: [
      // straightforward role mapping for pattern B
      { role: 'MT', pos: 'FT2' },
      { role: 'OT', pos: 'FT2' },
      { role: 'H1', pos: 'FH2' },
      { role: 'H2', pos: 'FH2' },
      { role: 'M1', pos: 'FM2' },
      { role: 'M2', pos: 'FM2' },
      { role: 'R1', pos: 'FR2' },
      { role: 'R2', pos: 'FR2' }
    ]
  },

  // even-screen rules for sets 4 and 6
  even4_6: {
    A: [
      // straightforward role mapping for pattern A
      { role: 'MT', pos: 'FT2' },
      { role: 'OT', pos: 'FT2' },
      { role: 'H1', pos: 'FH2' },
      { role: 'H2', pos: 'FH2' },
      { role: 'M1', pos: 'FM2' },
      { role: 'M2', pos: 'FM2' },
      { role: 'R1', pos: 'FR2' },
      { role: 'R2', pos: 'FR2' }
    ],
    B: [
      // simple role+symbol rules
      { role: 'H1', playerHas: 'cone', pos: 'LC2' },
      { role: 'H2', playerHas: 'cone', pos: 'LC2' },
      { role: 'H1', playerHas: 'circle', pos: 'LP2' },
      { role: 'H2', playerHas: 'circle', pos: 'LP2' },

      { role: 'R1', playerHas: 'cone', pos: 'RC2' },
      { role: 'R2', playerHas: 'cone', pos: 'RC2' },
      { role: 'R1', playerHas: 'circle', pos: 'RP2' },
      { role: 'R2', playerHas: 'circle', pos: 'RP2' },

      // MT / OT with same/different partner symbol
      { role: 'MT', sameAsPartner: false, playerHas: 'cone', pos: 'LC2' },
      { role: 'OT', sameAsPartner: false, playerHas: 'cone', pos: 'LC2' },
      { role: 'MT', sameAsPartner: false, playerHas: 'circle', pos: 'LP2' },
      { role: 'OT', sameAsPartner: false, playerHas: 'circle', pos: 'LP2' },

      { role: 'MT', sameAsPartner: true, playerHas: 'cone', pos: 'RC2' },
      { role: 'OT', sameAsPartner: true, playerHas: 'cone', pos: 'RC2' },
      { role: 'MT', sameAsPartner: true, playerHas: 'circle', pos: 'RP2' },
      { role: 'OT', sameAsPartner: true, playerHas: 'circle', pos: 'RP2' },

      // M1 / M2 with same/different partner symbol
      { role: 'M1', sameAsPartner: false, playerHas: 'cone', pos: 'RC2' },
      { role: 'M2', sameAsPartner: false, playerHas: 'cone', pos: 'RC2' },
      { role: 'M1', sameAsPartner: false, playerHas: 'circle', pos: 'RP2' },
      { role: 'M2', sameAsPartner: false, playerHas: 'circle', pos: 'RP2' },

      { role: 'M1', sameAsPartner: true, playerHas: 'cone', pos: 'LC2' },
      { role: 'M2', sameAsPartner: true, playerHas: 'cone', pos: 'LC2' },
      { role: 'M1', sameAsPartner: true, playerHas: 'circle', pos: 'LP2' },
      { role: 'M2', sameAsPartner: true, playerHas: 'circle', pos: 'LP2' }
    ]
  }
};
