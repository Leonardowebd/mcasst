import svgPaths from "./svg-rkrdtchk7a";
import imgDepoimentoVideos from "./7043883636bed05655a6c4c2dfccf2a51368bd79.png";

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[15px] items-start left-1/2 not-italic text-center text-white top-[calc(50%+293.5px)] w-[306px]">
      <div className="font-['Metropolis:Semi_Bold',sans-serif] leading-[0] relative shrink-0 text-[21px] w-full">
        <p className="leading-[normal] mb-0">Resultados não são discurso.</p>
        <p className="leading-[normal]">São consequência de estrutura bem construída.</p>
      </div>
      <p className="font-['Rounded_Elegance:Regular',sans-serif] leading-[normal] relative shrink-0 text-[20px] w-full">Empresas que organizaram posicionamento, vendas e processos passaram a crescer com mais clareza e previsibilidade.</p>
    </div>
  );
}

function PhArrowUpThin() {
  return (
    <div className="relative size-[76px]" data-name="ph:arrow-up-thin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 76 76">
        <g id="ph:arrow-up-thin">
          <path d={svgPaths.p10959d00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function PhArrowUpThin1() {
  return (
    <div className="relative size-[76px]" data-name="ph:arrow-up-thin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 76 76">
        <g id="ph:arrow-up-thin">
          <path d={svgPaths.p10959d00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function DepoimentoVideos() {
  return (
    <div className="relative size-full" data-name="Depoimento videos">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img alt="" className="absolute max-w-none object-cover size-full" src={imgDepoimentoVideos} />
        <div className="absolute bg-[rgba(0,0,0,0.6)] inset-0" />
      </div>
      <Frame />
      <div className="absolute flex items-center justify-center left-[10px] size-[76px] top-[382px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <PhArrowUpThin />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%+153px)] size-[76px] top-[382px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <PhArrowUpThin1 />
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[105px] left-1/2 top-1/2 w-[96px]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 105">
          <path clipRule="evenodd" d={svgPaths.pb88b200} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}