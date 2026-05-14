import imgSessao2 from "./8a8bd59a44930d41bcd3c5fcf2ccc9eefa5bb2a9.png";

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[24px] text-white w-full">VSE — VENDA SEM ESFORÇO</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[55px] text-white w-[373px]">SEQUOIA</p>
      <div className="font-['Metropolis:Extra_Light_Italic',sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[333px]">
        <p className="leading-[1.1] mb-0">Empresas fortes se conectam aos parceiros certos.</p>
        <ul className="list-disc mb-0">
          <li className="mb-0 ms-[36px]">
            <span className="leading-[1.1]">Jurídico</span>
          </li>
          <li className="mb-0 ms-[36px]">
            <span className="leading-[1.1]">Contábil</span>
          </li>
          <li className="mb-0 ms-[36px]">
            <span className="leading-[1.1]">Financeiro</span>
          </li>
          <li className="ms-[36px]">
            <span className="leading-[1.1]">Especialistas estratégicos</span>
          </li>
        </ul>
        <p className="leading-[1.1]">Estrutura sólida sustenta crescimento no longo prazo.</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[24px] text-white w-full">AGÊNCIA</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[24px] text-white w-full">EDUCAÇÃO</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[24px] text-white w-full">PARCEIROS</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[11px] pl-[29px] pr-[80px] relative shrink-0 w-[402px]">
      <div aria-hidden="true" className="absolute border-b border-solid border-white inset-0 pointer-events-none" />
      <p className="font-['Metropolis:Semi_Bold_Italic',sans-serif] leading-[1.1] not-italic relative shrink-0 text-[24px] text-white w-full">PRM</p>
    </div>
  );
}

function AcordeaoScroll() {
  return (
    <div className="backdrop-blur-[163.85px] bg-[rgba(58,58,58,0.31)] content-stretch flex flex-col gap-[27px] h-[1025px] items-center justify-center overflow-clip px-[37px] py-[123px] relative shrink-0 w-[402px]" data-name="Acordeao scroll">
      <Frame1 />
      <Frame />
      <Frame2 />
      <Frame3 />
      <Frame4 />
      <Frame5 />
      <p className="font-['Metropolis:Regular_Italic',sans-serif] leading-[0] not-italic relative shrink-0 text-[0px] text-center text-white w-[308px]">
        <span className="leading-[normal] text-[31px]">{`Sequoias não correm atrás da luz. `}</span>
        <span className="font-['Metropolis:Bold_Italic',sans-serif] leading-[normal] text-[31px]">Crescem até ela</span>
      </p>
    </div>
  );
}

export default function Sessao() {
  return (
    <div className="content-stretch flex flex-col items-center justify-end relative size-full" data-name="sessao 2">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-white inset-0" />
        <div className="absolute inset-0 overflow-hidden">
          <img alt="" className="absolute h-[105.17%] left-[-21.83%] max-w-none top-[-2.58%] w-[554.1%]" src={imgSessao2} />
        </div>
      </div>
      <AcordeaoScroll />
    </div>
  );
}