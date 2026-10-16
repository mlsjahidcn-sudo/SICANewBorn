import { describe, it, expect } from 'vitest';
import {
  buildItemListSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildContactPageSchema,
} from '../catalog-schema';
import { buildPageOpenGraph } from '../page-opengraph';

describe('catalog structured data', () => {
  describe('buildItemListSchema', () => {
    it('numbers items from 1 and preserves order', () => {
      const schema = buildItemListSchema('Test', [
        { name: 'A', url: '/a' },
        { name: 'B', url: '/b' },
      ]) as { itemListElement: Array<{ position: number; name: string }> };
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[1].name).toBe('B');
    });

    it('declares the true count, not a padded one', () => {
      const schema = buildItemListSchema('Test', [
        { name: 'A', url: '/a' },
      ]) as { numberOfItems: number; itemListElement: unknown[] };
      expect(schema.numberOfItems).toBe(1);
      expect(schema.itemListElement).toHaveLength(1);
    });

    it('emits an empty list rather than throwing on no data', () => {
      const schema = buildItemListSchema('Test', []) as {
        numberOfItems: number;
        itemListElement: unknown[];
      };
      expect(schema.numberOfItems).toBe(0);
      expect(schema.itemListElement).toEqual([]);
    });
  });

  describe('buildBreadcrumbSchema', () => {
    it('always puts Home first', () => {
      const schema = buildBreadcrumbSchema([
        { name: 'Programs', path: '/programs' },
      ]) as { itemListElement: Array<{ position: number; name: string }> };
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[0].position).toBe(1);
    });

    it('offsets segment positions after Home', () => {
      const schema = buildBreadcrumbSchema([
        { name: 'Universities', path: '/universities' },
        { name: 'Compare', path: '/universities/compare' },
      ]) as { itemListElement: Array<{ position: number; name: string }> };
      expect(schema.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    });
  });

  describe('buildServiceSchema', () => {
    it('omits areaServed when not supplied rather than guessing one', () => {
      const schema = buildServiceSchema({
        name: 'Assessment',
        description: 'Free review',
        url: '/assessment',
      });
      expect('areaServed' in schema).toBe(false);
    });

    it('includes areaServed only when given', () => {
      const schema = buildServiceSchema({
        name: 'Assessment',
        description: 'Free review',
        url: '/assessment',
        areaServed: ['CN'],
      });
      expect(schema.areaServed).toEqual(['CN']);
    });
  });

  describe('buildContactPageSchema', () => {
    it('emits only the channels actually supplied', () => {
      const schema = buildContactPageSchema({ email: 'a@b.com' });
      const point = (schema.mainEntity as { contactPoint: Record<string, unknown> })
        .contactPoint;
      expect(point.email).toBe('a@b.com');
      expect('telephone' in point).toBe(false);
    });

    it('never emits a review aggregate', () => {
      const schema = buildContactPageSchema({ email: 'a@b.com' });
      expect(JSON.stringify(schema)).not.toContain('aggregateRating');
    });
  });
});

describe('buildPageOpenGraph', () => {
  it('uses the page title rather than the site default', () => {
    const { openGraph } = buildPageOpenGraph({
      title: 'Programs in China | SICA',
      description: 'Study programs',
      path: '/programs',
    });
    expect(openGraph.title).toBe('Programs in China | SICA');
  });

  it('always supplies an image so scrapers do not drop the card', () => {
    const { openGraph, twitter } = buildPageOpenGraph({
      title: 'T',
      description: 'D',
      path: '/x',
    });
    expect(Array.isArray(openGraph.images) ? openGraph.images.length : 0).toBe(1);
    expect((twitter as { card?: string }).card).toBe('summary_large_image');
  });

  it('carries a real absolute URL for the page', () => {
    const { openGraph } = buildPageOpenGraph({
      title: 'T',
      description: 'D',
      path: '/programs',
    });
    expect(String(openGraph.url)).toContain('/programs');
  });
});
