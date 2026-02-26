"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { BillingCycle, PricingPlan } from "../../data/landing";

interface PricingToggleClientProps {
  pricingPlans: PricingPlan[];
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function PricingToggleClient({ pricingPlans }: PricingToggleClientProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensal");

  const cards = useMemo(
    () =>
      pricingPlans.map((plan) => ({
        ...plan,
        displayPrice: brlFormatter.format(billingCycle === "mensal" ? plan.monthlyPrice : plan.annualPrice),
      })),
    [billingCycle, pricingPlans],
  );

  return (
    <section id="planos" className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-4 md:px-10 md:pb-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#0F0F14] md:text-5xl">Planos</h2>
        <p className="mx-auto mt-3 max-w-[620px] text-base text-[#6B7280]">Uma escada clara: comece simples, evolua quando fizer sentido.</p>

        <div className="mt-6 inline-flex items-center rounded-full border border-[#E5E7EB] bg-white p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("mensal")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${
              billingCycle === "mensal" ? "bg-[#0E9384] text-white" : "text-[#6B7280]"
            }`}
            aria-pressed={billingCycle === "mensal"}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("anual")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${
              billingCycle === "anual" ? "bg-[#0E9384] text-white" : "text-[#6B7280]"
            }`}
            aria-pressed={billingCycle === "anual"}
          >
            Anual (economize até 20%)
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
        {cards.map((plan) => {
          const isPremium = plan.key === "premium";
          const isUnlimited = plan.key === "ilimitado";

          return (
            <article
              key={`plan-${plan.key}`}
              className={`flex h-full flex-col rounded-2xl bg-white p-6 ${
                isPremium
                  ? "border-2 border-[#0E9384] shadow-[0_22px_34px_-22px_rgba(14,147,132,0.55)]"
                  : "border border-[#E8EAED] shadow-[0_12px_22px_-22px_rgba(15,23,42,0.45)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-2xl font-bold text-[#0F0F14]">{plan.name}</h3>
                {isPremium ? (
                  <span className="rounded-full bg-[#0E9384]/10 px-2.5 py-1 text-xs font-semibold text-[#0B7F74]">Mais popular</span>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-[#6B7280]">{plan.headline}</p>

              <div className="mt-5">
                <p className="text-4xl font-black leading-none text-[#0F0F14]">{plan.displayPrice}</p>
                <p className="mt-1 text-sm text-[#6B7280]">/ mês</p>
                {billingCycle === "anual" ? (
                  <>
                    <p className="mt-1 text-xs text-[#6B7280]">({plan.annualHelper})</p>
                    <p className="mt-1 text-xs font-semibold text-[#0b6f65]">{plan.annualSavings}</p>
                  </>
                ) : null}
                {isPremium && plan.helper ? <p className="mt-2 text-xs text-[#6B7280]">{plan.helper}</p> : null}
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.bullets.map((item) => (
                  <li key={`${plan.key}-${item}`} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E9384]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  to={plan.ctaHref}
                  className={`inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${
                    isPremium
                      ? "bg-[#0E9384] text-white hover:bg-[#0B7F74]"
                      : isUnlimited
                        ? "border border-[#0E9384] bg-white text-[#0B7F74] hover:bg-[#F0FDFA]"
                        : "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {plan.cta}
                </Link>
                <p className="mt-3 text-xs text-[#6B7280]">{plan.finePrint}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


