import {
  Colonist,
  JournalNote,
  LawId,
  NarrativeEvent,
  NewspaperIssue,
  ToolId,
} from './types';

export type Language = 'en' | 'cs';

export function detectInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'cs' || param === 'en') return param;
    const saved = window.localStorage.getItem('hollow_creek_lang');
    if (saved === 'cs' || saved === 'en') return saved;
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('cs')) {
      return 'cs';
    }
  }
  return 'en';
}

export const CHAPTER_NAMES_I18N: Record<Language, Record<number, string>> = {
  en: {
    1: 'Chapter 1 · The Hatch',
    2: 'Chapter 2 · Roots',
    3: 'Chapter 3 · Strangers',
    4: 'Chapter 4 · The Deep',
    5: 'Chapter 5 · Rules & Law',
    6: 'Chapter 6 · The Breach',
    7: 'Chapter 7 · Two Cities',
    8: 'Chapter 8 · The City Below',
  },
  cs: {
    1: 'Kapitola 1 · Příklop',
    2: 'Kapitola 2 · Kořeny',
    3: 'Kapitola 3 · Cizinci',
    4: 'Kapitola 4 · Hlubina',
    5: 'Kapitola 5 · Pravidla a zákon',
    6: 'Kapitola 6 · Průlom',
    7: 'Kapitola 7 · Dvě města',
    8: 'Kapitola 8 · Podzemní velkoměsto',
  },
};

export const TOOLS_I18N: Record<
  Language,
  Record<ToolId, { name: string; shortName: string; roleClue: string }>
> = {
  en: {
    inspect: { name: 'Inspect', shortName: 'Inspect', roleClue: 'Check strata & acoustic hints' },
    dig: { name: 'Excavate', shortName: 'Dig', roleClue: 'Dig earth · Listen for hazards' },
    ladder: { name: 'Ladder', shortName: 'Ladder', roleClue: 'Vertical shaft access' },
    support: { name: 'Timber Prop', shortName: 'Prop', roleClue: 'Prevents ceiling cave-ins' },
    bunk: { name: 'Bunks', shortName: 'Bunks', roleClue: 'Housing (+12 pop cap · Rest)' },
    mushroom: { name: 'Mushroom Farm', shortName: 'Farm', roleClue: 'Grows steady underground food' },
    well: { name: 'Well / Pump', shortName: 'Well', roleClue: 'Extracts clean water from clay/river' },
    pedal: { name: 'Pedal Dynamo', shortName: 'Pedal', roleClue: 'Manual bike power (+12W)' },
    turbine: { name: 'Hydro Turbine', shortName: 'Turbine', roleClue: 'River power (+45W · Place on water)' },
    clinic: { name: 'Clinic', shortName: 'Clinic', roleClue: 'Treats wounds & silicosis' },
    door: { name: 'Steel Bulkhead', shortName: 'Door', roleClue: 'Seals floods & Metro Walkers' },
    hall: { name: 'Council Hall', shortName: 'Hall', roleClue: 'Boosts Spirit & holds trials' },
  },
  cs: {
    inspect: { name: 'Průzkum', shortName: 'Info', roleClue: 'Zkontroluj horninu a poslech' },
    dig: { name: 'Vykopat', shortName: 'Kopat', roleClue: 'Hlub šachty · Poslouchej stěny' },
    ladder: { name: 'Žebřík', shortName: 'Žebřík', roleClue: 'Vertikální šachta mezi patry' },
    support: { name: 'Výdřeva', shortName: 'Trám', roleClue: 'Zabraňuje závalu stropu' },
    bunk: { name: 'Ubikace', shortName: 'Lůžka', roleClue: 'Bydlení (+12 kapacity · Odpočinek)' },
    mushroom: { name: 'Houbová farma', shortName: 'Farma', roleClue: 'Pěstuje stálé podzemní jídlo' },
    well: { name: 'Studna / Pumpa', shortName: 'Studna', roleClue: 'Čerpá čistou podzemní vodu' },
    pedal: { name: 'Šlapací dynamo', shortName: 'Kola', roleClue: 'Lidský pohon (+12W)' },
    turbine: { name: 'Hydroturbína', shortName: 'Turbína', roleClue: 'Říční energie (+45W · K řece)' },
    clinic: { name: 'Ošetřovna', shortName: 'Klinika', roleClue: 'Léčí zranění a hornický kašel' },
    door: { name: 'Ocelové dveře', shortName: 'Vrata', roleClue: 'Zastaví záplavu a monstra' },
    hall: { name: 'Radní síň', shortName: 'Síň', roleClue: 'Zvedá morálku a hostí soudy' },
  },
};

export const LAW_DEFINITIONS_I18N: Record<
  Language,
  Record<LawId, { number: string; title: string; effect: string }>
> = {
  en: {
    quarantine_48h: {
      number: 'Rule #1',
      title: '48-Hour Quarantine',
      effect: 'New arrivals are screened before entering dorms. Prevents hidden bite outbreaks.',
    },
    two_key_hatch: {
      number: 'Rule #2',
      title: 'Two-Key Hatch Seal',
      effect: 'Dual guards lock the surface hatch every dusk. Stops night Walker infiltrations.',
    },
    ration_tickets: {
      number: 'Rule #3',
      title: 'Ration Ticket Ledger',
      effect: 'Cuts daily food consumption by 20%, but increases worker unrest if Spirit falls.',
    },
    curfew_22: {
      number: 'Rule #4',
      title: '22:00 Sector Curfew',
      effect: 'Tightens security control during dark hours. Reduces Spirit by 6% while active.',
    },
    constitution: {
      number: 'Charter',
      title: 'Underground Constitution',
      effect: 'Restores open Council voting and equal rations. Stabilizes Spirit across all strata.',
    },
    surface_charter: {
      number: 'Referendum',
      title: 'Surface Garden Charter',
      effect: 'Authorizes spring cultivation above ground once snow clears the infected.',
    },
  },
  cs: {
    quarantine_48h: {
      number: 'Pravidlo 1',
      title: '48hodinová karanténa',
      effect: 'Příchozí projdou prohlídkou před vstupem do ubikací. Zabrání skryté nákaze.',
    },
    two_key_hatch: {
      number: 'Pravidlo 2',
      title: 'Dva klíče u příklopu',
      effect: 'Dvojitá stráž jistí horní příklop za soumraku. Brání nočnímu vniknutí.',
    },
    ration_tickets: {
      number: 'Pravidlo 3',
      title: 'Přídělové lístky',
      effect: 'Snižuje denní spotřebu jídla o 20 %, ale zvyšuje napětí při nízké morálce.',
    },
    curfew_22: {
      number: 'Pravidlo 4',
      title: 'Zákaz vycházení po 22:00',
      effect: 'Zpřísňuje noční ostrahu pater. Snižuje morálku obyvatel.',
    },
    constitution: {
      number: 'Ústava',
      title: 'Podzemní ústava',
      effect: 'Obnovuje svobodnou volbu Rady pěti a rovné příděly. Stabilizuje morálku.',
    },
    surface_charter: {
      number: 'Referendum',
      title: 'Povrchová zahrada',
      effect: 'Schvaluje jarní setbu na povrchu po ústupu infikovaných.',
    },
  },
};

export const NARRATIVE_EVENTS_CS: Record<
  string,
  {
    chapterTitle: string;
    title: string;
    speaker: string;
    body: string;
    choices: Record<string, { label: string; description: string }>;
  }
> = {
  ch1_antibiotics: {
    chapterTitle: 'Kapitola 1 · Příklop',
    title: 'Horečka v krytu',
    speaker: 'Nora · Zdravotní sestra',
    body: 'Walt si při stavbě výdřevy poranil předloktí a rána se zanítila. Bez antibiotik z lékárny na povrchu přijdeme o našeho jediného zkušeného horníka.',
    choices: {
      send_eli: {
        label: 'Poslat Eliho do lékárny',
        description: 'Eli proklouzne kolem infikovaných pod kamerou. Přinese +15 léků a zásoby.',
      },
      treat_below: {
        label: 'Léčit převařenou vodou a klidem',
        description: 'Příklop zůstane zamčený. Spotřebuje 20 vody a oslabí Walta.',
      },
    },
  },
  ch2_blackout: {
    chapterTitle: 'Kapitola 2 · Kořeny',
    title: 'Došla nafta v generátoru',
    speaker: 'Ray · Elektrikář',
    body: 'Dieselový generátor právě zhasl. Bez proudu pohasnou lampy a houbové police vychladnou. Dokážu spojit alternátory z aut se dvěma koly.',
    choices: {
      build_pedal_protocol: {
        label: 'Zavést šlapací směny',
        description: 'Ray postaví další šlapací dynamo (+10 dřeva, +6 oceli, morálka drží).',
      },
      conserve_dark: {
        label: 'Šetřit světlem a šlapat méně',
        description: 'Částečná tma v chodbách šetří síly, ale morálka klesne (-8).',
      },
    },
  },
  ch3_strangers: {
    chapterTitle: 'Kapitola 3 · Cizinci',
    title: 'Čtrnáct hlasů u příklopu',
    speaker: 'Marcus · Bývalý policista',
    body: 'Tentokrát to není škrábání — někdo klepe železnou trubkou. Venku stojí čtrnáct lidí včetně tří dětí. Jídla je málo a kdokoli může skrývat kousnutí.',
    choices: {
      admit_quarantine: {
        label: 'Otevřít a zavést 48h karanténu',
        description: 'Zavede Pravidlo č. 1. +14 obyvatel, +6 munice, odhalí skrytou nákazu včas.',
      },
      admit_immediate: {
        label: 'Vpustit všechny rovnou dovnitř',
        description: '+14 obyvatel ihned, ale hrozí noční proměna nakaženého.',
      },
      turn_away: {
        label: 'Nechat příklop zamčený',
        description: 'Ušetříte zásoby a bezpečí, ale morálka prudce klesne (-18).',
      },
    },
  },
  ch5_trial: {
    chapterTitle: 'Kapitola 5 · Pravidla a zákon',
    title: 'Soud s Kofim Kimem',
    speaker: 'Rada pěti',
    body: 'Zásoby živí přes sto čtyřicet lidí. Kofi Kim byl přistižen při krádeži bedny přídělů. Radní síň čeká na váš rozsudek a přídělový řád.',
    choices: {
      verdict_work: {
        label: '30 dní práce na farmě a Přídělové lístky',
        description: 'Zavede Pravidlo č. 3 (-20 % spotřeby jídla). Spravedlivý řád, mírné napětí.',
      },
      verdict_pardon: {
        label: 'Omilostnit a rozdělit nouzové zásoby',
        description: 'Zvedne morálku (+10), spotřebuje 25 jídla.',
      },
      verdict_exile: {
        label: 'Vyhnanství na povrch',
        description: 'Tvrdé odstrašení sníží nepokoje, ale podlomí morálku (-12).',
      },
    },
  },
  ch5_hatch_breach: {
    chapterTitle: 'Kapitola 5 · Pravidla a zákon',
    title: 'Nedbalost na hlídce',
    speaker: 'Marcus · Velitel stráže',
    body: 'Noční strážný Rick nechal horní západku na půl žerdi. Walkeři vnikli do šachty před svítáním. Pět spících obyvatel zaplatilo životem.',
    choices: {
      two_key_exile: {
        label: 'Zavést dva klíče a vyhnat Ricka',
        description: 'Zavede Pravidlo č. 2. Zabrání dalším průnikům shora. +10 munice.',
      },
      imprison_rick: {
        label: 'Zavést dva klíče a uvěznit ho dole',
        description: 'Zavede Pravidlo č. 2. Zachová obyvatele, zvýší napětí.',
      },
    },
  },
  ch6_metro_breach: {
    chapterTitle: 'Kapitola 6 · Průlom',
    title: 'Prokopání do zavaleného metra',
    speaker: 'Eli · Průzkumník',
    body: 'Východní chodba prorazila do stanice metra plné hibernujících infikovaných! Valí se šachtou nahoru. Někdo musí podržet ocelové dveře zvenčí!',
    choices: {
      eli_sacrifice: {
        label: 'Zavřít vrata a zatopit spodní patro',
        description: 'Eli obětuje život u vrat, aby město přežilo. Vznikne Zeď padlých.',
      },
      stand_fight: {
        label: 'Postavit palebnou linii u šachty',
        description: 'Spotřebuje 25 munice a přinese těžké ztráty, ale Eli může přežít.',
      },
    },
  },
  ch7_strike: {
    chapterTitle: 'Kapitola 7 · Dvě města',
    title: 'Lily vypíná hydroelektrárnu',
    speaker: 'Lily · Hlavní inženýrka',
    body: 'Marcus rozpustil Radu a horníkům zkrátil příděly na polovinu. Dělníci stávkují a Rayova dcera Lily shodila hlavní jistič turbíny. Celé město je ve tmě.',
    choices: {
      sign_constitution: {
        label: 'Vrátit světlo a přijmout Ústavu',
        description: 'Přijme Podzemní ústavu. Ukončí tyranii, zvedne morálku (+26) a srovná příděly.',
      },
      martial_crackdown: {
        label: 'Podpořit Marcusovu bezpečnostní radu',
        description: 'Zavede zákaz vycházení po 22:00. Potlačí stávku za cenu munice (-15) a nepokojů.',
      },
    },
  },
  ch8_referendum: {
    chapterTitle: 'Kapitola 8 · Podzemní velkoměsto',
    title: 'Rok 30: Referendum o povrchu',
    speaker: 'Lily · Starostka Hollow Creeku',
    body: 'Město zasypal sníh. Periskop za celý měsíc zachytil jen tři walkery — zima a rozklad většinu z nich zničily. Přes 300 občanů hlasuje v Radní síni.',
    choices: {
      approve_surface_garden: {
        label: 'Založit jarní zahradu na povrchu',
        description: 'Schválí Povrchovou zahradu. Vystupte na denní světlo a završte 30 let přežití!',
      },
      keep_digging_deep: {
        label: 'Soustředit se na vrt v hloubce -128 m',
        description: 'Zůstat pod zemí a prozkoumat obří prázdnotu pod říčním podložím.',
      },
    },
  },
};

export function localizeEvent(ev: NarrativeEvent, lang: Language): NarrativeEvent {
  if (lang === 'en') return ev;
  const cs = NARRATIVE_EVENTS_CS[ev.id];
  if (!cs) return ev;
  return {
    ...ev,
    chapterTitle: cs.chapterTitle,
    title: cs.title,
    speaker: cs.speaker,
    body: cs.body,
    choices: ev.choices.map((c) => {
      const cc = cs.choices[c.id];
      return cc ? { ...c, label: cc.label, description: cc.description } : c;
    }),
  };
}

export function localizeJournalNote(note: JournalNote, lang: Language): JournalNote {
  if (lang === 'en') return note;
  const map: Record<string, string> = {
    'Above is death. Down we go. Remember: a timber prop every two tiles, no exceptions.':
      'Nahoře je smrt, jdeme dolů. Pamatujte: každé dva metry trám, bez výjimek.',
    'Found rich underground mycelium! Good spot to expand Mushroom Farms.':
      'Našel jsem bohaté podhoubí! Ideální místo pro houbovou farmu.',
    'We broke into the old coal mine I worked 50 years ago! Salvaged timber, rails, and coal.':
      'Prokopali jsme se do starého uhelného dolu, kde jsem před 50 lety fáral! Máme dřevo, kolejnice i uhlí.',
    'An underground river at -56m! Build a Hydro Turbine right along the water for permanent electricity.':
      'Podzemní řeka v hloubce -56 m! Postavte u vody hydroturbínu a získáme stálou elektřinu.',
    'At -128 meters our drill broke into an impossibly vast cavern. Warm air rises from below...':
      'V hloubce -128 m narazil vrták na obrovskou prázdnotu. Zdola stoupá teplý vzduch...',
    'Slipped past two Walkers by the pharmacy. Brought back 15 doses of antibiotics!':
      'Proklouzl jsem kolem dvou walkerů k lékárně. Přináším 15 dávek antibiotik!',
    'Walt fought off the fever with boiled water and rest. Close call.':
      'Walt horečku překonal díky převařené vodě a odpočinku. Bylo to o vlásek.',
    'Four hours on the bike pedals buys a full day of bunker light.':
      'Čtyři hodiny šlapání dají světlo na celý den.',
    'We screened all 14 strangers in quarantine. Caught one hidden bite in time. Rule #1 stands.':
      'Všech 14 příchozích prošlo karanténou. Jedno skryté kousnutí jsme odhalili včas. Pravidlo 1 platí.',
    'One of the newcomers hid a bite. Marc and Hugo died in the night. Never again without quarantine.':
      'Jeden z cizinců zatajil kousnutí. Marc a Hugo v noci zemřeli. Už nikdy bez karantény.',
    'We left them at the hatch. The silence afterwards was worse than the scratching.':
      'Nechali jsme je za příklopem. To ticho potom bylo horší než škrábání.',
    'Kofi Kim sentenced to 30 days farm labor. Ration Tickets enacted: no work, no second bowl.':
      'Kofi Kim odsouzen ke 30 dnům na farmě. Zavedeny přídělové lístky: bez práce není druhá miska.',
    'Rick left the latch on half-cock. Five died in their sleep. He was exiled at dawn. Rule #2: Two keys.':
      'Rick nechal západku na půl žerdi. Pět lidí zemřelo ve spánku. Za úsvitu byl vyhnán. Pravidlo 2: Dva klíče.',
    'Eli held the steel bulkhead from the outside while we flooded the metro shaft. We built the Memorial Wall in his name.':
      'Eli držel ocelové dveře zvenčí, zatímco jsme zatopili šachtu metra. Na jeho počest stojí Zeď padlých.',
    'We fought them at the shaft mouth with everything we had. Heavy losses, but the line held.':
      'Bránili jsme ústí šachty vším, co jsme měli. Ztráty byly těžké, ale linie vydržela.',
    'When I cut the turbine, the guards laid down their rifles. Today we signed the Underground Constitution: no one rules alone.':
      'Když jsem vypnula turbínu, stráže složily zbraně. Dnes jsme přijali Podzemní ústavu: nikdo nevládne sám.',
    'Walt passed quietly from miner’s cough. We hung his yellow helmet in the Hall—no one forgets who taught us to dig.':
      'Walt tiše odešel na hornickou silikózu. Jeho žlutou helmu jsme pověsili v Síni — nikdo nezapomene, kdo nás naučil kopat.',
    'First child born underground.': 'První dítě narozené v podzemí.',
  };
  let translated = map[note.text];
  if (!translated && note.text.startsWith('Lily was born today!')) {
    const pop = note.text.split('Population: ')[1] || '';
    translated = `Dnes se narodila Lily! První dítě pod zemí. Populace: ${pop}`;
  }
  const authorMap: Record<string, string> = { Council: 'Rada pěti' };
  return {
    ...note,
    author: authorMap[note.author] || note.author,
    text: translated || note.text,
  };
}

export function localizeNewspaper(paper: NewspaperIssue, lang: Language): NewspaperIssue {
  if (lang === 'en') return paper;
  const map: Record<string, { headline: string; subhead: string; body: string }> = {
    day1_chronicle: {
      headline: 'ČTYŘI ZAKLADATELÉ SESTUPUJÍ POD HOLLOW CREEK',
      subhead: 'Nákaza na povrchu uzavřela nouzový betonový kryt',
      body: 'Walt, Ray, Nora a Eli za úsvitu zajistili příklop s 540 konzervami. Bezpečnostní kamera zachytila infikované v ulicích nad nimi.',
    },
    coal_mine_found: {
      headline: 'OBJEVEN OPUŠTĚNÝ UHELNÝ DŮL V -36 M',
      subhead: 'Zásoby dřeva a kolejnic urychlují podzemní výstavbu',
      body: 'Horníci dnes prorazili do starých šachet a získali zásoby důlní výdřevy i ocelových kolejnic.',
    },
    strangers_arrived: {
      headline: 'ČTRNÁCT PŘÍCHOZÍCH PŘIJATO PODLE PRAVIDLA Č. 1',
      subhead: '48hodinová karanténa zabránila noční nákaze',
      body: 'Skupina vedená Marcusem vstoupila do Hollow Creeku po lékařské prohlídce. Stráž stanovila pravidla krytu.',
    },
    below_times_1: {
      headline: 'PODZEMNÍ LISTY: PRVNÍ SOUD V RADNÍ SÍNI',
      subhead: '22 vinen, 5 nevinen — Zavedeny přídělové lístky',
      body: 'Občané hlasovali o krádeži zásob. Třísměnný provoz a příděly nyní řídí život v celém podzemí.',
    },
    metro_sacrifice: {
      headline: 'PRŮLOM METRA UZAVŘEN — ELI UCTĚN NA ZDI PADLÝCH',
      subhead: 'Zatopení spodní šachty zastavilo vlnu infikovaných',
      body: 'Osmnáct občanů a zakladatel Eli položili život při zajištění východní šachty metra.',
    },
    constitution_signed: {
      headline: 'PODZEMNÍ ÚSTAVA PODEPSÁNA PO STÁVCE A BLACKOUTU',
      subhead: 'Lily obnovila proud z turbíny po konci vojenské vlády',
      body: 'Horníci v čele s Tobym a hlavní inženýrkou Lily otevřeli sklady stráží a vrátili městu svobodné volby.',
    },
    walt_memorial: {
      headline: 'ZAKLADATEL WALT POCHOVÁN S HORNICKÝMI POCTAMI',
      subhead: 'Jeho žlutá helma visí v Radní síni',
      body: 'Hollow Creek truchlí za mistra horníka, jehož pravidlo výdřevy ochránilo šedesát obyvatel.',
    },
    year30_victory: {
      headline: 'POPULACE 500: PRVNÍ JARNÍ ZAHRADA NA POVRCHU',
      subhead: '302 hlasů pro, 71 proti — Město pod zemí vychází na světlo',
      body: 'Po narození malého Felixe a ústupu infikovaných v zimě zakládá Podzemní velkoměsto první venkovní pole.',
    },
    year30_abyss: {
      headline: 'OBJEV V HLOUBCE -128 M: CO LEŽÍ POD NÁMI?',
      subhead: 'Vrták narazil na rozlehlou teplou kavernu pod řekou',
      body: 'Občané odhlasovali zachování podzemního města a průzkum neprobádané hlubiny.',
    },
  };
  const tr = map[paper.id];
  return tr ? { ...paper, ...tr } : paper;
}

export function localizeColonistRole(role: Colonist['role'], lang: Language): string {
  if (lang === 'en') return role;
  const roles: Record<Colonist['role'], string> = {
    Miner: 'Horník',
    Engineer: 'Technik',
    Medic: 'Zdravotník',
    Scout: 'Průzkumník',
    Guard: 'Strážný',
    Farmer: 'Farmář',
    Citizen: 'Občan',
  };
  return roles[role] || role;
}

export function localizeColonistNote(note: string, lang: Language): string {
  if (lang === 'en') return note;
  const map: Record<string, string> = {
    '30 years in the pits. Prop every 2 tiles.': '30 let v dolech. Výdřeva každé 2 metry.',
    'Keeping the bunker lights humming.': 'Drží světlo a rozvody v chodu.',
    'Nurse. Every life down here counts.': 'Zdravotní sestra. Každý život tu má cenu.',
    'Fast on my feet. Ready for surface runs.': 'Rychlý na nohou. Připraven na průzkum povrchu.',
    'Former police sergeant. Hatch stays locked.': 'Bývalý policista. Příklop zůstává pod zámkem.',
    'Lost two good people before we learned the hard way.': 'Ztratili jsme dva lidi, než jsme se poučili.',
    'First child born underground.': 'První dítě narozené v podzemí.',
    'Ray’s daughter. Keeper of the Hydro Turbine.': 'Rayova dcera. Strážkyně hydroturbíny.',
  };
  return map[note] || note;
}

export function localizeMaterial(mat: string, lang: Language): string {
  if (lang === 'en') return mat.replace('_', ' ');
  const map: Record<string, string> = {
    sky: 'obloha',
    surface: 'povrch',
    topsoil: 'ornice',
    clay: 'pevný jíl',
    coal_rock: 'uhelná sloj',
    limestone: 'vápenec',
    metro_ruin: 'trosky metra',
    deep_bedrock: 'hlubinné podloží',
    void_cavern: 'prázdnota -128 m',
    air: 'vykopaná chodba',
    concrete: 'betonový kryt',
    water_vein: 'vodní žíla',
    mycelium: 'podhoubí',
  };
  return map[mat] || mat;
}

export function localizeAcousticHint(hint: string, lang: Language): string {
  if (lang === 'en') return hint;
  const map: Record<string, string> = {
    water: 'voda',
    hollow: 'dutina',
    scratching: 'škrábání',
    abyss: 'hlubina -128 m',
  };
  return map[hint] || hint;
}

export function localizeRoomName(room: string, lang: Language): string {
  if (lang === 'en') return room;
  const map: Record<string, string> = {
    hatch: 'příklop',
    ladder: 'žebřík',
    support: 'výdřeva',
    bunk: 'ubikace',
    mushroom: 'houbová farma',
    well: 'studna / pumpa',
    pedal: 'šlapací dynamo',
    turbine: 'hydroturbína',
    clinic: 'ošetřovna',
    door: 'ocelové dveře',
    hall: 'radní síň',
  };
  return map[room] || room;
}

export function localizeGameOverReason(reason: string | null, lang: Language): string {
  if (!reason) return UI_TEXT[lang].lostBodyFallback;
  if (lang === 'en') return reason;
  if (reason === 'No survivors remain in Hollow Creek.') {
    return 'V Hollow Creeku nezůstali žádní přeživší.';
  }
  return reason;
}

export function formatTrendLabel(label: string, lang: Language): string {
  if (lang === 'en') return label;
  return label.replace(/^Y(\d+)\s+D(\d+)$/, 'R$1 D$2');
}

export function localizeCallout(text: string, lang: Language): string {
  if (lang === 'en') return text;

  const exact: Record<string, string> = {
    'Must connect to tunnel': 'Musí navazovat na chodbu',
    'Walt hears dripping water!': 'Walt slyší kapající vodu!',
    'Hollow echo behind rock': 'Dutá ozvěna za stěnou',
    'Warning: Scratching behind wall!': 'Varování: Škrábání za zdí!',
    'Deep abyss echo (-128m)': 'Ozvěna hlubiny (-128 m)',
    '+2 Timber': '+2 dřevo',
    '+30 Mycelium Food!': '+30 jídla z podhoubí!',
    '+2 Steel': '+2 ocel',
    'Water Vein Struck! +35 Water': 'Proražena vodní žíla! +35 vody',
    '+5 Scrap Steel · +2 Ammo': '+5 šrot oceli · +2 munice',
    '-128m Abyssal Void Detected!': 'Zjištěna propast v -128 m!',
    'Excavate tile first': 'Nejprve vykopej pole',
    'Insufficient Wood/Steel': 'Nedostatek dřeva/oceli',
    'Tile already occupied': 'Pole je již obsazené',
    '+15 Meds · +18 Food': '+15 léků · +18 jídla',
    'Scavenge Return: +22 Food +8 Wood +3 Meds': 'Návrat z povrchu: +22 jídlo +8 dřevo +3 léky',
  };
  if (exact[text]) return exact[text];

  if (text.startsWith('Built ')) {
    const enName = text.slice(6);
    const pair = (Object.keys(TOOLS_I18N.en) as ToolId[]).find(
      (id) => TOOLS_I18N.en[id].name === enName
    );
    return `Postaveno: ${pair ? TOOLS_I18N.cs[pair].name : enName}`;
  }
  const coalMatch = text.match(/^\+(\d+) Wood · \+(\d+) Steel$/);
  if (coalMatch) {
    return `+${coalMatch[1]} dřevo · +${coalMatch[2]} ocel`;
  }
  const climbMatch = text.match(/^(.+) climbs to surface$/);
  if (climbMatch) {
    return `${climbMatch[1]} stoupá na povrch`;
  }
  const caveMatch = text.match(/^Cave-in at (-\d+m)! Build Timber Props$/);
  if (caveMatch) {
    return `Zával v ${caveMatch[1]}! Stavěj výdřevu`;
  }
  return text;
}

export const UI_TEXT = {
  en: {
    subtitle: '30 YEARS BELOW · -128M',
    titleDesc:
      'Guide four survivors beneath the concrete hatch. Dig through ancient coal seams, tap the underground river, pass laws, and build a 500-citizen subterranean city across three decades.',
    startCta: 'Start Colony',
    controlsHint:
      'Click Dig or Build · WASD or Drag Pan · Right-Drag or Q/C Orbit 3D · Scroll Zoom · R Reset View',
    resetView: 'Reset 3D View [R]',
    shifts: ['Night Watch', 'Morning Shift', 'Day Shift', 'Evening Shift'],
    year: 'Year',
    day: 'Day',
    citizens: 'Citizens',
    food: 'Food',
    water: 'Water',
    wood: 'Wood',
    steel: 'Steel',
    power: 'Power',
    meds: 'Meds',
    spirit: 'Spirit',
    free: 'Free',
    scouting: 'Scouting...',
    surfaceBtn: 'Surface [E]',
    ledgerBtn: 'Laws & Log [L]',
    ledgerTitle: 'Colony Ledger',
    close: 'Close',
    tabs: {
      journal: 'Journal',
      trends: 'Trends',
      laws: 'Laws',
      press: 'Times',
      roster: 'Citizens',
    },
    lawsIntro:
      'Toggle subterranean ordinances. Laws shape food consumption, hatch security, and citizen Spirit.',
    active: 'Active',
    enact: 'Enact',
    newspaperTitle: 'The Below Times',
    censusLabel: 'Total Subterranean Census:',
    citizensUnit: 'citizens',
    fallen: 'Fallen',
    age: 'Age',
    sector: 'Sector',
    dismiss: 'Dismiss',
    strata: 'Strata',
    status: 'Status',
    markedDig: 'Marked for Dig',
    solidEarth: 'Solid Earth',
    unstableCeiling: 'Unstable Ceiling!',
    proppedSafe: 'Propped & Safe',
    structure: 'Structure',
    waterSat: 'Water Saturation',
    acousticCheck: 'Acoustic Check',
    pausedTitle: 'Colony Paused',
    resume: 'Resume',
    restart: 'Restart Colony',
    returnTitle: 'Return to Title',
    victoryTag: '30 Years Complete',
    lostTag: 'Colony Lost',
    victorySurface: 'Daylight Reclaimed',
    victoryAbyss: 'The -128m Abyss',
    lostTitle: 'Hollow Creek Fell Silent',
    victorySurfaceBody:
      'Five hundred citizens strong, Hollow Creek steps back onto the spring soil above.',
    victoryAbyssBody:
      'The subterranean city endured three decades and unlocked the vast cavern beneath the bedrock.',
    lostBodyFallback: 'Hunger, darkness, or collapse claimed the last survivors.',
    statYears: 'Years',
    statPeakPop: 'Peak Pop',
    statRooms: 'Rooms',
    statExcavated: 'Excavated',
    statLaws: 'Laws',
    statFallen: 'Fallen',
    playAgain: 'Play Again',
    titleBtn: 'Title',
    trends: {
      all: 'All',
      food: 'Food',
      water: 'Water',
      energy: 'Energy',
      netFood: 'Net Food / d',
      netWater: 'Net Water / d',
      powerMargin: 'Power Margin',
      surplus: 'Surplus',
      deficit: 'Deficit',
      stable: 'Stable',
      blackout: 'Blackout',
      chart1Title: 'Daily Consumption & Energy Demand',
      chart2EnergyTitle: 'Power Grid Capacity vs Demand',
      chart2ReservesTitle: 'Stored Reserves Over Time',
      samples: 'samples',
      sample: 'sample',
      pop: 'Pop',
      foodUse: 'Food Use/d',
      waterUse: 'Water Use/d',
      energyUse: 'Energy Use (W)',
      energyCap: 'Energy Cap (W)',
      foodProd: 'Food Prod/d',
      waterProd: 'Water Prod/d',
      foodCans: 'Food Cans',
      waterLiters: 'Water (L)',
      powerGen: 'Power Gen (W)',
      powerLoad: 'Power Load (W)',
      adviceFood:
        'Food reserves are shrinking. Build Mushroom Farms or enact Ration Tickets to slow consumption.',
      advicePower:
        'Power margin is tight. Add a Pedal Dynamo or tap the -56m river with a Hydro Turbine.',
      adviceSteady:
        'Resource curves are steady. Keep propping ceilings every 2 tiles as you dig deeper.',
    },
  },
  cs: {
    subtitle: '30 LET POD ZEMÍ · -128 M',
    titleDesc:
      'Veď čtyři přeživší pod betonovým příklopem. Hlub šachty přes staré uhelné sloje, napoj podzemní řeku, schvaluj zákony a vybuduj za třicet let podzemní město pro 500 obyvatel.',
    startCta: 'Zahájit kolonii',
    controlsHint:
      'Klik kopat/stavět · WASD/tažení posun · Pravé tlačítko nebo Q/C 3D rotace · Kolečko zoom · R Reset',
    resetView: 'Reset 3D pohledu [R]',
    shifts: ['Noční hlídka', 'Ranní směna', 'Denní směna', 'Večerní směna'],
    year: 'Rok',
    day: 'Den',
    citizens: 'Obyvatelé',
    food: 'Jídlo',
    water: 'Voda',
    wood: 'Dřevo',
    steel: 'Ocel',
    power: 'Energie',
    meds: 'Léky',
    spirit: 'Morálka',
    free: 'Zdarma',
    scouting: 'Průzkum...',
    surfaceBtn: 'Povrch [E]',
    ledgerBtn: 'Zákony & Deník [L]',
    ledgerTitle: 'Kronika kolonie',
    close: 'Zavřít',
    tabs: {
      journal: 'Deník',
      trends: 'Trendy',
      laws: 'Zákony',
      press: 'Listy',
      roster: 'Lidé',
    },
    lawsIntro:
      'Spravuj podzemní nařízení. Zákony ovlivňují spotřebu jídla, bezpečnost příklopu i morálku.',
    active: 'Platí',
    enact: 'Schválit',
    newspaperTitle: 'Podzemní listy',
    censusLabel: 'Celkový počet obyvatel pod zemí:',
    citizensUnit: 'občanů',
    fallen: 'Padlý',
    age: 'Věk',
    sector: 'Sektor',
    dismiss: 'Zavřít',
    strata: 'Vrstva',
    status: 'Stav',
    markedDig: 'Označeno ke kopání',
    solidEarth: 'Pevná hornina',
    unstableCeiling: 'Nestabilní strop!',
    proppedSafe: 'Vyztuženo výdřevou',
    structure: 'Stavba',
    waterSat: 'Zatopení',
    acousticCheck: 'Poslech stěny',
    pausedTitle: 'Kolonie pozastavena',
    resume: 'Pokračovat',
    restart: 'Restartovat kolonii',
    returnTitle: 'Hlavní nabídka',
    victoryTag: '30 let dokončeno',
    lostTag: 'Kolonie ztracena',
    victorySurface: 'Návrat na denní světlo',
    victoryAbyss: 'Hlubina -128 m',
    lostTitle: 'Hollow Creek utichl',
    victorySurfaceBody:
      'Pět set občanů Hollow Creeku vykročilo zpět na jarní půdu pod širým nebem.',
    victoryAbyssBody:
      'Podzemní město přečkalo tři dekády a odkrylo obrovskou kavernu hluboko pod řekou.',
    lostBodyFallback: 'Hlad, tma nebo zával si vyžádaly poslední přeživší.',
    statYears: 'Roky',
    statPeakPop: 'Max pop.',
    statRooms: 'Místnosti',
    statExcavated: 'Vykopáno',
    statLaws: 'Zákony',
    statFallen: 'Padlí',
    playAgain: 'Hrát znovu',
    titleBtn: 'Úvod',
    trends: {
      all: 'Vše',
      food: 'Jídlo',
      water: 'Voda',
      energy: 'Energie',
      netFood: 'Bilance jídla/d',
      netWater: 'Bilance vody/d',
      powerMargin: 'Rezerva sítě',
      surplus: 'Přebytek',
      deficit: 'Deficit',
      stable: 'Stabilní',
      blackout: 'Blackout',
      chart1Title: 'Denní spotřeba a odběr energie',
      chart2EnergyTitle: 'Výkon sítě vs. spotřeba',
      chart2ReservesTitle: 'Vývoj zásob v čase',
      samples: 'vzorků',
      sample: 'vzorek',
      pop: 'Pop.',
      foodUse: 'Spotřeba jídla/d',
      waterUse: 'Spotřeba vody/d',
      energyUse: 'Odběr energie (W)',
      energyCap: 'Kapacita sítě (W)',
      foodProd: 'Produkce jídla/d',
      waterProd: 'Produkce vody/d',
      foodCans: 'Konzervy',
      waterLiters: 'Voda (L)',
      powerGen: 'Výroba (W)',
      powerLoad: 'Zátěž (W)',
      adviceFood:
        'Zásoby jídla klesají. Postav Houbové farmy nebo zaveď Přídělové lístky ke zpomalení spotřeby.',
      advicePower:
        'Rezerva energie je nízká. Přidej Šlapací dynamo nebo postav Hydroturbínu u podzemní řeky (-56 m).',
      adviceSteady:
        'Křivky zdrojů jsou stabilní. Při hloubení nezapomeň stavět výdřevu každé 2 metry.',
    },
  },
} as const;
