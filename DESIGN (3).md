---
name: Proov Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#c9dbf9'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d3e3ff'
  on-surface: '#091c32'
  on-surface-variant: '#484555'
  inverse-surface: '#203148'
  inverse-on-surface: '#ebf1ff'
  outline: '#797587'
  outline-variant: '#c9c4d8'
  surface-tint: '#5d3fe0'
  primary: '#5b3cdd'
  on-primary: '#ffffff'
  primary-container: '#7459f7'
  on-primary-container: '#fffbff'
  inverse-primary: '#c9bfff'
  secondary: '#655784'
  on-secondary: '#ffffff'
  secondary-container: '#dac9fd'
  on-secondary-container: '#60537f'
  tertiary: '#a43700'
  on-tertiary: '#ffffff'
  tertiary-container: '#ce4700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1a0063'
  on-primary-fixed-variant: '#441cc8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#cfbef2'
  on-secondary-fixed: '#20143c'
  on-secondary-fixed-variant: '#4d406b'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802900'
  background: '#f8f9ff'
  on-background: '#091c32'
  surface-variant: '#d3e3ff'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  subheading:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  button:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  mono-accent:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  display-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system embodies an **AI-native, approachable, and operational** personality designed specifically for the modern manufacturing sector. The visual narrative balances high-tech precision with a human-centric touch, avoiding the cold sterility often found in industrial software.

The style is **Modern Corporate with Soft Organic Geometry**. It leverages heavy whitespace and a "Cool Slate" canvas to create a calm, focused environment. The brand voice is intentionally **Clear, Confident, Human, and Operational**, translating complex logistics into actionable, simple interactions. Key visual identifiers include "bulbous" organic shapes that feel friendly and safe, contrasted against high-precision typography that denotes authority and reliability.

## Colors

The palette is anchored by **Primary Lavender**, used for core actions and brand moments, providing a vibrant but professional energy. **Slate Blue (#50617A)** serves as the primary neutral, providing a more balanced and professional alternative to harsh blacks, while **Operational Orange** is used sparingly as a tertiary accent to highlight critical alerts and operational status changes.

- **Primary Lavender (#7B61FF):** Primary buttons, active states, and brand symbols.
- **Soft Lilac (#DCCBFF):** Subtle backgrounds, secondary buttons, and tonal accents.
- **Slate Blue (#50617A):** Headlines, body text, and primary UI borders.
- **Operational Orange (#FF6118):** High-priority alerts, critical status badges, and tertiary calls to action.
- **Neutral Gray:** Disabled states, dividers, and secondary iconography.

## Typography

The typography system uses a unified font approach to create a cohesive brand character. **Hanken Grotesk** is used across all layers of the UI—from large display headings to body text and labels—ensuring a geometric and modern personality throughout. 

By standardizing on a single typeface, the system reinforces clarity and brand recognition. Technical data and status indicators, which previously used a monospaced font, now use Hanken Grotesk to maintain the "approachable" feel while relying on weight and case for distinction. All headings should use a slight negative letter-spacing to maintain a tight, professional appearance.

## Layout & Spacing

The design system utilizes a **comfortable density** model based on a **4px grid unit**. This ensures that while the data is organized, the UI never feels cramped or overwhelming. 

The layout follows a **Fluid Grid** philosophy for dashboards, typically using a 12-column system on desktop with 24px gutters. For internal content containers, use generous padding (32px) to maintain the "airy" brand feel. On mobile, margins reduce to 16px while maintaining the base 4px vertical rhythm.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than traditional heavy shadows. Surfaces are stacked using color shifts between the background and container surfaces.

Where depth is required for interactive components (like modals or floating menus), use **Ambient Shadows**: extra-diffused, low-opacity shadows with a slight Lavender tint (#7B61FF at 8-12% opacity). This maintains the "soft" brand aesthetic while providing clear functional elevation. Ghost borders (1px solid #50617A at low opacity) are preferred over shadows for standard card containers.

## Shapes

The shape language is the primary driver of the "Approachable" brand value. It utilizes **Organic Bulbous Rounding** that varies by scale:

- **Large Containers/Cards:** 24px to 32px corner radius.
- **Standard UI Components (Inputs, Small Cards):** 12px to 18px corner radius.
- **Interactive Elements (Buttons, Chips):** Fully rounded/Pill-shaped (100px) to signify "squishy" interactivity.

This progression of roundedness creates a friendly, accessible interface that feels safe to interact with.

## Components

### Buttons
- **Primary:** Primary Lavender background with white text. Pill-shaped. Include an arrow icon in the label for directional actions (e.g., "Get a Quote →").
- **Secondary:** Soft Lilac background with Slate Blue text. Pill-shaped.
- **Tertiary/Alert:** Operational Orange background with white text. Used for high-urgency actions.
- **Ghost:** No background, Slate Blue text with a 1px Slate Blue border.

### Input Fields
- Use subtle background containers with 14px rounded corners.
- Labels should be in Hanken Grotesk (Caption style), positioned above the field.
- Active states use a 2px Primary Lavender border.

### Cards & Containers
- Main dashboard cards use 24px-32px rounding.
- Backgrounds should be White or subtle surface variations.
- Use Hanken Grotesk labels in the top right for "Status" or "ID" indicators; use Operational Orange for "Critical" statuses.

### Progress Indicators
- Use thick, rounded bars (12px height).
- Background: Neutral Slate variants. Fill: Primary Lavender.
- Display percentage as a caption-style label.

### Data Tables
- Minimalist approach with no vertical lines.
- Use Slate Blue for primary data and a lighter tint for secondary metadata.
- Rows should have generous vertical padding (16px).