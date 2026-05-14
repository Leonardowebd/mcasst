import svgPaths from "./svg-vtuwmu1osv";
import imgFundo2 from "./7043883636bed05655a6c4c2dfccf2a51368bd79.png";
import imgArvore1 from "./1157fca2f0edad10e429dc5595004b239f1de787.png";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[647px] ml-0 mt-0 relative row-1 w-[1463px]" data-name="fundo2">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[312.66%] left-[-28.21%] max-w-none top-[-112.85%] w-[156.41%]" src={imgFundo2} />
        </div>
      </div>
      <div className="col-1 h-[647px] ml-[482px] mt-0 relative row-1 w-[496px]" data-name="arvore1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[189.13%] left-[-78.55%] max-w-none top-[-56.91%] w-[279.36%]" src={imgArvore1} />
        </div>
      </div>
      <div className="col-1 h-[121px] ml-[613.5px] mt-[414px] relative row-1 w-[236px]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 236 121">
          <g id="Vector">
            <path d={svgPaths.p35f76ff0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1ada6d80} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3c395b00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p37dc1900} fill="var(--fill-0, white)" />
            <path d={svgPaths.p18b31400} fill="var(--fill-0, white)" />
            <path d={svgPaths.p16458480} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28498d70} fill="var(--fill-0, white)" />
            <path d={svgPaths.pa116d80} fill="var(--fill-0, white)" />
            <path d={svgPaths.pa9bce70} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28217b00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p20be1600} fill="var(--fill-0, white)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col items-center justify-end pr-[5px] relative size-full">
      <Group />
    </div>
  );
}