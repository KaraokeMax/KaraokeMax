require('dotenv').config();
const B2 = require('backblaze-b2');

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY
});

const BUCKET_NAME = process.env.B2_BUCKET;

// cache simples do token de auth
let lastAuth = 0;
const AUTH_TTL_MS = 1000 * 60 * 50; // ~50 min

async function ensureAuth() {
  const now = Date.now();
  if (!lastAuth || (now - lastAuth) > AUTH_TTL_MS) {
    await b2.authorize();
    lastAuth = now;
  }
}

async function getKaraokeStreams(artista_slug, musica_slug) {
  if (!BUCKET_NAME) throw new Error('Defina B2_BUCKET_NAME no .env');
  if (!artista_slug || !musica_slug) throw new Error('artista_slug e musica_slug são obrigatórios');

  const basePath = `${artista_slug}/${musica_slug}`;

  await ensureAuth();

  // Instrumentos.wav
  let instrumentosRes;
  try {
    instrumentosRes = await b2.downloadFileByName({
      bucketName: BUCKET_NAME,
      fileName: `${basePath}/instrumentos.wav`,
      responseType: 'stream'
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    const msg = status === 404
      ? `instrumentos.wav não encontrado em ${basePath}`
      : `Falha ao baixar instrumentos.wav: ${e.message || e}`;
    const err = new Error(msg);
    err.status = status;
    throw err;
  }

  // lyrics.lrc
  let lyricsRes;
  try {
    lyricsRes = await b2.downloadFileByName({
      bucketName: BUCKET_NAME,
      fileName: `${basePath}/lyrics.lrc`,
      responseType: 'stream'
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    const msg = status === 404
      ? `lyrics.lrc não encontrado em ${basePath}`
      : `Falha ao baixar lyrics.lrc: ${e.message || e}`;
    const err = new Error(msg);
    err.status = status;
    throw err;
  }

  return {
    instrumentos: {
      stream: instrumentosRes.data,
      headers: instrumentosRes.headers,
      fileName: 'Instrumentos.wav'
    },
    lyrics: {
      stream: lyricsRes.data,
      headers: lyricsRes.headers,
      fileName: 'lyrics.lrc'
    }
  };
}

module.exports = {
  getKaraokeStreams
};
