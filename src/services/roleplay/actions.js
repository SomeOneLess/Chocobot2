// Comando -> acción del proveedor de GIFs.
// Lo que no esté aquí o no exista en el proveedor sale solo con texto.
export const sfwActions = {
  abrazar: 'hug', besar: 'kiss', acariciar: 'pat', golpear: 'punch', morder: 'bite',
  cosquillas: 'tickle', pellizcar: 'poke', empujar: 'yeet', palmear: 'highfive',
  celebrar: 'dance', acurrucar: 'cuddle', mimar: 'cuddle', consentir: 'pat',
  apoyar: 'thumbsup', ayudar: 'handshake', acompanar: 'handhold', cuidar: 'pat',
  defender: 'thumbsup', cocinar: 'feed', masajear: 'pat', grunir: 'pout', ronronear: 'cuddle',
};

// Los proveedores gratuitos sin API key casi no tienen GIFs NSFW.
// waifu.pics solo ofrece estas categorías (waifu, neko, trap, blowjob), así que
// solo mapeo lo que coincide de forma directa. Amplía esta tabla si añades otro proveedor.
export const nsfwActions = {
  chupar: 'blowjob',
  mamar: 'blowjob',
};
