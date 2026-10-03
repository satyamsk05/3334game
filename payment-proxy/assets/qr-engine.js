// Ensure UTF-8 support for QRCode generator
if (typeof qrcode !== 'undefined' && qrcode.stringToBytesFuncs) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
}

// Pseudo-random number generator for deterministic procedural rings & dots
function rng(seed) {
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Circular QR Code SVG Renderer
function circ(q, n, c, options) {
  var opts = typeof options === 'string' ? { text: options, fillDots: true } : (options || {});
  var fillDots = opts.fillDots !== undefined ? opts.fillDots : true;
  var text = opts.text || '';
  var logoImg = opts.logoImg || '';
  var isFixedDimensions = opts.fixedDimensions !== undefined ? opts.fixedDimensions : false;
  var fontWeight = opts.fontWeight || (typeof options === 'string' ? '800' : '700');

  var h = n / 2;
  var R0 = n * 0.71;
  var lr = n * 0.11;
  var W = 1.1;
  var SP = 2.1;
  var H = R0 + 1.3 + 2 * SP + W + 0.8;
  var o = '';

  var eye = function(r, k) {
    return (r < 7 && k < 7) || (r < 7 && k >= n - 7) || (r >= n - 7 && k < 7);
  };

  for (var r = 0; r < n; r++) {
    for (var k = 0; k < n; k++) {
      if (!q.isDark(r, k) || eye(r, k)) continue;
      var x = k + 0.5 - h;
      var y = r + 0.5 - h;
      if (Math.hypot(x, y) < lr + 0.9) continue;
      o += '<circle cx="' + x + '" cy="' + y + '" r=".47"/>';
    }
  }

  [[3.5, 3.5], [n - 3.5, 3.5], [3.5, n - 3.5]].forEach(function(e) {
    var x = e[0] - h;
    var y = e[1] - h;
    o += '<circle cx="' + x + '" cy="' + y + '" r="2.95" fill="none" stroke="' + c + '" stroke-width="1.1"/><circle cx="' + x + '" cy="' + y + '" r="1.6"/>';
  });

  if (fillDots) {
    var f2 = rng(5);
    for (var r = -9; r < n + 9; r++) {
      for (var k = -9; k < n + 9; k++) {
        if (r >= -1 && r <= n && k >= -1 && k <= n) continue;
        var x = k + 0.5 - h;
        var y = r + 0.5 - h;
        if (Math.hypot(x, y) > R0 - 0.2) continue;
        if (f2() < 0.55) {
          o += '<circle cx="' + x + '" cy="' + y + '" r=".47"' + (f2() < 0.2 ? ' fill="#7d7d7d"' : '') + '/>';
        }
      }
    }
  }

  var d = '';
  var P = function(R, a) {
    return (R * Math.cos(a)).toFixed(2) + ' ' + (R * Math.sin(a)).toFixed(2);
  };

  for (var i = 0; i < 3; i++) {
    var R = R0 + 1.3 + i * SP;
    var f = rng(11 + i * 17);
    var a = f() * 6.283;
    var e = a + 6.283 - 0.06;
    while (a < e) {
      var l = Math.min((2.2 + f() * 2.6) / R, e - a);
      var g = f() < 0.3 ? '#7d7d7d' : c;
      d += '<path d="M' + P(R, a) + 'A' + R + ' ' + R + ' 0 0 1 ' + P(R, a + l) + '" stroke="' + g + '" fill="none" stroke-width="' + W + '" stroke-linecap="round"/>';
      a += l + (1.5 + f() * 1.1) / R;
    }
  }

  var lg = '<circle r="' + lr + '" fill="' + c + '"/>';
  if (logoImg) {
    lg += '<clipPath id="cp"><circle r="' + (lr * 0.82) + '"/></clipPath><image href="' + logoImg + '" x="' + (-lr) + '" y="' + (-lr) + '" width="' + (2 * lr) + '" height="' + (2 * lr) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#cp)"/>';
  } else if (text) {
    var cleanText = String(text).replace(/[<>&]/g, '');
    lg += '<text text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Figtree,sans-serif" font-weight="' + fontWeight + '" font-size="' + (lr * (cleanText.length > 3 ? 0.55 : 0.7)) + '" font-style="italic">' + cleanText + '</text>';
  }

  var sizeAttrs = isFixedDimensions ? ' width="1024" height="1024"' : '';
  var bgRect = isFixedDimensions ? '<rect x="' + (-H) + '" y="' + (-H) + '" width="' + (2 * H) + '" height="' + (2 * H) + '" fill="#fff"/>' : '';

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (-H) + ' ' + (-H) + ' ' + (2 * H) + ' ' + (2 * H) + '"' + sizeAttrs + '>' + bgRect + '<g fill="' + c + '">' + o + '</g>' + d + lg + '</svg>';
}
