export function criarArquivoLRC(texto) {
	// Normaliza as quebras de linha (\r\n ou \r → \n)
	const textoNormalizado = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	// Cria um buffer em UTF-8
	const buffer = Buffer.from(textoNormalizado, "utf-8");

	return {
		nome: "lyrics.lrc",
		tipo: "text/plain",
		tamanho: buffer.length,
		conteudo: buffer
  	};
}
