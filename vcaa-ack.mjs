/* vcaa-ack.mjs — the VCAA acknowledgement on every public VCE concept page (Cat, 11 Oct 2026; VCAA's required text,
   received 3 Oct). Word for word: do not reword, shorten or "fix" it. The only markup is the link (new tab, noopener).
   One source: build-concept-pages.mjs puts it under the footer of every VCE page (HSC pages get nothing), and
   vcaa-ack-patch.mjs puts the same line into the VCE pages already on disk. terms.html carries it as "VCE content". */
export const VCAA_TEXT = 'VCE Study Design extracts used by permission, © VCAA. VCE® is a registered trademark of the VCAA. The VCAA does not endorse or make any warranties regarding this study resource. Current VCE Study Designs, past VCE exams and related content can be accessed directly at www.vcaa.vic.edu.au.';
export const VCAA_MARK = 'data-kw-vcaa';
/* the footer's faint legal style (knowhere-footer.js .kfn-legal: 12px #56554f, link hover #8C8B87), same width and gutter */
export const VCAA_LINE = `<div ${VCAA_MARK} style="background:#070708"><p style="max-width:1180px;margin:0 auto;padding:0 34px 30px;box-sizing:border-box;font-family:'Geist',system-ui,sans-serif;font-size:12px;line-height:1.6;color:#56554f">VCE Study Design extracts used by permission, © VCAA. VCE® is a registered trademark of the VCAA. The VCAA does not endorse or make any warranties regarding this study resource. Current VCE Study Designs, past VCE exams and related content can be accessed directly at <a class="kfn-legal" href="https://www.vcaa.vic.edu.au" target="_blank" rel="noopener">www.vcaa.vic.edu.au</a>.</p></div>`;
