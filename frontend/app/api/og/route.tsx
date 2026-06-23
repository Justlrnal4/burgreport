import { ImageResponse } from 'next/og';
import { searchWine } from '@/lib/api/burgreport';

// Server-rendered share card. The honesty is baked into the PIXELS (croppable
// chrome is useless once a screenshot leaves the platform): the word ESTIMATE
// next to the number, the source count, the confidence tier (never green), and a
// "verify with merchant" line. A thin/no-price result renders an honest
// "too thin to call" card — never a confident directional figure.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INK = '#0b0b0d';
const SURFACE = '#16151a';
const CREAM = '#f3ead9';
const GOLD = '#c9a44a';
const MUTED = '#9a9488';
const HINT = '#6f6a60';
const LINE = '#2c2a25';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wine = (searchParams.get('wine') || '').trim();
  const vintage = (searchParams.get('vintage') || '').trim();
  const quoted = (searchParams.get('quoted') || '').trim();

  let name = wine || 'BurgReport';
  let chip = 'ESTIMATE';
  let big = 'Grand Cru pricing intelligence';
  let detail = 'Honest, web-sourced estimates for all 34 Grand Cru climats';
  let confidence = '';
  let verdictLine = '';

  if (wine) {
    try {
      const { result } = await searchWine(wine, vintage || undefined, quoted || undefined);
      if (result) {
        name = result.climat.name + (result.vintage ? ` ${result.vintage}` : '');
        const sources = result.defense?.sources.length ?? 0;
        if (result.avgUsd !== null) {
          big = `~$${Math.round(result.avgUsd).toLocaleString()}`;
          detail = sources ? `across ${sources} public listing${sources === 1 ? '' : 's'}` : 'web-sourced estimate';
          confidence = result.quality ? `${result.quality.label} · ${result.quality.confidence} confidence` : '';
          verdictLine = result.verdict ? result.verdict.headline : '';
        } else {
          chip = 'UNAVAILABLE';
          big = 'Too thin to call';
          detail = "We don't put a number on it when sourcing is thin.";
          verdictLine = '';
          confidence = '';
        }
      }
    } catch {
      // fall through to the brand card
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: INK,
          padding: '64px',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '999px', backgroundColor: GOLD, marginRight: '14px' }} />
            <div style={{ display: 'flex', color: CREAM, fontSize: '30px', fontWeight: 700, letterSpacing: '1px' }}>BURG REPORT</div>
          </div>
          <div
            style={{
              display: 'flex',
              border: `2px solid ${GOLD}`,
              color: GOLD,
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '2px',
              padding: '8px 18px',
              borderRadius: '999px'
            }}
          >
            {chip}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: MUTED, fontSize: '34px', marginBottom: '10px' }}>{name}</div>
          <div style={{ display: 'flex', color: CREAM, fontSize: '92px', fontWeight: 800, lineHeight: 1 }}>{big}</div>
          <div style={{ display: 'flex', color: MUTED, fontSize: '30px', marginTop: '18px' }}>{detail}</div>
          {verdictLine ? (
            <div style={{ display: 'flex', color: GOLD, fontSize: '30px', marginTop: '20px', maxWidth: '1000px' }}>{verdictLine}</div>
          ) : null}
          {confidence ? (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                marginTop: '22px',
                border: `1px solid ${GOLD}`,
                color: GOLD,
                fontSize: '22px',
                padding: '6px 16px',
                borderRadius: '999px',
                backgroundColor: SURFACE
              }}
            >
              {confidence}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${LINE}`, paddingTop: '20px' }}>
          <div style={{ display: 'flex', color: HINT, fontSize: '22px' }}>
            Unvalidated estimate parsed from public listings — verify with the merchant. Some fields unavailable.
          </div>
          <div style={{ display: 'flex', color: MUTED, fontSize: '22px', marginTop: '8px' }}>
            burgreport.com · sourced estimate, never fabricated
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
