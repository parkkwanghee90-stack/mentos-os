// macOS 내장 PDFKit 으로 PDF 의 모든 페이지를 고해상도 PNG 로 렌더(설치 불필요).
// 실행: osascript -l JavaScript pdf_render.jxa.js <pdfPath> <outDir> [scale]
ObjC.import('Foundation');
ObjC.import('Quartz');
ObjC.import('AppKit');

function run(argv) {
  const pdfPath = argv[0], outDir = argv[1], scale = parseFloat(argv[2] || '2.2');
  const fm = $.NSFileManager.defaultManager;
  fm.createDirectoryAtPathWithIntermediateDirectoriesAttributesError($(outDir), true, $(), null);
  const url = $.NSURL.fileURLWithPath($(pdfPath));
  const doc = $.PDFDocument.alloc.initWithURL(url);
  if (!doc || doc.isNil()) return 'ERR open';
  const n = doc.pageCount;
  for (let i = 0; i < n; i++) {
    const page = doc.pageAtIndex(i);
    const r = page.boundsForBox($.kPDFDisplayBoxMediaBox);
    const w = Math.ceil(r.size.width * scale), h = Math.ceil(r.size.height * scale);
    const img = $.NSImage.alloc.initWithSize($.NSMakeSize(w, h));
    img.lockFocus;
    // 흰 배경을 먼저 깔지 않으면 검정 텍스트가 검정(투명) 위에 묻힌다.
    $.NSColor.whiteColor.set;
    $.NSBezierPath.fillRect($.NSMakeRect(0, 0, w, h));
    const tf = $.NSAffineTransform.transform;
    tf.scaleXByYBy(scale, scale);
    tf.concat;
    page.drawWithBox($.kPDFDisplayBoxMediaBox);
    img.unlockFocus;
    const rep = $.NSBitmapImageRep.alloc.initWithCGImage(
      img.CGImageForProposedRectContextHints($(), $(), $()));
    const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
    const out = outDir + '/p' + String(i + 1).padStart(2, '0') + '.png';
    png.writeToFileAtomically($(out), true);
  }
  return 'OK ' + n;
}
