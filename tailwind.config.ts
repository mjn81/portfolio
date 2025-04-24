import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "var(--tw-prose-body)",
            a: {
              color: "var(--tw-prose-links)",
              textDecoration: "underline",
              textDecorationColor: "var(--tw-prose-links/30)",
              fontWeight: "500",
              "&:hover": {
                textDecorationColor: "var(--tw-prose-links)",
              },
            },
            h1: {
              color: "var(--tw-prose-headings)",
              fontWeight: "700",
              fontSize: theme("fontSize.3xl")[0],
              marginTop: "2em",
              marginBottom: "1em",
            },
            h2: {
              color: "var(--tw-prose-headings)",
              fontWeight: "600",
              fontSize: theme("fontSize.2xl")[0],
              marginTop: "1.75em",
              marginBottom: "0.75em",
            },
            h3: {
              color: "var(--tw-prose-headings)",
              fontSize: theme("fontSize.xl")[0],
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            code: {
              color: "var(--tw-prose-code)",
              backgroundColor: "var(--tw-prose-code-bg)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25em",
              fontWeight: "500",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            blockquote: {
              color: "var(--tw-prose-quotes)",
              borderLeftColor: "var(--tw-prose-quote-borders)",
              fontStyle: "italic",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": theme("colors.foreground"),
            "--tw-prose-headings": theme("colors.foreground"),
            "--tw-prose-links": theme("colors.primary.DEFAULT"),
            "--tw-prose-code": theme("colors.primary.DEFAULT"),
            "--tw-prose-code-bg": theme("colors.primary.DEFAULT/0.1"),
            "--tw-prose-quotes": theme("colors.foreground/70"),
            "--tw-prose-quote-borders": theme("colors.primary.DEFAULT/30"),
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}

export default config
