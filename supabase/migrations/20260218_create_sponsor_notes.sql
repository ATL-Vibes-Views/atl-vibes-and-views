-- Phase 3B: Create sponsor_notes table for log threads
CREATE TABLE IF NOT EXISTS public.sponsor_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
    note_type text NOT NULL DEFAULT 'internal',
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT sponsor_notes_note_type_check
       CHECK (note_type = ANY (ARRAY['talking_point_log'::text, 'internal_note_log'::text]))
);

CREATE INDEX IF NOT EXISTS sponsor_notes_sponsor_id_idx ON public.sponsor_notes(sponsor_id);
CREATE INDEX IF NOT EXISTS sponsor_notes_type_idx ON public.sponsor_notes(note_type);
