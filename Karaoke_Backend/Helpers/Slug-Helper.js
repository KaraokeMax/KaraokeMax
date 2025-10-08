export function toSlug(nome) {
    return nome
        .toString()
        .normalize('NFD') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-') // Troca espaços por hífen
        .replace(/-+/g, '-') // Remove múltiplos hífens
        .toLowerCase();
}