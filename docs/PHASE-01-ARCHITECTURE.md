# KuAKuA — Website Architecture / Phase 01

Status: proposed architecture; implementation pending visual review.
Primary visual reference: https://wangshuo.design/about/ (study hierarchy, whitespace, typography, navigation; do not copy assets or code).
Secondary references: https://www.zhaomengjia.com/works (index); https://www.zhaomengjia.com/works/biophilia (detail); https://xiaoyueshen.com/ (editorial rhythm); https://boningyu.cargo.site/ (mixed media); https://sasasa.com/ (fog interactions).

## Information architecture

- Home / : full-viewport photography and interactive fog; manually switched hero photos, no autoplay. Scroll to Works.
- Works /#work or existing route: All / Graphic / Motion / Photography / Experimental; clean ordered index with cover, title, year and category.
- Project Detail: one reusable project template driven by project data; heading, intro, flexible image/video/text blocks, next project, back to Works.
- About: identity, practice, approach, experience (only if supplied), contact.

Preserve existing working routes until tested. No route rewrites solely for aesthetics.

## Navigation

Single shared header: KuAKuA (home), Works, About. Works filters are secondary navigation, not top-level routes. Mobile navigation stays accessible. Keyboard focus states required.

## Visual tokens (proposed, adjust after preview)

- Typeface: Outfit for Latin; Noto Sans SC for Chinese; load only with permitted licensing.
- Base colors: #FFFFFF background, #171717 text, #777777 metadata.
- Desktop content max-width: 1440px; side gutters clamp(20px, 5vw, 96px).
- Spacing scale: 8 / 16 / 24 / 40 / 64 / 96 px.
- Navigation: 13–15px; metadata: 12–13px; work titles: 16–20px; detail headings: 32–48px.
- Works: consistent 2-column desktop grid, 1-column mobile; aligned captions; cover stage can use object-fit: contain to avoid cropping artwork; no arbitrary nth-child offsets.
- Detail: 12-column conceptual grid, responsive full / pair / triple / text-media blocks; preserve original image aspect ratios.
- No card shadows, excessive radii, decorative borders or gratuitous animations.

## Data model boundary

Keep site settings separate from project records and content blocks. Existing data/site.js and data/projects.js should remain canonical until CMS integration. Future Sanity migration must not be a prerequisite for phase 01.

## Implementation sequence

1. Audit existing routes, components, assets and responsive behavior.
2. Define global typography, spacing, header, footer, metadata components.
3. Normalize Works index layout and filter behavior.
4. Normalize About hierarchy without inventing personal details.
5. Apply shared shell to Project Detail, without redesigning media composition yet.
6. Test mobile, keyboard, asset paths, fog interaction and build.
7. Preview on dev branch. Do not merge to main or deploy production without approval.

## Non-goals

No CMS, no Hero redesign, no content deletion, no media replacement, no main-branch deployment.

## Acceptance criteria

- Same header and typographic hierarchy across Home, Works, Detail, About.
- Works covers/captions align consistently across mixed aspect ratios.
- All category filters and existing project links still work.
- Existing fog, photos, videos and project descriptions remain intact.
- Responsive at phone, tablet and desktop widths.
- Development preview approved before production release.
