/* ============================================================
   ITRX — quote-request document.

   Builds a formal, printable record of a visitor's intake answers in the
   browser and hands back a PDF blob, which the quote form attaches to the
   email. It is deliberately NOT a priced offer: per the intake flow, pricing
   is typed per deal and the official quote is issued from Stripe by hand.
   This document exists so the person doing that has everything in one page.

   Loaded on demand (jsPDF is ~360KB), never on first paint.
   ============================================================ */

(function () {
  var MARK = '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';

  var GREEN = [63, 120, 87];
  var TEAL = [36, 59, 61];
  var SAGE = [85, 115, 116];
  var PALE = [194, 222, 225];
  var RULE = [214, 223, 222];

  var M = 18;             /* page margin, mm */
  var W = 210, H = 297;   /* A4 */
  var RIGHT = W - M;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function stamp(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function reference(d) {
    var r = '';
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   /* no look-alikes */
    for (var i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return 'QR-' + stamp(d).replace(/-/g, '') + '-' + r;
  }

  function slug(s) {
    return (s || 'request').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  }

  function build(data) {
    var jsPDF = (window.jspdf || {}).jsPDF;
    if (!jsPDF) throw new Error('jsPDF not loaded');

    var now = new Date();
    var ref = reference(now);
    var doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    var y = 0;

    function text(s, x, yy, opts) { doc.text(String(s == null ? '' : s), x, yy, opts); }

    function footer() {
      var pages = doc.getNumberOfPages();
      for (var p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
        doc.setLineWidth(0.2);
        doc.line(M, H - 16, RIGHT, H - 16);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
        text('IT Prescription (ITRX) \u00b7 quote request ' + ref
             + ' \u00b7 intake record, not a priced offer', M, H - 11);
        text('page ' + p + ' of ' + pages, RIGHT, H - 11, { align: 'right' });
      }
    }

    /* a continuation page carries its own small header, so a loose sheet is
       still identifiable */
    function newPage() {
      doc.addPage();
      y = M;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      text('QUOTE REQUEST ' + ref, M, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
      text((data.organization || data.name || '') + ' · continued', RIGHT, y, { align: 'right' });
      y += 3;
      doc.setDrawColor(PALE[0], PALE[1], PALE[2]);
      doc.setLineWidth(0.4);
      doc.line(M, y, RIGHT, y);
      y += 10;
    }

    /* keeps a block whole: starts a new page when it would not fit */
    function room(h) {
      if (y + h <= H - 22) return;
      newPage();
    }

    /* ---------- masthead ---------- */
    doc.addImage(MARK, 'PNG', M, M - 2, 24, 14.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    text('QUOTE REQUEST', RIGHT, M + 2, { align: 'right' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    text(ref, RIGHT, M + 7.5, { align: 'right' });
    text(stamp(now), RIGHT, M + 12, { align: 'right' });

    y = M + 18;
    doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setLineWidth(0.7);
    doc.line(M, y, RIGHT, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    text('IT Prescription \u00b7 Houston, TX \u00b7 nmartinez@itprescription.com \u00b7 itprescription.com',
         M, y);

    /* ---------- who it is from ---------- */
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    var org = data.organization || data.name || 'New enquiry';
    var orgLines = doc.splitTextToSize(org, RIGHT - M);
    text(orgLines[0], M, y);
    if (orgLines[1]) { y += 7; text(orgLines[1], M, y); }

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    text('Submitted through itprescription.com/request-a-quote.html on '
         + stamp(now) + ' at ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + '.', M, y);

    /* ---------- sections ---------- */
    /* `keep` is the height of the block that must stay with this heading, so a
       section title never strands itself at the foot of a page */
    function section(title, keep) {
      room(18 + (keep || 0));
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      text(title.toUpperCase(), M, y);
      y += 2.4;
      doc.setDrawColor(PALE[0], PALE[1], PALE[2]);
      doc.setLineWidth(0.5);
      doc.line(M, y, RIGHT, y);
      y += 5.5;
    }

    var LABEL_W = 42;

    function row(label, value) {
      var v = (value == null || String(value).trim() === '') ? '\u2014' : String(value).trim();
      var lines = doc.splitTextToSize(v, RIGHT - M - LABEL_W);
      room(lines.length * 4.6 + 3);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
      text(label, M, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      for (var i = 0; i < lines.length; i++) {
        text(lines[i], M + LABEL_W, y + i * 4.6);
      }
      y += Math.max(lines.length * 4.6, 5) + 2.6;
    }

    section('Prepared for', 34);
    row('Contact', data.name);
    row('Organization', data.organization);
    row('Organization type', data.org_type);
    row('Role', data.role);
    row('Email', data.email);
    row('Phone', data.phone);

    section('What they are asking for');
    row('Kind of help', data.help);
    row('Categories', data.categories);
    row('In their words', data.details);

    section('Scope and timing');
    row('Size', data.size);
    row('Timeline', data.timeline);
    row('Budget or constraints', data.budget);
    row('Anything else', data.anything_else);

    /* ---------- the bit the reviewer fills in ---------- */
    section('For pricing', 92);

    var cols = [M, M + 96, M + 118, M + 143, RIGHT];
    doc.setFillColor(PALE[0], PALE[1], PALE[2]);
    doc.rect(M, y - 4, RIGHT - M, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    text('DESCRIPTION', cols[0] + 2, y);
    text('QTY', cols[1] + 2, y);
    text('UNIT', cols[2] + 2, y);
    text('AMOUNT', cols[4] - 2, y, { align: 'right' });
    y += 6;

    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.2);
    for (var r = 0; r < 6; r++) {
      doc.line(M, y + 2.5, RIGHT, y + 2.5);
      y += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    ['Subtotal', 'Tax', 'Total'].forEach(function (t) {
      text(t, cols[3] - 2, y, { align: 'right' });
      doc.line(cols[3] + 2, y + 1.5, RIGHT, y + 1.5);
      y += 7;
    });

    /* ---------- the standing caveat ---------- */
    room(30);
    y += 6;
    doc.setFillColor(247, 249, 248);
    doc.rect(M, y - 4, RIGHT - M, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    text('HOW THIS BECOMES A QUOTE', M + 3, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    var note = doc.splitTextToSize(
      'This document records what the customer asked for. It carries no prices and is not an offer. '
      + 'Hardware is priced per deal and costs move weekly, so the figures above are filled in by hand, '
      + 'and the official quote is issued from Stripe for the customer to accept and pay.',
      RIGHT - M - 6);
    for (var k = 0; k < note.length; k++) text(note[k], M + 3, y + 6 + k * 3.8);

    footer();

    return {
      blob: doc.output('blob'),
      filename: 'ITRX-quote-request-' + slug(data.organization || data.name) + '-' + stamp(now) + '.pdf',
      reference: ref
    };
  }

  window.ITRXQuoteDoc = { build: build };
})();
