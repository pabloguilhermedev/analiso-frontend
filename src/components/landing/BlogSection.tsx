import { Link } from "react-router-dom";

export function BlogSection() {
  return (
    <section id="blog" className="mx-auto w-full max-w-[1200px] px-5 pb-6 pt-2 md:px-10">
      <div className="rounded-2xl border border-[#E8EAED] bg-white p-6 text-center md:p-8">
        <h2 className="text-2xl font-bold text-[#0F0F14] md:text-3xl">Conteúdo para investir melhor</h2>
        <p className="mx-auto mt-3 max-w-[620px] text-sm leading-[1.6] text-[#6B7280] md:text-base">
          Guias práticos sobre análise fundamentalista, leitura de indicadores e uso de dados oficiais.
        </p>
        <Link
          to="/blog"
          className="mt-5 inline-flex rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
        >
          Ver artigos
        </Link>
      </div>
    </section>
  );
}


