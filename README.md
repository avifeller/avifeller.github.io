# Avi Feller's website

Static website for [www.avifeller.com](https://www.avifeller.com), served by GitHub Pages from the root of `main`.

The editable Quarto source is maintained separately in the `academic-website` project. Make content and theme changes there, then render with `quarto render`. For a full refresh, move any previous `_site/` output outside the source project before rendering, and copy only the fresh `_site/` output into this repository. Reconcile removed files as well as new files so old assets do not accumulate. Preserve `CNAME`, `.nojekyll`, this README, and repository configuration. Avoid editing generated HTML directly.

Before pushing, preview Home, Bio, Research, Software, and Teaching; check the navigation, research search and topic filters, abstract controls, internal links, and CV download. Remove obsolete fingerprinted stylesheets only after confirming that no page references them. Keep local tag-review pages and CSV exports out of the deployment.

`cv.pdf` is the stable link to the current CV and should match the latest dated PDF. Only the current dated PDF is deployed. Retired CVs and unlinked paper copies remain recoverable from Git history; the original documents live outside this deployment repository.

Research search and topic filters run locally in the browser using the rendered citations, abstracts, and tags. The Quarto source keeps assignments in `research-tags.json`, renders them with `research-layout.lua`, and loads `research-filters.js`. Top filters are ordered by total paper count within Methods and Applications, with alphabetical ties; their positions stay fixed while filtering. Deploy the generated script with the page. Navigation search is disabled throughout the site, so `search.json` and `quarto-search` assets are no longer used; exclude the unused index even if Quarto generates it.
