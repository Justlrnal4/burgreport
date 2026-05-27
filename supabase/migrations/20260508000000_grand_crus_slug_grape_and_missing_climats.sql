-- Add slug and grape columns to grand_crus (additive, non-breaking)
-- Backfills from existing data and adds two missing climats from reference_data.py.

ALTER TABLE public.grand_crus ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.grand_crus ADD COLUMN IF NOT EXISTS grape text;

-- Existing IDs are already slug-format (e.g. la-romanee-conti); copy id -> slug.
UPDATE public.grand_crus SET slug = id WHERE slug IS NULL;

-- Burgundy convention: Red = Pinot Noir, White = Chardonnay.
UPDATE public.grand_crus
SET grape = CASE WHEN color = 'White' THEN 'Chardonnay' ELSE 'Pinot Noir' END
WHERE grape IS NULL;

-- Two climats referenced in code (services/reference_data.py) but missing in live DB.
INSERT INTO public.grand_crus (id, slug, name, aoc, village, cote, color, grape, size_ha, is_monopole)
VALUES
  ('mazoyeres-chambertin', 'mazoyeres-chambertin', 'Mazoyères-Chambertin', 'Mazoyères-Chambertin Grand Cru', 'Gevrey-Chambertin', 'Côte de Nuits', 'Red', 'Pinot Noir', 1.8, false),
  ('musigny-blanc', 'musigny-blanc', 'Musigny Blanc', 'Musigny Grand Cru', 'Chambolle-Musigny', 'Côte de Nuits', 'White', 'Chardonnay', 0.65, false)
ON CONFLICT (id) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grand_crus_slug ON public.grand_crus(slug);

ALTER TABLE public.grand_crus ALTER COLUMN slug SET NOT NULL;
