'use client';

const moduler = [
  {
    id: 1,
    navn: 'Kjerne-modul Alpha',
    pris: '50 000,-',
    beskrivelse: 'Komplett system for enterprise-håndtering.',
  },
  {
    id: 2,
    navn: 'Sikkerhets-node Beta',
    pris: '75 000,-',
    beskrivelse: 'Avansert kryptering og tilgangskontroll.',
  },
];

export function EnterpriseModuleGrid() {
  const bookSamtale = (navn: string) => {
    window.alert(`Du har valgt å booke en 1:1 samtale om: ${navn}. Vi kontakter deg for å avtale tidspunkt.`);
  };

  const betalVipps = (id: number) => {
    // Placeholder for Vipps backend integration.
    // eslint-disable-next-line no-console
    console.log(`Initialiserer Vipps-betaling for modul-ID: ${id}`);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {moduler.map((modul) => (
        <article
          key={modul.id}
          className="rounded-lg border border-[#6f2b1f] bg-gradient-to-br from-[#121212] via-[#2a201a] to-[#4e3528] p-5 text-[#f0e6d2] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
        >
          <h3 className="text-xl font-semibold text-[#d9b574]">{modul.navn}</h3>
          <p className="mt-2 text-sm text-[#e3d6bc]">{modul.beskrivelse}</p>
          <p className="mt-3 text-sm font-bold text-[#f0e6d2]">Pris: {modul.pris}</p>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => bookSamtale(modul.navn)}
              className="w-full rounded-md border border-[#d9b574]/50 bg-[#1c1c1c] px-4 py-2 text-sm font-semibold text-[#f7f1e4] transition hover:bg-[#272727]"
            >
              Book 1:1 Samtale
            </button>
            <button
              type="button"
              onClick={() => betalVipps(modul.id)}
              className="w-full rounded-md bg-[#6f2b1f] px-4 py-2 text-sm font-bold text-[#f7f1e4] transition hover:bg-[#8c3a2a]"
            >
              Betal med Vipps
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
