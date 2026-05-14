import imgRectangle9 from "./267b0fda7e9f7d742c4a00c6b1a8deb61ca5b451.png";
import imgRectangle8 from "./00036cc0621be1e4958c94e1cc11ef5af9af068d.png";
import imgRectangle7 from "./c1a7dafe8ae0e2ad6349e7b2faed906a1fa9510b.png";

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start leading-[normal] not-italic relative shrink-0 text-black w-[310px]">
      <p className="font-['Metropolis:Semi_Bold',sans-serif] relative shrink-0 text-[59px] text-center w-full">Tácio Ladeia</p>
      <p className="font-['Rounded_Elegance:Regular',sans-serif] relative shrink-0 text-[25px] text-justify w-full">Fundador da Mascatis e Administrador pela FGV, atua como conselheiro de estruturação e crescimento empresarial. Sua metodologia une técnica de alta performance a princípios cristãos inegociáveis, transformando gestão complexa em resultados sólidos, pautados pela integridade e pelo crescimento sustentável.</p>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-center justify-center px-[80px] relative size-full">
      <Frame />
      <div className="absolute h-[320px] left-[-66px] top-[14px] w-[214px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[218.52%] left-[-52.79%] max-w-none top-[-75.67%] w-[183.62%]" src={imgRectangle9} />
        </div>
      </div>
      <div className="absolute h-[246px] left-[201px] top-[211px] w-[172px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-3.86%] max-w-none top-0 w-[107.73%]" src={imgRectangle8} />
        </div>
      </div>
      <div className="absolute h-[629px] left-[46px] top-[1053px] w-[310px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[138.08%] left-[-112.74%] max-w-none top-[-10.23%] w-[280.16%]" src={imgRectangle7} />
        </div>
      </div>
    </div>
  );
}