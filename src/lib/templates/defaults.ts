import type { TemplateSection, ColorPalette, FontOption } from "@/lib/types/database";

export function getDefaultSections(category: string): TemplateSection[] {
  const base: TemplateSection[] = [];

  if (category === "invitation" || category === "save-the-date") {
    base.push(
      {
        id: "names",
        type: "names",
        label: "Names",
        layout: {
          x_mm: 10,
          y_mm: 40,
          width_mm: 128,
          max_height_mm: 40,
          alignment: "center",
          vertical_alignment: "center",
        },
        typography: {
          font_key: "heading",
          size_pt: 32,
          weight: 400,
          line_height: 1.3,
          letter_spacing: 0.05,
          color_key: "primary",
          transform: "none",
        },
        content: {
          default_text: "Emily & James",
          editable: true,
          max_length: 60,
          multiline: false,
          max_lines: 1,
          help_text: "Enter both names as you'd like them to appear",
        },
      },
      {
        id: "invitation_line",
        type: "invitation_line",
        label: "Invitation Line",
        layout: {
          x_mm: 10,
          y_mm: 85,
          width_mm: 128,
          max_height_mm: 20,
          alignment: "center",
          vertical_alignment: "center",
        },
        typography: {
          font_key: "body",
          size_pt: 12,
          weight: 300,
          line_height: 1.6,
          letter_spacing: 0.02,
          color_key: "secondary",
          transform: "none",
        },
        content: {
          default_text: "request the pleasure of your company\nat the celebration of their marriage",
          editable: true,
          max_length: 150,
          multiline: true,
          max_lines: 3,
          help_text: "The invitation wording",
        },
      },
      {
        id: "details",
        type: "details",
        label: "Event Details",
        layout: {
          x_mm: 10,
          y_mm: 120,
          width_mm: 128,
          max_height_mm: 50,
          alignment: "center",
          vertical_alignment: "top",
        },
        typography: {
          font_key: "body",
          size_pt: 11,
          weight: 400,
          line_height: 1.8,
          letter_spacing: 0.01,
          color_key: "primary",
          transform: "none",
        },
        content: {
          default_text: "Saturday, the Twenty-First of June\nTwo Thousand and Twenty-Six\nat Four O'Clock in the Afternoon\n\nThe Manor House, Kent",
          editable: true,
          max_length: 300,
          multiline: true,
          max_lines: 6,
          help_text: "Date, time, and venue details",
        },
      }
    );
  }

  if (category === "invitation") {
    base.push({
      id: "schedule",
      type: "schedule",
      label: "Schedule / Timeline",
      layout: {
        x_mm: 10,
        y_mm: 175,
        width_mm: 128,
        max_height_mm: 30,
        alignment: "center",
        vertical_alignment: "top",
      },
      typography: {
        font_key: "body",
        size_pt: 9,
        weight: 300,
        line_height: 1.8,
        letter_spacing: 0.02,
        color_key: "secondary",
        transform: "uppercase",
      },
      content: {
        default_text: "Ceremony 4:00pm  |  Drinks Reception 5:00pm  |  Wedding Breakfast 6:30pm",
        editable: true,
        max_length: 200,
        multiline: true,
        max_lines: 3,
        help_text: "Timeline of events for the day",
      },
    });
  }

  if (category === "thank-you") {
    base.push(
      {
        id: "names",
        type: "names",
        label: "Names",
        layout: {
          x_mm: 10,
          y_mm: 30,
          width_mm: 85,
          max_height_mm: 30,
          alignment: "center",
          vertical_alignment: "center",
        },
        typography: {
          font_key: "heading",
          size_pt: 24,
          weight: 400,
          line_height: 1.3,
          letter_spacing: 0.05,
          color_key: "primary",
          transform: "none",
        },
        content: {
          default_text: "Emily & James",
          editable: true,
          max_length: 60,
          multiline: false,
          max_lines: 1,
        },
      },
      {
        id: "details",
        type: "details",
        label: "Thank You Message",
        layout: {
          x_mm: 10,
          y_mm: 65,
          width_mm: 85,
          max_height_mm: 60,
          alignment: "center",
          vertical_alignment: "top",
        },
        typography: {
          font_key: "body",
          size_pt: 10,
          weight: 300,
          line_height: 1.8,
          letter_spacing: 0.01,
          color_key: "primary",
          transform: "none",
        },
        content: {
          default_text: "Thank you so much for sharing\nour special day with us.\nYour love and support\nmean the world.",
          editable: true,
          max_length: 300,
          multiline: true,
          max_lines: 8,
          help_text: "Your thank you message",
        },
      }
    );
  }

  if (category === "on-the-day") {
    base.push(
      {
        id: "names",
        type: "names",
        label: "Title",
        layout: {
          x_mm: 10,
          y_mm: 20,
          width_mm: 128,
          max_height_mm: 25,
          alignment: "center",
          vertical_alignment: "center",
        },
        typography: {
          font_key: "heading",
          size_pt: 20,
          weight: 400,
          line_height: 1.3,
          letter_spacing: 0.1,
          color_key: "primary",
          transform: "uppercase",
        },
        content: {
          default_text: "Order of the Day",
          editable: true,
          max_length: 40,
          multiline: false,
          max_lines: 1,
        },
      },
      {
        id: "details",
        type: "details",
        label: "Content",
        layout: {
          x_mm: 10,
          y_mm: 55,
          width_mm: 128,
          max_height_mm: 140,
          alignment: "center",
          vertical_alignment: "top",
        },
        typography: {
          font_key: "body",
          size_pt: 10,
          weight: 400,
          line_height: 2,
          letter_spacing: 0.01,
          color_key: "primary",
          transform: "none",
        },
        content: {
          default_text: "2:00pm  Ceremony\n3:00pm  Drinks Reception\n5:00pm  Wedding Breakfast\n7:30pm  First Dance\n8:00pm  Evening Reception",
          editable: true,
          max_length: 500,
          multiline: true,
          max_lines: 15,
          help_text: "Add your timeline or menu items",
        },
      }
    );
  }

  return base;
}

export const defaultColorPalettes: ColorPalette[] = [
  {
    id: "sage-classic",
    name: "Sage Classic",
    colors: {
      primary: "#1a1a1a",
      secondary: "#6b7280",
      accent: "#a3b18a",
      background: "#fafafa",
    },
  },
  {
    id: "blush-romance",
    name: "Blush Romance",
    colors: {
      primary: "#1a1a1a",
      secondary: "#8b7355",
      accent: "#e8cfc0",
      background: "#fdf8f5",
    },
  },
  {
    id: "dusty-blue",
    name: "Dusty Blue",
    colors: {
      primary: "#1a1a1a",
      secondary: "#4a6274",
      accent: "#8eaec2",
      background: "#f5f8fa",
    },
  },
];

export const defaultFontOptions: FontOption[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    fonts: {
      heading: { family: "Playfair Display", weight: 400 },
      body: { family: "Nunito", weight: 300 },
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    fonts: {
      heading: { family: "Figtree", weight: 500 },
      body: { family: "Nunito", weight: 400 },
    },
  },
  {
    id: "elegant-script",
    name: "Elegant Script",
    fonts: {
      heading: { family: "Great Vibes", weight: 400 },
      body: { family: "Cormorant Garamond", weight: 300 },
    },
  },
];
