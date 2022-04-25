const pokemonAliases = {
  'Necrozma-Dusk-Mane':   'Necrozma-DM',
  'Necrozma-Dawn-Wings':  'Necrozma-DW',
  'Calyrex-Shadow':       'Calyrex-S',
  'Calyrex-Ice':          'Calyrex-I',
  'Giratina-Origin':      'Giratina-O',
  'Kyurem-Black':         'Kyurem-B',
  'Kyurem-White':         'Kyurem-W',
  'Tornadus-Therian':     'Tornadus-T',
  'Landorus-Therian':     'Landorus-T',
  'Thundurus-Therian':    'Thundurus-T',
  'Zamazenta-Crowned':    'Zamazenta-C',
  'Zacian-Crowned':       'Zacian-C',
  'Darmanitan-Galar':     'Galarian Darmanitan',
  'Slowking-Galar':       'Galarian Slowking',
  'Slowbro-Galar':        'Galarian Slowbro',
  'Weezing-Galar':        'Galarian Weezing',
  'Meowth-Galar':         'Galarian Meowth',
  'Ponyta-Galar':         'Galarian Ponyta',
  'Rapidash-Galar':       'Galarian Rapidash',
  'Slowpoke-Galar':       'Galarian Slowpoke',
  'Farfetch\'d-Galar':    'Galarian Farfetch\'d',
  'Mr. Mime-Galar':       'Galarian Mr. Mime',
  'Articuno-Galar':       'Galarian Articuno',
  'Moltres-Galar':        'Galarian Moltres',
  'Zapdos-Galar':         'Galarian Zapdos',
  'Corsola-Galar':        'Galarian Corsola',
  'Zigzagoon-Galar':      'Galarian Zigzagoon',
  'Linoone-Galar':        'Galarian Linoone',
  'Darumaka-Galar':       'Galarian Darumaka',
  'Yamask-Galar':         'Galarian Yamask',
  'Stunfisk-Galar':       'Galarian Stunfisk',
  'Diglett-Alola':        'Alolan Diglett',
  'Dugtrio-Alola':        'Alolan Dugtrio',
  'Exeggutor-Alola':      'Alolan Exeggutor',
  'Genesect-Burn':        'Genesect-B',
  'Genesect-Chill':       'Genesect-C',
  'Genesect-Douse':       'Genesect-D',
  'Genesect-Shock':       'Genesect-S',
  'Gourgeist-Small':      'Gourgeist-S',
  'Gourgeist-Large':      'Gourgeist-L',
  'Gourgeist-Super':      'Gourgeist-XL',
  'Lycanroc-Dusk':        'Lycanroc-D',
  'Lycanroc-Midnight':    'Lycanroc-N',
  'Marowak-Alola':        'Alolan Marowak',
  'Meowth-Alola':         'Alolan Meowth',
  'Ninetales-Alola':      'Alolan Ninetales',
  'Persian-Alola':        'Alolan Persian',
  'Pumpkaboo-Small':      'Pumpkaboo-S',
  'Pumpkaboo-Large':      'Pumpkaboo-L',
  'Pumpkaboo-Super':      'Pumpkaboo-XL',
  'Raichu-Alola':         'Alolan Raichu',
  'Rotom-Fan':            'Rotom-S',
  'Rotom-Frost':          'Rotom-F',
  'Rotom-Heat':           'Rotom-H',
  'Rotom-Mow':            'Rotom-C',
  'Rotom-Wash':           'Rotom-W',
  'Sandshrew-Alola':      'Alolan Sandshrew',
  'Sandslash-Alola':      'Alolan Sandslash',
  'Urshifu-Rapid-Strike': 'Urshifu-R',
  'Vulpix-Alola':         'Alolan Vulpix',
  'Deoxys-Attack':        'Deoxys-A',
  'Deoxys-Defense':       'Deoxys-D',
  'Deoxys-Speed':         'Deoxys-S',
  'Geodude-Alola':        'Alolan Geodude',
  'Graveler-Alola':       'Alolan Graveler',
  'Golem-Alola':          'Alolan Golem',
  'Grimer-Alola':         'Alolan Grimer',
  'Muk-Alola':            'Alolan Muk',
  'Hoopa-Unbound':        'Hoopa-U',
  'Oricorio-Pom-Pom':     'Oricorio-E',
  'Oricorio-Sensu':       'Oricorio-G',
  'Oricorio-Pa\'u':       'Oricorio-P',
  'Raticate-Alola':       'Alolan Raticate',
  'Rattata-Alola':        'Alolan Rattata',
  'Shaymin-Sky':          'Shaymin-S',
  'Wormadam-Trash':       'Wormadam-S',
  'Wormadam-Sandy':       'Wormadam-G',
}

const genAliases = {
  'gen8': 'ss',
  'gen7': 'sm',
  'gen6': 'xy',
  'gen5': 'bw',
  'gen4': 'dp',
  'gen3': 'rs',
  'gen2': 'gs',
  'gen1': 'rb',
}

const metaAliases = {
  'anythinggoes': 'ag',
  'lc': 'lc',
  'nationaldex': 'national-dex',
  'nfe': 'nfe',
  'ou': 'ou',
  'pu': 'pu',
  'ru': 'ru',
  'ubers': 'uber',
  'uu': 'uu',
  'zu': 'zu',
}

export const pokemonAliasMap = new Map(Object.entries(pokemonAliases));
export const genAliasMap = new Map(Object.entries(genAliases));
export const metaAliasMap = new Map(Object.entries(metaAliases));