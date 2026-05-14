import svgPaths from "./svg-czbfmwamys";
import imgFundo2 from "./7043883636bed05655a6c4c2dfccf2a51368bd79.png";
import imgArvore1 from "./1157fca2f0edad10e429dc5595004b239f1de787.png";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[1273px] ml-0 mt-[222px] relative row-1 w-[1440px]" data-name="fundo2">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[156.49%] left-[-28.21%] max-w-none top-[-56.48%] w-[156.41%]" src={imgFundo2} />
        </div>
      </div>
      <div className="col-1 h-[1406px] ml-[307px] mt-0 relative row-1 w-[826px]" data-name="arvore1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[144.87%] left-[-78.55%] max-w-none top-[-43.59%] w-[279.36%]" src={imgArvore1} />
        </div>
      </div>
      <div className="col-1 h-[121px] ml-[602px] mt-[828px] relative row-1 w-[236px]" data-name="Vector">
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
    <div className="content-stretch flex flex-col items-start relative size-full">
      <Group />
    </div>
  );
}