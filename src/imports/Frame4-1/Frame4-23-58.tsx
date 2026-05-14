import svgPaths from "./svg-hyvm8whoze";
import imgFundo2 from "./7043883636bed05655a6c4c2dfccf2a51368bd79.png";
import imgArvore1 from "./1157fca2f0edad10e429dc5595004b239f1de787.png";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[1273px] ml-0 mt-[67px] relative row-1 w-[1440px]" data-name="fundo2">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[156.49%] left-[-28.21%] max-w-none top-[-56.48%] w-[156.41%]" src={imgFundo2} />
        </div>
      </div>
      <div className="col-1 h-[1406px] ml-[307px] mt-0 relative row-1 w-[826px]" data-name="arvore1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[144.87%] left-[-78.55%] max-w-none top-[-43.59%] w-[279.36%]" src={imgArvore1} />
        </div>
      </div>
      <div className="col-1 h-[173px] ml-[552px] mt-[769px] relative row-1 w-[336px]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 336 173">
          <g id="Vector">
            <path d={svgPaths.p16e7900} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1508f980} fill="var(--fill-0, white)" />
            <path d={svgPaths.p32108300} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3c4d5500} fill="var(--fill-0, white)" />
            <path d={svgPaths.p37a08900} fill="var(--fill-0, white)" />
            <path d={svgPaths.p22f3e000} fill="var(--fill-0, white)" />
            <path d={svgPaths.p355a500} fill="var(--fill-0, white)" />
            <path d={svgPaths.p26dd15c0} fill="var(--fill-0, white)" />
            <path d={svgPaths.pc9df240} fill="var(--fill-0, white)" />
            <path d={svgPaths.p282cf700} fill="var(--fill-0, white)" />
            <path d={svgPaths.p25d23b00} fill="var(--fill-0, white)" />
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