<template>
	<div class="karaoke-wrapper">
		<!-- Barra de título personalizada -->
		<div class="title-bar">
			<div class="title-bar-drag-area">
				<span class="app-title">KaraokeMax</span>
			</div>
			<div class="title-bar-controls">
				<button class="title-bar-button minimize" @click="minimizeWindow" title="Minimizar">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 19H18V17H6V19Z" fill="currentColor" />
					</svg>
				</button>
				<button class="title-bar-button maximize" @click="maximizeWindow" title="Maximizar/Restaurar">
					<svg v-if="!isMaximized" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M4 4H20V20H4V4ZM6 6V18H18V6H6Z" fill="currentColor" />
					</svg>
					<svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M4 8H8V4H20V16H16V20H4V8ZM6 6V18H14V16H18V6H6ZM8 8V14H6V8H8Z" fill="currentColor" />
					</svg>
				</button>
				<button class="title-bar-button close" @click="closeWindow" title="Fechar">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
							fill="currentColor" />
					</svg>
				</button>
			</div>
		</div>

		<div class="karaoke-container">
			<div v-if="loading" class="loading-screen">
				<div class="loading-content">
					<div class="loading-spinner"></div>
					<h2>Carregando música...</h2>
					<p>{{ loadingMessage }}</p>
				</div>
			</div>

			<div v-else-if="error" class="error-screen">
				<div class="error-content">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="error-icon">
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
							fill="currentColor" />
					</svg>
					<h2>Erro ao carregar</h2>
					<p>{{ error }}</p>
					<button @click="voltarParaMusicas" class="btn-voltar">Voltar</button>
				</div>
			</div>

			<div v-else class="karaoke-screen">
				<div class="karaoke-header">
					<button @click="voltarParaMusicas" class="btn-back">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
						</svg>
					</button>
					<div class="song-info">
						<h1>{{ musica }}</h1>
						<p>{{ artista }}</p>
					</div>
					<div class="score-display">
						<span class="score-label">Pontuação</span>
						<span class="score-value">{{ pontuacaoTotal.toFixed(0) }}%</span>
					</div>
				</div>

				<!-- Piano-roll contínuo (rolagem horizontal com o tempo) -->
				<div class="staff-container">
					<canvas ref="staffCanvas" width="1200" height="200" class="staff-canvas"></canvas>
				</div>

				<!-- Indicador de Microfone -->
				<div v-if="microfoneAtivo" class="mic-indicator">
					<div class="mic-status">
						<div class="mic-level-bar">
							<div class="mic-level-fill" :style="{ width: micLevel + '%' }"></div>
						</div>
						<div class="mic-info">
							<span class="mic-label">🎤 Nível:</span>
							<span class="mic-value">{{ micLevel.toFixed(0) }}%</span>
							<span v-if="detectedFreq > 0" class="freq-info">
								| Freq: {{ detectedFreq.toFixed(1) }}Hz | Nota: {{ detectedNote }}
							</span>
							<span v-else class="freq-info no-signal">| Aguardando voz...</span>
						</div>
					</div>
				</div>

				<div class="lyrics-container">
					<div class="lyrics-scroll" ref="lyricsScroll">
						<div v-for="(linha, idx) in letras" :key="idx" :class="['lyric-line', {
							'active': idx === linhaAtual,
							'passed': idx < linhaAtual,
							'next': idx === linhaAtual + 1
						}]" :ref="el => { if (idx === linhaAtual) currentLineRef = el }">
							{{ linha.texto }}
						</div>
					</div>
				</div>

				<div class="controls">
					<button @click="togglePlay" class="btn-play">
						<svg v-if="!isPlaying" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 5v14l11-7z" fill="currentColor" />
						</svg>
						<svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor" />
						</svg>
					</button>

					<div class="progress-bar" @click="seek">
						<div class="progress-fill" :style="{ width: progresso + '%' }"></div>
						<div class="progress-handle" :style="{ left: progresso + '%' }"></div>
					</div>

					<div class="time-display">
						<span>{{ formatTime(tempoAtual) }}</span>
						<span>/</span>
						<span>{{ formatTime(duracao) }}</span>
					</div>

					<div class="volume-control">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
								fill="currentColor" />
						</svg>
						<input type="range" min="0" max="100" v-model="volume" class="volume-slider" />
					</div>

					<button @click="toggleMicrophone" :class="['btn-mic', { 'active': microfoneAtivo }]">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c1.66 0 3 1.34 3 3z"
								fill="currentColor" />
							<path
								d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
								fill="currentColor" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import api from '../services/api';

/* ========= Helpers de afinação ========= */
function hzToCents(hz, a4 = 440) {
	if (!hz || hz <= 0) return null;
	return 1200 * Math.log2(hz / a4) + 6900;
}

/* ========= Helpers de desenho (piano-roll contínuo) ========= */
function centsToY(cents, H = 200, semitonPx = 6, refCents = 6900) {
	const centerY = H / 2;
	const semitons = (cents - refCents) / 100;
	let y = centerY - semitons * semitonPx;
	return Math.max(10, Math.min(H - 10, y));
}
function drawStaffBase(ctx, W, H) {
	ctx.clearRect(0, 0, W, H);
	ctx.strokeStyle = "#e2e8f0";
	ctx.lineWidth = 1.5;
	for (let i = 0; i < 5; i++) {
		const y = 40 + i * 20;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(W, y);
		ctx.stroke();
	}
	ctx.strokeStyle = "#94a3b8";
	ctx.setLineDash([4,4]);
	ctx.beginPath();
	ctx.moveTo(0, H/2);
	ctx.lineTo(W, H/2);
	ctx.stroke();
	ctx.setLineDash([]);
}
function drawRoll(ctx, W, H, {
	tCenterMs, windowPastMs, windowFutureMs, hopMs,
	refTimesMs, refCents,
	userCentsGlobal, refStartMs
}) {
	drawStaffBase(ctx, W, H);

	const tStart = tCenterMs - windowPastMs;
	const tEnd   = tCenterMs + windowFutureMs;
	const spanMs = windowPastMs + windowFutureMs;
	const margin = 20;
	const plotW = W - margin * 2;

	const xOfTime = t => margin + ((t - tStart) / spanMs) * plotW;

	// 1) desenhar REF (azul)
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#60a5fa";
	ctx.beginPath();
	let started = false;

	for (let i = 0; i < refTimesMs.length; i++) {
		const t = refTimesMs[i];
		if (t < tStart || t > tEnd) continue;
		const c = refCents[i];
		if (c == null) { started = false; continue; }
		const x = xOfTime(t);
		const y = centsToY(c, H);
		if (!started) { ctx.moveTo(x,y); started = true; }
		else { ctx.lineTo(x,y); }
	}
	ctx.stroke();

	ctx.fillStyle = "#60a5fa";
	for (let i = 0; i < refTimesMs.length; i++) {
		const t = refTimesMs[i];
		if (t < tStart || t > tEnd) continue;
		const c = refCents[i];
		if (c == null) continue;
		const x = xOfTime(t);
		const y = centsToY(c, H);
		ctx.beginPath();
		ctx.arc(x, y, 2.2, 0, Math.PI * 2);
		ctx.fill();
	}

	// 2) desenhar USER (laranja)
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#f59e0b";
	ctx.beginPath();
	let startedU = false;

	const firstIdx = Math.max(0, Math.floor((tStart - refStartMs) / hopMs));
	const lastIdx  = Math.min(userCentsGlobal.length - 1, Math.ceil((tEnd - refStartMs) / hopMs));

	for (let i = firstIdx; i <= lastIdx; i++) {
		const t = refStartMs + i * hopMs;
		const c = userCentsGlobal[i];
		if (c == null) { startedU = false; continue; }
		const x = xOfTime(t);
		const y = centsToY(c, H);
		if (!startedU) { ctx.moveTo(x, y); startedU = true; }
		else { ctx.lineTo(x, y); }
	}
	ctx.stroke();

	ctx.fillStyle = "#f59e0b";
	for (let i = firstIdx; i <= lastIdx; i++) {
		const t = refStartMs + i * hopMs;
		const c = userCentsGlobal[i];
		if (c == null) continue;
		const x = xOfTime(t);
		const y = centsToY(c, H);
		ctx.beginPath();
		ctx.arc(x, y, 2.2, 0, Math.PI * 2);
		ctx.fill();
	}

	// Linha de "agora"
	ctx.strokeStyle = "rgba(229,231,235,0.8)";
	ctx.lineWidth = 1;
	ctx.setLineDash([6, 4]);
	const xNow = xOfTime(tCenterMs);
	ctx.beginPath();
	ctx.moveTo(xNow, 10);
	ctx.lineTo(xNow, H - 10);
	ctx.stroke();
	ctx.setLineDash([]);

	// legenda
	ctx.fillStyle = "#e5e7eb";
	ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif";
	ctx.fillText("Ref (gabarito)", margin, 18);
	ctx.fillStyle = "#60a5fa"; ctx.fillRect(margin + 90, 10, 14, 4);
	ctx.fillStyle = "#e5e7eb"; ctx.fillText("Usuário", margin + 120, 18);
	ctx.fillStyle = "#f59e0b"; ctx.fillRect(margin + 180, 10, 14, 4);
}

export default {
	name: 'TelaKaraoke',
	data() {
		return {
			artista: '',
			musica: '',
			loading: true,
			error: null,
			loadingMessage: 'Preparando karaokê...',
			audioInstrumental: null,
			letras: [],
			notasMusicais: [],
			isPlaying: false,
			tempoAtual: 0,
			duracao: 0,
			volume: 70,
			linhaAtual: -1,
			microfoneAtivo: false,
			audioContext: null,
			analyser: null,
			microphone: null,
			notaCantada: null,
			pontuacaoTotal: 0,
			acertos: 0,
			totalNotas: 0,
			isMaximized: false,
        	currentLineRef: null,

			// notes.json & piano-roll contínuo
			notesJson: null,
			a4hz: 440,
			hopMs: 10,
			refTimesMs: [],
			refCents: [],
			refStartMs: 0,
			refEndMs: 0,
			userCentsGlobal: [],

			// janela de visualização
			windowPastMs: 1500,
			windowFutureMs: 3500,

			// throttle de redesenho
			staffDrawReq: 0,
			
			// média móvel para pitch
			pitchHistory: [],
			
			// indicadores visuais de microfone
			micLevel: 0,
			detectedFreq: 0,
			detectedNote: '-',
			
			// controle de pontuação
			lastScoredIdx: -100
		};
	},
	computed: {
		progresso() {
			if (this.duracao === 0) return 0;
			return (this.tempoAtual / this.duracao) * 100;
		}
	},
	methods: {
		minimizeWindow() { if (window.electronAPI) window.electronAPI.minimizeWindow(); },
		closeWindow() { if (window.electronAPI) window.electronAPI.closeWindow(); },
		async maximizeWindow() { if (window.electronAPI) this.isMaximized = await window.electronAPI.maximizeWindow(); },
		async checkMaximizedState() { if (window.electronAPI) this.isMaximized = await window.electronAPI.isMaximized(); },

		async inicializar() {
			this.loading = true;
			this.loadingMessage = 'Baixando arquivos...';

			try {
				const musicaId = this.$route?.query?.id;
				if (!musicaId) throw new Error('ID da música não encontrado na rota.');

				const resp = await api.get(`/musicas/arquivos/${musicaId}`, { responseType: 'arraybuffer' });
				const zipBuffer = resp.data;

				if (!window.JSZip) {
					await new Promise((resolve, reject) => {
						const s = document.createElement('script');
						s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
						s.onload = resolve;
						s.onerror = () => reject(new Error('Não foi possível carregar JSZip.'));
						document.head.appendChild(s);
					});
				}

				this.loadingMessage = 'Extraindo ZIP...';
				const zip = await window.JSZip.loadAsync(zipBuffer);

				const instrEntry = zip.file(/(^|\/)Instrumentos\.wav$/i)?.[0];
				const lrcEntry   = zip.file(/(^|\/)lyrics\.lrc$/i)?.[0];
				const notesEntry = zip.file(/(^|\/)notes\.json$/i)?.[0];

				if (!instrEntry) throw new Error('Instrumentos.wav não encontrado no ZIP.');
				if (!lrcEntry)   throw new Error('lyrics.lrc não encontrado no ZIP.');
				if (!notesEntry) throw new Error('notes.json não encontrado no ZIP.');

				const [instrBlob, lrcText, notesText] = await Promise.all([
					instrEntry.async('blob'),
					lrcEntry.async('text'),
					notesEntry.async('text')
				]);

				// Parse notes.json
				this.notesJson = JSON.parse(notesText);
				this.a4hz = this.notesJson?.a4_hz || 440;
				this.hopMs = this.notesJson?.hop_ms || 10;

				this.refTimesMs = [];
				this.refCents = [];
				for (const seg of this.notesJson.segments) {
					const n = (seg.cents || []).length;
					for (let i = 0; i < n; i++) {
						this.refTimesMs.push(seg.start_ms + i * this.hopMs);
						this.refCents.push(seg.cents[i]);
					}
				}
				this.refStartMs = this.refTimesMs.length ? this.refTimesMs[0] : 0;
				this.refEndMs   = this.refTimesMs.length ? this.refTimesMs[this.refTimesMs.length - 1] : 0;

				this.userCentsGlobal = new Array(this.refTimesMs.length).fill(null);

				if (this._audioObjectUrl) URL.revokeObjectURL(this._audioObjectUrl);
				this._audioObjectUrl = URL.createObjectURL(new Blob([instrBlob], { type: 'audio/wav' }));

				this.loadingMessage = 'Carregando áudio...';
				await this.carregarAudio(this._audioObjectUrl);

				this.loadingMessage = 'Processando letras...';
				this.parseLRC(lrcText);

				this.loading = false;
				this.error = null;
			} catch (err) {
				console.error('Erro ao inicializar karaokê:', err);
				this.error = err.message || 'Erro desconhecido ao carregar o karaokê.';
				this.loading = false;
			}
		},

		async carregarAudio(url) {
			return new Promise((resolve, reject) => {
				this.audioInstrumental = new Audio(url);
				this.audioInstrumental.crossOrigin = 'anonymous';
				this.audioInstrumental.volume = this.volume / 100;

				this.audioInstrumental.addEventListener('loadedmetadata', () => {
					this.duracao = this.audioInstrumental.duration;
					resolve();
				});

				this.audioInstrumental.addEventListener('error', () => {
					reject(new Error('Erro ao carregar áudio'));
				});

				this.audioInstrumental.addEventListener('timeupdate', () => {
					this.tempoAtual = this.audioInstrumental.currentTime;
					this.atualizarLinhaAtual();
					this.requestStaffDraw();
				});

				this.audioInstrumental.addEventListener('ended', () => {
					this.isPlaying = false;
					this.finalizarKaraoke();
				});
			});
		},

		parseLRC(texto) {
			const linhas = texto.split('\n');
			this.letras = [];
			this.notasMusicais = [];

			linhas.forEach(linha => {
				const match = linha.match(/\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.+)/);
				if (!match) return;

				const minutos = parseInt(match[1]);
				const segundos = parseInt(match[2]);
				const centesimos = parseInt(match[3]);
				const conteudo = match[4];
				const tempo = minutos * 60 + segundos + centesimos / 100;

				const textoLimpo = conteudo.replace(/\([A-G][#♯♭b]?\d+\)/g, '').trim();
				this.letras.push({ tempo, texto: textoLimpo });

				const notasRegex = /\(([A-G][#♯♭b]?\d+)\)/g;
				let notaMatch;
				while ((notaMatch = notasRegex.exec(conteudo)) !== null) {
					this.notasMusicais.push({
						tempo,
						nome: notaMatch[1],
						acertou: null
					});
				}
			});

			this.totalNotas = this.notasMusicais.length;
		},

		async toggleMicrophone() {
			if (!this.microfoneAtivo) {
				try {
					this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
					const stream = await navigator.mediaDevices.getUserMedia({ 
						audio: {
							echoCancellation: true,
							noiseSuppression: true,
							autoGainControl: true,
							sampleRate: 44100
						}
					});

					this.microphone = this.audioContext.createMediaStreamSource(stream);
					this.analyser = this.audioContext.createAnalyser();
					this.analyser.fftSize = 4096;
					this.analyser.smoothingTimeConstant = 0.8;

					this.microphone.connect(this.analyser);
					this.microfoneAtivo = true;
					this.pitchHistory = [];
					this.detectarPitch();
				} catch (err) {
					alert('Erro ao acessar microfone: ' + err.message);
				}
			} else {
				this.microfoneAtivo = false;
				if (this.microphone) {
					this.microphone.disconnect();
					this.audioContext.close();
				}
			}
		},

		detectarPitch() {
			if (!this.microfoneAtivo) return;

			const bufferLength = this.analyser.fftSize;
			const buffer = new Float32Array(bufferLength);

			const detectar = () => {
				if (!this.microfoneAtivo) return;

				this.analyser.getFloatTimeDomainData(buffer);
				
				// Calcular nível de áudio (RMS)
				let rms = 0;
				for (let i = 0; i < buffer.length; i++) {
					rms += buffer[i] * buffer[i];
				}
				rms = Math.sqrt(rms / buffer.length);
				this.micLevel = Math.min(100, rms * 1000);
				
				const freqHz = this.autoCorrelate(buffer, this.audioContext.sampleRate);

				if (freqHz > -1 && freqHz >= 80 && freqHz <= 1200) {
					if (!this.pitchHistory) this.pitchHistory = [];
					this.pitchHistory.push(freqHz);
					if (this.pitchHistory.length > 5) this.pitchHistory.shift();
					
					const avgFreq = this.pitchHistory.reduce((a, b) => a + b, 0) / this.pitchHistory.length;
					
					this.detectedFreq = avgFreq;
					this.detectedNote = this.frequenciaParaNota(avgFreq);

					const cents = hzToCents(avgFreq, this.a4hz);
					const notaNome = this.frequenciaParaNota(avgFreq);
					this.notaCantada = { nome: notaNome, y: this.notaParaY(notaNome) };

					const tMs = this.tempoAtual * 1000;
					const idx = Math.round((tMs - this.refStartMs) / this.hopMs);
					if (idx >= 0 && idx < this.userCentsGlobal.length) {
						this.userCentsGlobal[idx] = cents;
					}

					this.requestStaffDraw();
					this.verificarAcerto(notaNome);
				} else {
					this.detectedFreq = 0;
					this.detectedNote = '-';
					if (this.pitchHistory && this.pitchHistory.length > 0) {
						this.pitchHistory = [];
					}
				}

				requestAnimationFrame(detectar);
			};

			detectar();
		},

		drawStaff() {
			const cv = this.$refs.staffCanvas;
			if (!cv || !this.refTimesMs.length) return;
			const ctx = cv.getContext('2d');
			const W = cv.width, H = cv.height;

			const tCenterMs = this.tempoAtual * 1000;
			drawRoll(ctx, W, H, {
				tCenterMs,
				windowPastMs: this.windowPastMs,
				windowFutureMs: this.windowFutureMs,
				hopMs: this.hopMs,
				refTimesMs: this.refTimesMs,
				refCents: this.refCents,
				userCentsGlobal: this.userCentsGlobal,
				refStartMs: this.refStartMs
			});
		},

		requestStaffDraw() {
			if (this.staffDrawReq) return;
			this.staffDrawReq = requestAnimationFrame(() => {
				this.staffDrawReq = 0;
				this.drawStaff();
			});
		},

		autoCorrelate(buffer, sampleRate) {
			let size = buffer.length;
			let maxSamples = Math.floor(size / 2);
			let bestOffset = -1;
			let bestCorrelation = 0;
			let rms = 0;

			for (let i = 0; i < size; i++) {
				rms += buffer[i] * buffer[i];
			}
			rms = Math.sqrt(rms / size);
			
			if (rms < 0.003) return -1;

			const normalizedBuffer = new Float32Array(size);
			for (let i = 0; i < size; i++) {
				normalizedBuffer[i] = buffer[i] / rms;
			}

			let lastCorrelation = 1;
			const minOffset = Math.floor(sampleRate / 1200);
			const maxOffset = Math.floor(sampleRate / 80);

			for (let offset = minOffset; offset < Math.min(maxOffset, maxSamples); offset++) {
				let correlation = 0;
				for (let i = 0; i < maxSamples; i++) {
					correlation += Math.abs(normalizedBuffer[i] - normalizedBuffer[i + offset]);
				}
				correlation = 1 - correlation / maxSamples;

				if (correlation > 0.7 && correlation > lastCorrelation) {
					if (correlation > bestCorrelation) {
						bestCorrelation = correlation;
						bestOffset = offset;
					}
				} else if (correlation > bestCorrelation && correlation > 0.85) {
					bestCorrelation = correlation;
					bestOffset = offset;
				}
				
				lastCorrelation = correlation;
			}

			if (bestCorrelation > 0.01 && bestOffset > 0) {
				return sampleRate / bestOffset;
			}
			return -1;
		},

		frequenciaParaNota(freq) {
			const A4 = 440;
			const C0 = A4 * Math.pow(2, -4.75);
			const semitons = 12 * Math.log2(freq / C0);
			const nota = Math.round(semitons);

			const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
			const oitava = Math.floor(nota / 12);
			const nomeDaNota = notas[nota % 12];

			return `${nomeDaNota}${oitava}`;
		},

		notaParaY(notaNome) {
			const notaBase = {
				'C': 0, 'C#': 0.5, 'D': 1, 'D#': 1.5, 'E': 2, 'F': 2.5,
				'F#': 3, 'G': 3.5, 'G#': 4, 'A': 4.5, 'A#': 5, 'B': 5.5
			};

			const match = notaNome.match(/([A-G][#♯♭b]?)(\d+)/);
			if (!match) return 100;

			const nota = match[1];
			const oitava = parseInt(match[2]);
			const notaNum = notaBase[nota.replace('♯', '#').replace('♭', 'b')] || 0;
			const semitons = (oitava - 4) * 12 + notaNum;
			const y = 80 - (semitons * 5);

			return Math.max(20, Math.min(180, y));
		},

		verificarAcerto(notaCantada) {
			if (!this.refTimesMs || this.refTimesMs.length === 0) return;
			
			const tMs = this.tempoAtual * 1000;
			const userCents = hzToCents(this.detectedFreq, this.a4hz);
			
			if (!userCents) return;
			
			// Encontrar o índice mais próximo do tempo atual
			const idx = Math.round((tMs - this.refStartMs) / this.hopMs);
			if (idx < 0 || idx >= this.refCents.length) return;
			
			// Pegar a nota de referência no tempo atual
			const refCents = this.refCents[idx];
			if (refCents == null) return;
			
			// Calcular a diferença em cents (50 cents = meio semitom, tolerância razoável)
			const diffCents = Math.abs(userCents - refCents);
			
			// Se a diferença for menor que 50 cents (meio semitom), considera acerto
			if (diffCents <= 50) {
				// Verificar se já não pontuou neste frame recentemente
				const lastScoreIdx = this.lastScoredIdx || -100;
				if (idx - lastScoreIdx > 5) { // Só pontua a cada 5 frames (50ms)
					this.acertos++;
					this.lastScoredIdx = idx;
					
					// Recalcular pontuação total baseado nos frames processados
					const framesProcessados = Math.max(1, idx);
					this.pontuacaoTotal = (this.acertos / framesProcessados) * 100 * 10; // Multiplicador para melhor visualização
					this.pontuacaoTotal = Math.min(100, this.pontuacaoTotal); // Limita a 100%
				}
			}
		},

		compararNotas(nota1, nota2) {
			const base1 = nota1.replace(/\d+/, '');
			const base2 = nota2.replace(/\d+/, '');
			return base1 === base2;
		},

		atualizarLinhaAtual() {
			for (let i = 0; i < this.letras.length; i++) {
				if (this.tempoAtual >= this.letras[i].tempo) {
					this.linhaAtual = i;
				} else {
					break;
				}
			}
			this.$nextTick(() => {
				if (this.currentLineRef && this.$refs.lyricsScroll) {
					const container = this.$refs.lyricsScroll;
					const element = this.currentLineRef;
					const elementRect = element.getBoundingClientRect();
					const containerRect = container.getBoundingClientRect();
					const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
					container.scrollBy({ top: offset, behavior: 'smooth' });
				}
			});
		},

		togglePlay() {
			if (!this.audioInstrumental) return;

			if (this.isPlaying) {
				this.audioInstrumental.pause();
			} else {
				this.audioInstrumental.play();
			}
			this.isPlaying = !this.isPlaying;
		},

		seek(event) {
			if (!this.audioInstrumental) return;

			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const percentual = x / rect.width;

			this.audioInstrumental.currentTime = percentual * this.duracao;
		},

		formatTime(segundos) {
			const min = Math.floor(segundos / 60);
			const sec = Math.floor(segundos % 60);
			return `${min}:${sec.toString().padStart(2, '0')}`;
		},

		finalizarKaraoke() {
			alert(`Karaokê finalizado! Pontuação: ${this.pontuacaoTotal.toFixed(0)}%`);
		},

		voltarParaMusicas() {
			if (this.audioInstrumental) {
				this.audioInstrumental.pause();
			}
			if (this.microfoneAtivo) {
				this.toggleMicrophone();
			}
			this.$router.push('/principal');
		}
	},
	watch: {
		volume(newVal) {
			if (this.audioInstrumental) {
				this.audioInstrumental.volume = newVal / 100;
			}
		}
	},
	mounted() {
		this.checkMaximizedState();
		this.inicializar();
	},
	beforeUnmount() {
		if (this.audioInstrumental) {
			this.audioInstrumental.pause();
			this.audioInstrumental = null;
		}
		if (this.microfoneAtivo) {
			this.toggleMicrophone();
		}
		if (this._audioObjectUrl) {
			URL.revokeObjectURL(this._audioObjectUrl);
			this._audioObjectUrl = null;
		}
	}
};
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.karaoke-wrapper {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: fixed;
	top: 0;
	left: 0;
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.title-bar {
	height: 32px;
	background: rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px;
	-webkit-app-region: drag;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	z-index: 1000;
	flex-shrink: 0;
}
.title-bar-drag-area { display: flex; align-items: center; flex: 1; height: 100%; }
.app-title { color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500; margin-left: 8px; }
.title-bar-controls { display: flex; align-items: center; -webkit-app-region: no-drag; }
.title-bar-button { width: 32px; height: 32px; border: none; background: transparent; color: rgba(255, 255, 255, 0.7); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border-radius: 4px; }
.title-bar-button:hover { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9); }
.title-bar-button.close:hover { background: #e81123; color: white; }
.title-bar-button svg { width: 16px; height: 16px; }

.karaoke-container {
	flex: 1;
	width: 100%;
	height: calc(100vh - 32px);
	color: white;
	font-family: 'Inter', sans-serif;
	overflow: hidden;
	position: relative;
}

.loading-screen, .error-screen {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.loading-content, .error-content { text-align: center; padding: 2rem; }
.loading-spinner {
	width: 60px; height: 60px;
	border: 4px solid rgba(102, 126, 234, 0.3);
	border-top: 4px solid #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 1.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-icon { width: 64px; height: 64px; color: #f56565; margin: 0 auto 1rem; }
.btn-voltar {
	margin-top: 1.5rem;
	padding: 0.75rem 2rem;
	background: #667eea; border: none; border-radius: 8px;
	color: white; font-weight: 600; cursor: pointer;
}

.karaoke-screen { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.karaoke-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: rgba(0, 0, 0, 0.3); flex-shrink: 0; }
.btn-back {
	width: 40px; height: 40px; border: none; background: rgba(255, 255, 255, 0.1);
	border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.btn-back svg { width: 24px; height: 24px; }
.song-info { flex: 1; text-align: center; }
.song-info h1 { font-size: 1.8rem; margin: 0 0 0.25rem 0; font-weight: 700; }
.song-info p { margin: 0; color: rgba(255, 255, 255, 0.7); }
.score-display { display: flex; flex-direction: column; align-items: center; padding: 0.5rem 1.5rem; background: rgba(72, 187, 120, 0.2); border-radius: 12px; border: 2px solid #48bb78; }
.score-value { font-size: 1.8rem; font-weight: 700; color: #48bb78; }

.staff-container {
	height: 200px;
	background: rgba(0, 0, 0, 0.2);
	padding: 1rem;
	margin: 1rem 2rem 0.5rem 2rem;
	border-radius: 16px;
	flex-shrink: 0;
}
.staff-canvas { width: 100%; height: 100%; display: block; border-radius: 16px; background: rgba(0,0,0,0.2); }

.mic-indicator {
	margin: 0.5rem 2rem 1rem 2rem;
	padding: 1rem 1.5rem;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 12px;
	border: 2px solid rgba(72, 187, 120, 0.3);
	flex-shrink: 0;
}
.mic-status {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.mic-level-bar {
	height: 12px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	overflow: hidden;
	position: relative;
}
.mic-level-fill {
	height: 100%;
	background: linear-gradient(90deg, #48bb78 0%, #38a169 50%, #f59e0b 100%);
	border-radius: 6px;
	transition: width 0.1s ease;
	box-shadow: 0 0 10px rgba(72, 187, 120, 0.5);
}
.mic-info {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-size: 0.95rem;
	color: rgba(255, 255, 255, 0.9);
}
.mic-label {
	font-weight: 600;
	color: #48bb78;
}
.mic-value {
	font-weight: 700;
	color: #48bb78;
	min-width: 40px;
}
.freq-info {
	color: rgba(255, 255, 255, 0.7);
	font-family: 'Courier New', monospace;
}
.freq-info.no-signal {
	color: rgba(255, 255, 255, 0.4);
	font-style: italic;
}

.lyrics-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
}
.lyrics-scroll {
    text-align: center;
    max-width: 800px;
    max-height: 400px;
    overflow-y: auto;
    padding: 2rem 1rem;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.lyrics-scroll::-webkit-scrollbar { display: none; }
.lyric-line { font-size: 2rem; margin: 1rem 0; opacity: 0.3; transition: all 0.3s; }
.lyric-line.active { opacity: 1; font-size: 2.5rem; font-weight: 700; color: #48bb78; }

.controls { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 2rem; background: rgba(0, 0, 0, 0.3); }
.btn-play, .btn-mic { width: 56px; height: 56px; border: none; background: #667eea; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-mic.active { background: #48bb78; }
.progress-bar { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.2); border-radius: 4px; position: relative; cursor: pointer; }
.progress-fill { height: 100%; background: #667eea; border-radius: 4px; }
.progress-handle { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px; background: white; border-radius: 50%; }
.time-display { display: flex; gap: 0.5rem; min-width: 100px; }
.volume-control { display: flex; align-items: center; gap: 0.75rem; }
.volume-slider { width: 100px; }
</style>