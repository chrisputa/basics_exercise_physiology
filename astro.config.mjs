import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import siteConfig from './src/data/site-config';
import generateDarkImages from './src/integrations/generate-dark-images';


import react from '@astrojs/react';

// Prepends a Promise.try polyfill to the built PDF.js worker file.
// pdfjs-dist v5 uses Promise.try internally (ES2025), which is absent in
// Chrome < 134. Adding it directly to the built
// file is the most reliable fix – no wrapper files, no runtime indirection.
const pdfWorkerPolyfill = {
    name: 'pdf-worker-promise-try-polyfill',
    generateBundle(_options, bundle) {
        const polyfill =
            'if(typeof Promise.try==="undefined"){Promise.try=(f,...a)=>new Promise(r=>r(f(...a)));}\n';
        for (const [name, chunk] of Object.entries(bundle)) {
            if (!name.includes('pdf.worker')) continue;

            if (chunk.type === 'asset') {
                if (typeof chunk.source === 'string') {
                    chunk.source = polyfill + chunk.source;
                } else if (chunk.source instanceof Uint8Array || Buffer.isBuffer(chunk.source)) {
                    const str = Buffer.from(chunk.source).toString('utf-8');
                    chunk.source = polyfill + str;
                }
            } else if (chunk.type === 'chunk') {
                chunk.code = polyfill + chunk.code;
            }
        }
    },
};

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    base: siteConfig.base,
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
            [
                rehypeKatex,
                {
                    // Katex plugin options
                }
            ]
        ]
    },
    vite: {
        plugins: [tailwindcss(), pdfWorkerPolyfill]
    },
    integrations: [mdx(),sitemap(),generateDarkImages(),react()]
});