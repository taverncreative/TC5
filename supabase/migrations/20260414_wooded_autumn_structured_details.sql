-- Wooded Autumn: replace single "details" section with 4 structured sub-sections
-- This only affects the wooded-autumn template. Other templates are untouched.

UPDATE public.templates
SET sections = (
  -- Keep all sections EXCEPT "details", then append the 4 new sections
  SELECT jsonb_agg(s)
  FROM (
    -- Existing sections minus "details"
    SELECT s
    FROM jsonb_array_elements(sections) AS s
    WHERE s->>'id' != 'details'

    UNION ALL

    -- New: event_wording (sort 30)
    SELECT '{
      "id": "event_wording",
      "type": "event_wording",
      "label": "Invitation Wording",
      "layout": {
        "x_mm": 15,
        "y_mm": 5,
        "width_mm": 97,
        "max_height_mm": 25,
        "gap_after_mm": 1,
        "alignment": "center",
        "sort_order": 30
      },
      "typography": {
        "font_key": "body",
        "size_pt": 7,
        "weight": 600,
        "line_height": 2.5,
        "letter_spacing": 0.12,
        "color_key": "primary",
        "transform": "uppercase"
      },
      "content": {
        "default_text": "REQUEST THE PLEASURE OF YOUR COMPANY\nTO CELEBRATE THEIR MARRIAGE\nAT AN EVENING RECEPTION",
        "required": false,
        "max_length": 200,
        "multiline": true,
        "max_lines": 4,
        "word_wrap": false,
        "help_text": "Wording above the date and venue (optional)"
      }
    }'::jsonb

    UNION ALL

    -- New: event_date (sort 31)
    SELECT '{
      "id": "event_date",
      "type": "event_date",
      "label": "Date",
      "layout": {
        "x_mm": 15,
        "y_mm": 0,
        "width_mm": 97,
        "max_height_mm": 10,
        "gap_after_mm": 1,
        "alignment": "center",
        "sort_order": 31
      },
      "typography": {
        "font_key": "body",
        "size_pt": 7,
        "weight": 600,
        "line_height": 2.5,
        "letter_spacing": 0.12,
        "color_key": "primary",
        "transform": "uppercase"
      },
      "content": {
        "default_text": "SATURDAY 21ST SEPTEMBER 2029",
        "required": true,
        "max_length": 60,
        "multiline": false,
        "max_lines": 1,
        "word_wrap": false,
        "help_text": "Pick your wedding date"
      }
    }'::jsonb

    UNION ALL

    -- New: event_time (sort 32)
    SELECT '{
      "id": "event_time",
      "type": "event_time",
      "label": "Time",
      "layout": {
        "x_mm": 15,
        "y_mm": 0,
        "width_mm": 97,
        "max_height_mm": 10,
        "gap_after_mm": 1,
        "alignment": "center",
        "sort_order": 32
      },
      "typography": {
        "font_key": "body",
        "size_pt": 7,
        "weight": 600,
        "line_height": 2.5,
        "letter_spacing": 0.12,
        "color_key": "primary",
        "transform": "uppercase"
      },
      "content": {
        "default_text": "AT 7PM",
        "required": false,
        "max_length": 30,
        "multiline": false,
        "max_lines": 1,
        "word_wrap": false,
        "help_text": "e.g. AT 7PM, FROM 2PM"
      }
    }'::jsonb

    UNION ALL

    -- New: event_venue (sort 33)
    SELECT '{
      "id": "event_venue",
      "type": "event_venue",
      "label": "Venue",
      "layout": {
        "x_mm": 15,
        "y_mm": 0,
        "width_mm": 97,
        "max_height_mm": 20,
        "gap_after_mm": 0,
        "alignment": "center",
        "sort_order": 33
      },
      "typography": {
        "font_key": "body",
        "size_pt": 7,
        "weight": 600,
        "line_height": 2.5,
        "letter_spacing": 0.12,
        "color_key": "primary",
        "transform": "uppercase"
      },
      "content": {
        "default_text": "TAVERN MANOR\nASHFORD, KENT, TN24 8TC",
        "required": true,
        "max_length": 150,
        "multiline": true,
        "max_lines": 3,
        "word_wrap": false,
        "help_text": "Venue name and address"
      }
    }'::jsonb
  ) AS sub(s)
),
updated_at = now()
WHERE slug = 'wooded-autumn';
