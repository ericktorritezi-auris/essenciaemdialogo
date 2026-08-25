/**
 * Elemento de assinatura visual desta sprint de diagramação: um
 * divisor em forma de onda sonora, ecoando o motivo que já existe na
 * própria logomarca (as barras de áudio ao lado do símbolo). Usado
 * entre seções da Home para reforçar a identidade "diálogo em áudio"
 * sem depender de imagens pesadas — é um SVG puro, leve, e reage à
 * paleta via `currentColor`.
 */
export function WaveDivider({ className = "" }: { className?: string }) {
  // Alturas geradas uma vez, com uma leve assimetria "orgânica" (não
  // é uma onda senoidal perfeita) — ecoa o waveform desenhado à mão
  // na logomarca, não um ícone de equalizer genérico.
  const heights = [4, 7, 5, 12, 8, 16, 10, 20, 13, 24, 15, 20, 11, 16, 8, 12, 5, 7, 4, 6];

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-[3px] text-bronze/40 ${className}`}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-current"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}
