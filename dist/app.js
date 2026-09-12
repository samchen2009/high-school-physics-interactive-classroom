const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function fitCanvas(canvas, aspect = 0.5) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.floor(width * aspect);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

function drawInduction() {
  const canvas = $('#inductionCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas);
  const sign = Number($('#sourceSign').value);
  const distance = Number($('#inductionDistance').value);
  const conductorX = width * 0.62;
  const conductorY = height * 0.5;
  const conductorW = width * 0.52;
  const conductorH = Math.min(130, height * 0.48);
  const distanceRatio = (distance - 8) / (60 - 8);
  const conductorLeft = conductorX - conductorW / 2;
  const minGap = Math.max(14, width * 0.025);
  const maxGap = Math.max(minGap + 10, width * 0.18);
  const sourceX = conductorLeft - 34 - (minGap + distanceRatio * (maxGap - minGap));
  const strength = 1 - distanceRatio * 0.88;
  ctx.clearRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(sourceX, conductorY, 0, sourceX, conductorY, width * 0.24);
  glow.addColorStop(0, sign > 0 ? 'rgba(255,122,168,.26)' : 'rgba(109,229,255,.25)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#29435f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(conductorX - conductorW / 2, conductorY - conductorH / 2, conductorW, conductorH, conductorH / 2);
  ctx.fillStyle = 'rgba(18,41,66,.92)';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sourceX, conductorY, 34, 0, Math.PI * 2);
  ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#07111f';
  ctx.font = '800 28px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign > 0 ? '+' : '−', sourceX, conductorY - 1);

  const count = 18;
  const padding = 28;
  const left = conductorX - conductorW / 2 + padding;
  const right = conductorX + conductorW / 2 - padding;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const xNear = left + (right - left) * Math.pow(t, 1 + strength * 1.8);
    const xFar = right - (right - left) * Math.pow(1 - t, 1 + strength * 1.8);
    const y = conductorY + (i % 3 - 1) * 28;
    const nearSign = -sign;
    drawCharge(ctx, xNear, y, nearSign);
    drawCharge(ctx, xFar, y + 14, -nearSign);
  }

  ctx.fillStyle = '#edf8ff';
  ctx.font = '700 15px system-ui';
  ctx.fillText('外部带电体', sourceX, conductorY + 62);
  ctx.fillText('原本中性的金属导体', conductorX, conductorY + conductorH / 2 + 34);
  ctx.fillStyle = '#9db3c8';
  ctx.font = '14px system-ui';
  ctx.fillText('近端聚集异种电荷', conductorX - conductorW * .25, conductorY - conductorH / 2 - 20);
  ctx.fillText('远端聚集同种电荷', conductorX + conductorW * .25, conductorY - conductorH / 2 - 20);

  $('#distanceValue').textContent = `${distance} cm`;
  $('#inductionReadout').textContent = `外物带${sign > 0 ? '正' : '负'}电 · 距离 ${distance} cm`;
}

function drawCharge(ctx, x, y, sign) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff';
  ctx.fill();
  ctx.fillStyle = '#07111f';
  ctx.font = '800 12px system-ui';
  ctx.fillText(sign > 0 ? '+' : '−', x, y);
}

function initCoulomb() {
  const q1 = $('#q1');
  const q2 = $('#q2');
  const r = $('#distanceR');
  if (!q1 || !q2 || !r) return;

  const grid = $('.grid', $('#forceChart'));
  const ns = 'http://www.w3.org/2000/svg';
  const left = 58, right = 496, top = 22, bottom = 284;
  for (let i = 0; i <= 4; i++) {
    const x = left + (right - left) * i / 4;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x); line.setAttribute('y1', top); line.setAttribute('y2', bottom);
    grid.appendChild(line);
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', x); text.setAttribute('y', 302); text.setAttribute('text-anchor', 'middle'); text.textContent = i + 1;
    grid.appendChild(text);
  }
  const yLabels = [];
  for (let i = 0; i <= 4; i++) {
    const y = top + (bottom - top) * i / 4;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', left); line.setAttribute('x2', right); line.setAttribute('y1', y); line.setAttribute('y2', y);
    grid.appendChild(line);
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', left - 8); label.setAttribute('y', y + 4); label.setAttribute('text-anchor', 'end');
    grid.appendChild(label);
    yLabels.push(label);
  }
  const sx = value => left + (value - 1) / 4 * (right - left);
  const sy = (value, maximum) => bottom - Math.min(1, maximum > 0 ? value / maximum : 0) * (bottom - top);

  const superscript = value => String(value).replace(/-/g, '⁻').replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹');
  const signedCharge = value => `${value > 0 ? '+' : ''}${value.toFixed(1)} × 10⁻⁶ C`;
  const scientificForce = value => {
    if (value === 0) return '0 N';
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / (10 ** exponent);
    return `${mantissa.toFixed(3)} × 10${superscript(exponent)} N`;
  };
  const decimalForce = value => {
    if (value === 0) return '0 N';
    const digits = value >= 0.1 ? 4 : value >= 0.01 ? 5 : 6;
    return `${value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '')} N`;
  };
  const niceCeiling = value => {
    if (value <= 0) return 0.01;
    const exponent = Math.floor(Math.log10(value));
    const scale = 10 ** exponent;
    const fraction = value / scale;
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
    return niceFraction * scale;
  };
  const axisForce = value => {
    if (value === 0) return '0';
    const digits = value >= 0.1 ? 3 : 4;
    return value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
  };

  function update() {
    const a = Number(q1.value);
    const b = Number(q2.value);
    const distance = Number(r.value);
    const force = 0.009 * Math.abs(a * b) / (distance * distance);
    const forceAtOneMetre = 0.009 * Math.abs(a * b);
    const yMaximum = niceCeiling(forceAtOneMetre);
    const relation = a === 0 || b === 0 ? '无静电力' : Math.sign(a) === Math.sign(b) ? '相互排斥' : '相互吸引';
    $('#q1Value').textContent = `${a >= 0 ? '+' : ''}${a} μC`;
    $('#q2Value').textContent = `${b >= 0 ? '+' : ''}${b} μC`;
    $('#rValue').textContent = `${distance.toFixed(1)} m`;
    $('#distanceTag').textContent = `${distance.toFixed(1)} m`;
    $('#forceReadout').textContent = `${decimalForce(force)} · ${relation}`;
    $('#coulombSubstitution').textContent = `(9.0 × 10⁹ N·m²/C²) × |(${signedCharge(a)}) × (${signedCharge(b)})| ÷ (${distance.toFixed(1)} m)²`;
    $('#coulombScientific').textContent = scientificForce(force);
    $('#coulombDecimal').textContent = decimalForce(force);
    $('#coulombRelation').textContent = a === 0 || b === 0
      ? '至少一个电荷量为 0，所以库仑力为 0'
      : Math.sign(a) === Math.sign(b)
        ? '两电荷同号，所以相互排斥'
        : '两电荷异号，所以相互吸引';
    setOrb($('#orb1'), a);
    setOrb($('#orb2'), b);
    $('.distance-line').style.width = `${90 + distance * 30}px`;
    const arrowWidth = 10 + Math.min(70, force / 0.225 * 70);
    $('#leftArrow').style.width = `${arrowWidth}px`;
    $('#rightArrow').style.width = `${arrowWidth}px`;
    const attraction = relation === '相互吸引';
    $('#leftArrow').style.transform = attraction ? 'rotate(180deg)' : '';
    $('#rightArrow').style.transform = attraction ? 'rotate(180deg)' : '';

    yLabels.forEach((label, index) => {
      label.textContent = axisForce(yMaximum * (1 - index / 4));
    });
    $('#forceScaleReadout').textContent = `当前纵轴：0–${axisForce(yMaximum)} N`;
    let path = '';
    for (let value = 1; value <= 5.001; value += .04) {
      const curveForce = 0.009 * Math.abs(a * b) / (value * value);
      path += `${path ? 'L' : 'M'}${sx(value).toFixed(1)},${sy(curveForce, yMaximum).toFixed(1)} `;
    }
    $('#forceCurve').setAttribute('d', path);
    const px = sx(distance);
    const py = sy(force, yMaximum);
    $('#forceGuide').setAttribute('x1', px); $('#forceGuide').setAttribute('x2', px);
    $('#forceGuide').setAttribute('y1', py); $('#forceGuide').setAttribute('y2', bottom);
    $('#forcePoint').setAttribute('cx', px); $('#forcePoint').setAttribute('cy', py);
    $('#forcePointLabel').setAttribute('x', Math.min(px + 12, 430));
    $('#forcePointLabel').setAttribute('y', Math.max(py - 10, 36));
    $('#forcePointLabel').textContent = `${axisForce(force)} N`;
    $('#distanceMultiple').textContent = `${distance.toFixed(1)} 倍`;
    $('#forceFraction').textContent = `1/${(distance * distance).toFixed(2)}`;
  }
  function setOrb(orb, charge) {
    orb.className = `charge-orb ${charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'}`;
    orb.textContent = charge > 0 ? '+' : charge < 0 ? '−' : '0';
  }
  [q1, q2, r].forEach(input => input.addEventListener('input', update));
  update();
}

function updateNav() {
  const sections = $$('[data-section]');
  const links = $$('.side-nav a');
  let active = sections[0]?.id;
  sections.forEach(section => { if (section.getBoundingClientRect().top < 180) active = section.id; });
  let activeLink;
  links.forEach(link => {
    const selected = link.getAttribute('href') === `#${active}`;
    link.classList.toggle('active', selected);
    if (selected) activeLink = link;
  });

  const nav = $('.side-nav');
  if (nav && activeLink && window.matchMedia('(max-width: 1000px)').matches && nav.dataset.visibleSection !== active) {
    nav.dataset.visibleSection = active;
    const targetLeft = activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }
}

const fieldState = { preset: 'dipole' };
function getFieldCharges(preset, width, height) {
  if (preset === 'single') return [{ x: width * .5, y: height * .5, q: 1 }];
  if (preset === 'same') return [{ x: width * .34, y: height * .5, q: 1 }, { x: width * .66, y: height * .5, q: 1 }];
  return [{ x: width * .34, y: height * .5, q: 1 }, { x: width * .66, y: height * .5, q: -1 }];
}

function fieldVector(x, y, charges) {
  let ex = 0, ey = 0;
  charges.forEach(charge => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const d2 = dx * dx + dy * dy;
    const d = Math.sqrt(d2);
    if (d > 8) {
      const scale = charge.q / (d2 * d);
      ex += dx * scale;
      ey += dy * scale;
    }
  });
  return { ex, ey, mag: Math.hypot(ex, ey) };
}

function drawVectorArrow(ctx, x, y, vx, vy, length, alpha) {
  const mag = Math.hypot(vx, vy) || 1;
  const ux = vx / mag, uy = vy / mag;
  const x2 = x + ux * length, y2 = y + uy * length;
  ctx.strokeStyle = `rgba(109,229,255,${alpha})`;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * 6 - uy * 4, y2 - uy * 6 + ux * 4);
  ctx.lineTo(x2 - ux * 6 + uy * 4, y2 - uy * 6 - ux * 4);
  ctx.closePath(); ctx.fill();
}

function drawField() {
  const canvas = $('#fieldCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .56);
  const charges = getFieldCharges(fieldState.preset, width, height);
  ctx.clearRect(0, 0, width, height);

  const step = width < 600 ? 42 : 48;
  for (let y = 34; y < height - 24; y += step) {
    for (let x = 30; x < width - 24; x += step) {
      const nearest = Math.min(...charges.map(c => Math.hypot(x - c.x, y - c.y)));
      if (nearest < 42) continue;
      const v = fieldVector(x, y, charges);
      const scaled = Math.min(1, Math.log10(1 + v.mag * width * width * 2.3));
      drawVectorArrow(ctx, x, y, v.ex, v.ey, 8 + scaled * 11, .3 + scaled * .65);
    }
  }

  charges.forEach(charge => {
    const glow = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, 64);
    glow.addColorStop(0, charge.q > 0 ? 'rgba(255,122,168,.42)' : 'rgba(109,229,255,.42)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(charge.x - 70, charge.y - 70, 140, 140);
    ctx.beginPath(); ctx.arc(charge.x, charge.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = charge.q > 0 ? '#ff7aa8' : '#6de5ff'; ctx.fill();
    ctx.fillStyle = '#07111f'; ctx.font = '900 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(charge.q > 0 ? '+' : '−', charge.x, charge.y - 1);
  });

  const probeX = width * .5, probeY = height * .5;
  const v = fieldVector(probeX, probeY, charges);
  if (v.mag > 1e-8 && charges.every(c => Math.hypot(probeX - c.x, probeY - c.y) > 35)) {
    drawVectorArrow(ctx, probeX, probeY, v.ex, v.ey, 45, 1);
    ctx.fillStyle = '#ffd166'; ctx.font = '700 14px system-ui'; ctx.fillText('E', probeX, probeY - 25);
  }
  const messages = {
    single: '单个正电荷 · 电场方向向外发散',
    dipole: '等量异号电荷 · 中点场强向右',
    same: '等量同号电荷 · 中点场强为零'
  };
  $('#fieldReadout').textContent = messages[fieldState.preset];
}

function initField() {
  $$('[data-field-preset]').forEach(button => {
    button.addEventListener('click', () => {
      fieldState.preset = button.dataset.fieldPreset;
      $$('[data-field-preset]').forEach(item => item.classList.toggle('active', item === button));
      drawField();
    });
  });
  drawField();
}

function initTestCharge() {
  const slider = $('#testChargeSlider');
  if (!slider) return;
  const fieldStrength = 7.2e4;
  const exponentText = value => String(value).replace(/-/g, '⁻').replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹');
  const scientific = value => {
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    return `${(value / (10 ** exponent)).toFixed(2)} × 10${exponentText(exponent)}`;
  };
  function updateTestCharge() {
    const chargeNanoCoulomb = Number(slider.value);
    const chargeCoulomb = chargeNanoCoulomb * 1e-9;
    const force = chargeCoulomb * fieldStrength;
    $('#testChargeValue').textContent = `${chargeNanoCoulomb.toFixed(1)} nC`;
    $('#testForceValue').textContent = `F = ${scientific(force)} N`;
    $('#testRatioValue').textContent = `E = F/q₀ = ${scientific(force)} ÷ (${chargeNanoCoulomb.toFixed(1)} × 10⁻⁹) = 7.20 × 10⁴ N/C`;
    $('#testForceArrow').style.width = `${58 + chargeNanoCoulomb * 18}px`;
    $('#testProbe').style.transform = `scale(${0.92 + chargeNanoCoulomb * 0.025})`;
  }
  slider.addEventListener('input', updateTestCharge);
  updateTestCharge();
}

function potentialAt(x, y) {
  const softening = .075;
  const positiveDistance = Math.sqrt((x + .42) ** 2 + y ** 2 + softening ** 2);
  const negativeDistance = Math.sqrt((x - .42) ** 2 + y ** 2 + softening ** 2);
  return 1 / positiveDistance - 1 / negativeDistance;
}

function terrainHeight(x, y) {
  return Math.tanh(potentialAt(x, y) * .56);
}

function projectTerrain(width, height, x, y, z = 0) {
  return {
    x: width * .5 + (x - y) * width * .25,
    y: height * .53 + (x + y) * height * .12 - z * height * .25
  };
}

function drawTerrainLabel(ctx, text, x, y, color, align = 'center') {
  ctx.font = '800 13px system-ui';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(text);
  const padding = 7;
  const boxX = align === 'center' ? x - metrics.width / 2 - padding : align === 'right' ? x - metrics.width - padding * 2 : x;
  ctx.fillStyle = 'rgba(7,17,31,.86)';
  ctx.beginPath();
  ctx.roundRect(boxX, y - 13, metrics.width + padding * 2, 26, 7);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, align === 'center' ? x : align === 'right' ? x - padding : x + padding, y);
}

function drawPotential() {
  const canvas = $('#potentialCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .62);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const backdrop = ctx.createLinearGradient(0, 0, 0, height);
  backdrop.addColorStop(0, '#07111f');
  backdrop.addColorStop(1, '#0b192a');
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, width, height);

  const corners = [[-.9, -.9], [.9, -.9], [.9, .9], [-.9, .9]].map(([x, y]) => projectTerrain(width, height, x, y, 0));
  ctx.fillStyle = 'rgba(237,248,255,.025)';
  ctx.strokeStyle = 'rgba(237,248,255,.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const columns = 25;
  const rows = 19;
  const cells = [];
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const x0 = -.9 + column / (columns - 1) * 1.8;
      const x1 = -.9 + (column + 1) / (columns - 1) * 1.8;
      const y0 = -.9 + row / (rows - 1) * 1.8;
      const y1 = -.9 + (row + 1) / (rows - 1) * 1.8;
      const points = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => {
        const z = terrainHeight(x, y);
        return { ...projectTerrain(width, height, x, y, z), z };
      });
      cells.push({ points, depth: (x0 + x1 + y0 + y1) / 4 });
    }
  }
  cells.sort((a, b) => a.depth - b.depth).forEach(cell => {
    const averageHeight = cell.points.reduce((sum, point) => sum + point.z, 0) / cell.points.length;
    const strength = .10 + Math.abs(averageHeight) * .3;
    ctx.fillStyle = averageHeight >= 0
      ? `rgba(255,122,168,${strength})`
      : `rgba(109,229,255,${strength})`;
    ctx.strokeStyle = averageHeight >= 0 ? 'rgba(255,170,195,.31)' : 'rgba(148,238,255,.28)';
    ctx.lineWidth = .7;
    ctx.beginPath();
    cell.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  const zeroStart = projectTerrain(width, height, 0, -.9, 0);
  const zeroEnd = projectTerrain(width, height, 0, .9, 0);
  ctx.strokeStyle = 'rgba(255,209,102,.75)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(zeroStart.x, zeroStart.y);
  ctx.lineTo(zeroEnd.x, zeroEnd.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const peak = projectTerrain(width, height, -.42, 0, terrainHeight(-.42, 0));
  const valley = projectTerrain(width, height, .42, 0, terrainHeight(.42, 0));
  drawTerrainLabel(ctx, '＋Q：高电势山峰', peak.x - 10, Math.max(22, peak.y - 23), '#ff9abb', 'right');
  drawTerrainLabel(ctx, '−Q：低电势深谷', valley.x + 10, Math.min(height - 20, valley.y + 27), '#8beaff', 'left');
  const zeroLabel = projectTerrain(width, height, 0, -.72, 0);
  drawTerrainLabel(ctx, 'φ = 0', zeroLabel.x, zeroLabel.y - 18, '#ffd166');

  const probePosition = Number($('#probeX').value) / 40;
  const terrainX = probePosition * .84;
  const terrainY = 0;
  const rawPotential = potentialAt(terrainX, terrainY);
  const probeHeight = terrainHeight(terrainX, terrainY);
  const probeBase = projectTerrain(width, height, terrainX, terrainY, 0);
  const probePoint = projectTerrain(width, height, terrainX, terrainY, probeHeight);
  const displayV = rawPotential * 1.35;
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(probeBase.x, probeBase.y);
  ctx.lineTo(probePoint.x, probePoint.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(probePoint.x, probePoint.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd166';
  ctx.shadowColor = '#ffd166';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;
  drawTerrainLabel(ctx, '探针', probePoint.x, Math.max(18, probePoint.y - 22), '#ffd166');
  const probeCharge = Number($('#probeSign').value);
  const probeChargeNanoCoulomb = probeCharge * 2;
  const energyMicroJoule = probeChargeNanoCoulomb * displayV;
  $('#probeXValue').textContent = `${probePosition >= 0 ? '+' : ''}${(probePosition * 4).toFixed(1)} m`;
  $('#potentialReadout').textContent = `φ = ${displayV >= 0 ? '+' : ''}${displayV.toFixed(1)} kV · Eₚ = ${energyMicroJoule >= 0 ? '+' : ''}${energyMicroJoule.toFixed(1)} μJ`;
  $('#energyRuleReadout').textContent = probeCharge > 0
    ? '当前选择 +2 nC：正电荷的电势能地形与电势地形同向，山峰处 Eₚ 高，低谷处 Eₚ 低。'
    : '当前选择 −2 nC：电势地形本身不变，但 Eₚ=qφ 乘上负数，电势能地形上下翻转。';
}

function initPotential() {
  $('#probeX')?.addEventListener('input', drawPotential);
  $('#probeSign')?.addEventListener('change', drawPotential);
  drawPotential();
}

function initEnergyAnalogy() {
  const demo = $('#energyDemoGrid');
  const replay = $('#energyReplay');
  if (!demo || !replay) return;
  replay.addEventListener('click', () => {
    demo.classList.remove('is-playing');
    void demo.offsetWidth;
    demo.classList.add('is-playing');
  });
}

let particlePhase = 0;
let particlePrevious = performance.now();
function drawParticle(now = performance.now()) {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .43);
  const sign = Number($('#particleSign').value);
  const speed = Number($('#particleSpeed').value);
  const voltage = Number($('#plateVoltage').value);
  const gap = Number($('#plateGap').value);
  const centerY = height * .5;
  const gapPx = height * (.34 + (gap - 12) / 16 * .28);
  const upper = centerY - gapPx / 2;
  const lower = centerY + gapPx / 2;
  const startX = width * .08;
  const endX = width * .92;
  const curvature = sign * voltage / (gap * speed * speed) * height * 1.8;
  const yAt = t => centerY + curvature * t * t;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,122,168,.16)'; ctx.fillRect(startX, upper - 15, endX - startX, 15);
  ctx.fillStyle = 'rgba(109,229,255,.16)'; ctx.fillRect(startX, lower, endX - startX, 15);
  ctx.strokeStyle = '#ff7aa8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(startX, upper); ctx.lineTo(endX, upper); ctx.stroke();
  ctx.strokeStyle = '#6de5ff'; ctx.beginPath(); ctx.moveTo(startX, lower); ctx.lineTo(endX, lower); ctx.stroke();
  ctx.fillStyle = '#ff7aa8'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'left'; ctx.fillText('＋ ＋ ＋ ＋ ＋', startX, upper - 22);
  ctx.fillStyle = '#6de5ff'; ctx.fillText('−  −  −  −  −', startX, lower + 35);
  ctx.fillStyle = '#9db3c8'; ctx.font = '14px system-ui'; ctx.fillText('电场方向 ↓', endX - 90, centerY - 5);

  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath();
  let collided = false;
  let maxT = 1;
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = startX + (endX - startX) * t;
    const y = yAt(t);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    if (y <= upper || y >= lower) { collided = true; maxT = t; break; }
  }
  ctx.stroke(); ctx.setLineDash([]);
  const dt = Math.min(50, now - particlePrevious); particlePrevious = now;
  particlePhase = (particlePhase + dt * speed * .000055) % Math.max(.05, maxT);
  const px = startX + (endX - startX) * particlePhase;
  const py = yAt(particlePhase);
  ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff'; ctx.fill();
  ctx.fillStyle = '#07111f'; ctx.font = '900 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sign > 0 ? '+' : '−', px, py);
  ctx.textBaseline = 'alphabetic';

  $('#speedValue').textContent = speed.toFixed(1);
  $('#plateVoltageValue').textContent = `${voltage} V`;
  $('#plateGapValue').textContent = `${gap} cm`;
  $('#particleReadout').textContent = `${sign > 0 ? '正粒子向下' : '负粒子向上'}偏转 · ${collided ? '会撞板' : '不会撞板'}`;
  requestAnimationFrame(drawParticle);
}

function initParticle() {
  ['#particleSign', '#particleSpeed', '#plateVoltage', '#plateGap'].forEach(selector => {
    $(selector)?.addEventListener('input', () => { particlePhase = 0; });
  });
  requestAnimationFrame(drawParticle);
}

function drawCapacitor() {
  const canvas = $('#capacitorCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .57);
  const mode = $('#capacitorMode').value;
  const distance = Number($('#capDistance').value);
  const area = Number($('#capArea').value) / 100;
  const dielectric = Number($('#dielectric').value);
  const cRel = dielectric * area * 3 / distance;
  const uRel = mode === 'voltage' ? 1 : 1 / cRel;
  const qRel = mode === 'voltage' ? cRel : 1;
  const eRel = uRel * 3 / distance;
  const centerX = width * .5;
  const separation = width * (.16 + (distance - 1) / 5 * .28);
  const left = centerX - separation / 2;
  const right = centerX + separation / 2;
  const plateH = height * (.42 + area * .35);
  const top = (height - plateH) / 2;
  ctx.clearRect(0, 0, width, height);
  if (dielectric > 1) {
    ctx.fillStyle = `rgba(255,209,102,${.05 + dielectric * .025})`;
    ctx.fillRect(left + 8, top, right - left - 16, plateH);
    ctx.fillStyle = '#ffd166'; ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`介质 εr=${dielectric.toFixed(1)}`, centerX, top + plateH / 2);
  }
  ctx.strokeStyle = '#ff7aa8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, top + plateH); ctx.stroke();
  ctx.strokeStyle = '#6de5ff'; ctx.beginPath(); ctx.moveTo(right, top); ctx.lineTo(right, top + plateH); ctx.stroke();
  const lines = Math.max(4, Math.round(5 + eRel * 5));
  ctx.strokeStyle = 'rgba(255,209,102,.56)'; ctx.lineWidth = 1.5;
  for (let i = 1; i <= lines; i++) {
    const y = top + plateH * i / (lines + 1);
    ctx.beginPath(); ctx.moveTo(left + 8, y); ctx.lineTo(right - 8, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(right - 17, y - 5); ctx.lineTo(right - 8, y); ctx.lineTo(right - 17, y + 5); ctx.stroke();
  }
  const charges = Math.max(3, Math.min(16, Math.round(qRel * 5)));
  ctx.font = '900 17px system-ui'; ctx.textBaseline = 'middle';
  for (let i = 0; i < charges; i++) {
    const y = top + 15 + (plateH - 30) * i / Math.max(1, charges - 1);
    ctx.fillStyle = '#ff7aa8'; ctx.textAlign = 'right'; ctx.fillText('+', left - 12, y);
    ctx.fillStyle = '#6de5ff'; ctx.textAlign = 'left'; ctx.fillText('−', right + 12, y);
  }
  ctx.fillStyle = '#edf8ff'; ctx.font = '700 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`板间距 ${distance.toFixed(1)} cm`, centerX, top + plateH + 34);
  ctx.fillStyle = '#9db3c8'; ctx.font = '13px system-ui';
  ctx.fillText(mode === 'voltage' ? '电源仍连接：电压被锁定' : '电源已断开：电荷量被锁定', centerX, top - 24);

  $('#capDistanceValue').textContent = `${distance.toFixed(1)} cm`;
  $('#capAreaValue').textContent = `${Math.round(area * 100)}%`;
  $('#dielectricValue').textContent = dielectric.toFixed(1);
  $('#capacitorReadout').textContent = mode === 'voltage' ? '接电源 · 电压保持不变' : '断开电源 · 电荷量保持不变';
  $('#capC').textContent = `${cRel.toFixed(2)} C₀`;
  $('#capQ').textContent = `${qRel.toFixed(2)} Q₀`;
  $('#capU').textContent = `${uRel.toFixed(2)} U₀`;
  $('#capE').textContent = `${eRel.toFixed(2)} E₀`;
  $('#capQHint').textContent = mode === 'voltage' ? '接电源时会随电容改变' : '断开电源后保持不变';
  $('#capUHint').textContent = mode === 'voltage' ? '由电源锁定' : '由电荷量和电容共同决定';
  $('#capCBar').style.width = `${Math.min(100, cRel / 15 * 100)}%`;
  $('#capQBar').style.width = `${Math.min(100, qRel / 15 * 100)}%`;
  $('#capUBar').style.width = `${Math.min(100, uRel / 5 * 100)}%`;
  $('#capEBar').style.width = `${Math.min(100, eRel / 3 * 100)}%`;
}

function initCapacitor() {
  ['#capacitorMode', '#capDistance', '#capArea', '#dielectric'].forEach(selector => {
    $(selector)?.addEventListener('input', drawCapacitor);
  });
  drawCapacitor();
}

function initWorkedExamples() {
  $$('.answer-options').forEach(group => {
    const correctChoice = group.dataset.answer;
    const feedback = group.parentElement.querySelector('.answer-feedback');
    $$('button', group).forEach(button => {
      button.addEventListener('click', () => {
        const isCorrect = button.dataset.choice === correctChoice;
        $$('button', group).forEach(option => {
          option.classList.remove('chosen-wrong', 'chosen-correct', 'reveal-correct');
          option.setAttribute('aria-pressed', option === button ? 'true' : 'false');
        });
        button.classList.add(isCorrect ? 'chosen-correct' : 'chosen-wrong');
        if (!isCorrect) {
          $(`button[data-choice="${correctChoice}"]`, group)?.classList.add('reveal-correct');
        }
        if (feedback) {
          feedback.textContent = isCorrect ? group.dataset.correctNote : group.dataset.wrongNote;
          feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'wrong'}`;
        }
      });
    });
  });

  const capacitorCases = {
    connected: {
      c: 'C/2 ↓', q: 'Q/2 ↓', u: 'U 不变', e: 'E/2 ↓',
      qReason: 'Q = CU，U 锁定', uReason: '由电源锁定', eReason: 'E = U/d'
    },
    isolated: {
      c: 'C/2 ↓', q: 'Q 不变', u: '2U ↑', e: 'E 不变',
      qReason: '电路断开，无处转移电荷', uReason: 'U = Q/C', eReason: 'E ∝ Q/S，或 E = 2U/2d'
    }
  };
  $$('[data-cap-case]').forEach(button => {
    button.addEventListener('click', () => {
      const values = capacitorCases[button.dataset.capCase];
      $$('[data-cap-case]').forEach(item => item.classList.toggle('active', item === button));
      $('#caseC').textContent = values.c;
      $('#caseQ').textContent = values.q;
      $('#caseU').textContent = values.u;
      $('#caseE').textContent = values.e;
      $('#caseQReason').textContent = values.qReason;
      $('#caseUReason').textContent = values.uReason;
      $('#caseEReason').textContent = values.eReason;
    });
  });
}

function initChargeLedger() {
  const protonRow = $('#protonRow');
  const electronRow = $('#electronRow');
  if (!protonRow || !electronRow) return;

  const protons = 6;
  let electrons = 6;
  const makeTokens = (count, symbol) => Array.from({ length: count }, () => {
    const token = document.createElement('b');
    token.className = 'charge-token';
    token.textContent = symbol;
    return token;
  });

  function renderLedger() {
    protonRow.replaceChildren(...makeTokens(protons, '+'));
    electronRow.replaceChildren(...makeTokens(electrons, '−'));
    $('#protonCount').textContent = protons;
    $('#electronCount').textContent = electrons;

    const net = protons - electrons;
    const result = $('#netResult');
    result.className = `net-result ${net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral'}`;
    $('#netChargeValue').innerHTML = `Q<sub>净</sub> = ${net > 0 ? '+' : net < 0 ? '−' : ''}${Math.abs(net) || 0}${net === 0 ? '' : 'e'}`;
    $('#netChargeMeaning').textContent = net > 0
      ? `电子比质子少 ${net} 个，抵消后还剩正电，所以物体带正电。`
      : net < 0
        ? `电子比质子多 ${Math.abs(net)} 个，抵消后还剩负电，所以物体带负电。`
        : '正负电荷总量相等，所以物体呈电中性；不是说物体内部没有电荷。';
    $('#addElectron').disabled = electrons >= 9;
    $('#removeElectron').disabled = electrons <= 3;
    result.classList.remove('flash');
    requestAnimationFrame(() => result.classList.add('flash'));
  }

  $('#addElectron').addEventListener('click', () => { electrons = Math.min(9, electrons + 1); renderLedger(); });
  $('#removeElectron').addEventListener('click', () => { electrons = Math.max(3, electrons - 1); renderLedger(); });
  $('#resetElectrons').addEventListener('click', () => { electrons = 6; renderLedger(); });
  renderLedger();
}

function initLifeCases() {
  const buttons = $$('[data-life-case]');
  const panels = $$('[data-life-panel]');
  if (!buttons.length || !panels.length) return;

  function selectCase(caseName, moveFocus = false) {
    buttons.forEach(button => {
      const selected = button.dataset.lifeCase === caseName;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) button.focus();
    });
    panels.forEach(panel => {
      const selected = panel.dataset.lifePanel === caseName;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectCase(button.dataset.lifeCase));
    button.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = buttons.length - 1;
      else return;
      event.preventDefault();
      selectCase(buttons[nextIndex].dataset.lifeCase, true);
    });
  });
  selectCase(buttons.find(button => button.classList.contains('active'))?.dataset.lifeCase || buttons[0].dataset.lifeCase);
}

function initGroundingLab() {
  const stage = $('#groundingStage');
  const signButton = $('#groundingSign');
  const stepButtons = $$('[data-ground-step]');
  if (!stage || !signButton || !stepButtons.length) return;

  let step = 1;
  let rodSign = 1;
  const stepLabel = $('#groundingStepLabel');
  const stepText = $('#groundingStepText');
  const netText = $('#groundingNet');
  const rod = $('#groundingRod');
  const near = $('#groundNear');
  const far = $('#groundFar');
  const spread = $('#spreadCharge');
  const flow = $('#electronFlow');
  const field = $('.grounding-field', stage);

  const descriptions = {
    1: {
      positive: ['第 1 步 · 只靠近，不接触', '正电棒吸引电子。金属球靠近棒的一侧电子偏多，远端电子偏少，但整个球的净电荷仍为 0。', '近端负、远端正；整体中性'],
      negative: ['第 1 步 · 只靠近，不接触', '负电棒排斥电子。金属球靠近棒的一侧电子偏少，远端电子偏多，但整个球的净电荷仍为 0。', '近端正、远端负；整体中性']
    },
    2: {
      positive: ['第 2 步 · 保持棒不动，再接地', '正电棒仍在吸引电子。接地提供通路，电子从大地进入金属球，远端原先“缺电子”的状态被补上。', '电子从大地流入；金属球已有净负电荷'],
      negative: ['第 2 步 · 保持棒不动，再接地', '负电棒仍在排斥电子。接地提供通路，电子从金属球流入大地，金属球于是缺少电子。', '电子流向大地；金属球已有净正电荷']
    },
    3: {
      positive: ['第 3 步 · 先断开接地', '带电棒还没移走，但电子回到大地的通路已经切断，多出来的电子被留在金属球上。', '通路切断；净负电荷被“锁住”'],
      negative: ['第 3 步 · 先断开接地', '带电棒还没移走，但电子从大地返回的通路已经切断，金属球缺少电子的状态被保留下来。', '通路切断；净正电荷被“锁住”']
    },
    4: {
      positive: ['第 4 步 · 最后移走带电棒', '外部吸引消失，多出来的电子在金属球表面重新均匀分布。金属球仍然带负电。', '最终：金属球带负电，与正电棒异号'],
      negative: ['第 4 步 · 最后移走带电棒', '外部排斥消失，金属球表面的电子重新均匀分布。因为缺少电子，金属球仍然带正电。', '最终：金属球带正电，与负电棒异号']
    }
  };

  function render() {
    const key = rodSign > 0 ? 'positive' : 'negative';
    const copy = descriptions[step][key];
    stage.dataset.step = String(step);
    stage.dataset.rodSign = key;
    rod.querySelector('b').textContent = rodSign > 0 ? '＋＋＋' : '−−−';
    rod.querySelector('small').textContent = `带${rodSign > 0 ? '正' : '负'}电棒`;
    near.textContent = rodSign > 0 ? '− − −' : '＋ ＋ ＋';
    far.textContent = step === 1
      ? (rodSign > 0 ? '＋ ＋ ＋' : '− − −')
      : (rodSign > 0 ? '−' : '＋');
    spread.textContent = rodSign > 0 ? '−　−　−　−' : '＋　＋　＋　＋';
    flow.textContent = rodSign > 0 ? 'e⁻ ↑' : 'e⁻ ↓';
    field.textContent = rodSign > 0 ? '→　→' : '←　←';
    stepLabel.textContent = copy[0];
    stepText.textContent = copy[1];
    netText.textContent = copy[2];
    signButton.textContent = `换成${rodSign > 0 ? '负' : '正'}电棒，观察电子反向流动`;
    stepButtons.forEach((button) => {
      const active = Number(button.dataset.groundStep) === step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  stepButtons.forEach((button) => button.addEventListener('click', () => {
    step = Number(button.dataset.groundStep);
    render();
  }));
  signButton.addEventListener('click', () => {
    rodSign *= -1;
    step = 1;
    render();
  });
  render();
}

function initElectroscopeLab() {
  const lab = $('#electroscopeLab');
  const modeButtons = $$('[data-scope-mode]');
  const stepButtons = $$('[data-scope-step]');
  if (!lab || !modeButtons.length || !stepButtons.length) return;

  let mode = 'contact';
  let step = 1;
  const states = {
    contact: {
      1: {
        title: '第 1 步 · 验电器原来不带电',
        text: '金属球、金属杆和两片金属箔中都有正、负电荷，正负总量相等。两片箔片没有同号电荷的明显排斥，因此自然下垂。',
        result: '箔片状态：闭合｜验电器净电荷：0',
        action: '还没有接触', top: '＋ −', leaves: '＋ −'
      },
      2: {
        title: '第 2 步 · 正电棒接触金属球',
        text: '正电棒缺少电子。接触以后，验电器中的电子沿金属杆向上运动，并跨过接触点进入正电棒。验电器整体失去电子，所以金属球、金属杆和两片箔片都带正电。',
        result: '两片箔片：都带正电 → 同号排斥 → 张开',
        action: '已经接触｜e⁻ 向正电棒移动', top: '＋ ＋', leaves: '＋ ＋'
      },
      3: {
        title: '第 3 步 · 移开带电棒',
        text: '带电棒虽然移开了，但刚才失去的电子没有自动回来。验电器仍有电子缺失，仍然带正电，所以两片箔片继续排斥。',
        result: '箔片状态：仍然张开｜验电器净电荷：正',
        action: '带电棒已移开', top: '＋ ＋', leaves: '＋ ＋'
      }
    },
    induction: {
      1: {
        title: '第 1 步 · 验电器原来不带电',
        text: '正负电荷总量相等，电子大致均匀分布。两片箔片没有同号电荷的明显排斥，因此自然下垂。',
        result: '箔片状态：闭合｜验电器净电荷：0',
        action: '还没有靠近', top: '＋ −', leaves: '＋ −'
      },
      2: {
        title: '第 2 步 · 正电棒靠近，但不接触',
        text: '正电棒吸引电子，电子只在验电器内部向上移动，聚集到顶部金属球附近。下面两片箔片都缺少电子，于是都表现为正电并彼此排斥。',
        result: '顶部负、下部正；整体净电荷仍为 0｜箔片张开',
        action: '留有空隙｜没有电子跨过去', top: '− − −', leaves: '＋ ＋'
      },
      3: {
        title: '第 3 步 · 移开带电棒',
        text: '外部吸引消失，聚集在顶部的电子重新分散到整个验电器。两片箔片不再同号带电，于是恢复下垂。',
        result: '箔片状态：重新闭合｜验电器净电荷：0',
        action: '带电棒已移开', top: '＋ −', leaves: '＋ −'
      }
    }
  };

  function render() {
    const current = states[mode][step];
    lab.dataset.mode = mode;
    lab.dataset.step = String(step);
    $('#scopeStepTitle').textContent = current.title;
    $('#scopeStepText').textContent = current.text;
    $('#scopeStepResult').textContent = current.result;
    $('#scopeActionLabel').textContent = current.action;
    $('#scopeTopCharge').textContent = current.top;
    $('#scopeLeftCharge').textContent = current.leaves;
    $('#scopeRightCharge').textContent = current.leaves;
    $('#scopeStepTwoLabel').textContent = mode === 'contact' ? '让正电棒接触' : '让正电棒靠近';
    modeButtons.forEach(button => {
      const active = button.dataset.scopeMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    stepButtons.forEach(button => {
      const active = Number(button.dataset.scopeStep) === step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  modeButtons.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.scopeMode;
    step = 1;
    render();
  }));
  stepButtons.forEach(button => button.addEventListener('click', () => {
    step = Number(button.dataset.scopeStep);
    render();
  }));
  render();
}

function initCoulombScenarios() {
  const chargeInput = $('#hangingCharge');
  const svg = $('#hangingChargeSvg');
  if (chargeInput && svg) {
    const ropeLength = 0.4;
    const mass = 0.002;
    const gravity = 9.8;
    const k = 9e9;

    function solveAngle(qMicroCoulomb) {
      const charge = qMicroCoulomb * 1e-6;
      let low = 0.002;
      let high = 1.3;
      for (let i = 0; i < 70; i += 1) {
        const angle = (low + high) / 2;
        const electricForce = k * charge ** 2 / (4 * ropeLength ** 2 * Math.sin(angle) ** 2);
        const balance = mass * gravity * Math.tan(angle) - electricForce;
        if (balance > 0) high = angle;
        else low = angle;
      }
      return (low + high) / 2;
    }

    function updateHangingScene() {
      const qMicro = Number(chargeInput.value);
      const angle = solveAngle(qMicro);
      const visualLength = 170;
      const pivotX = 260;
      const pivotY = 35;
      const dx = visualLength * Math.sin(angle);
      const dy = visualLength * Math.cos(angle);
      const leftX = pivotX - dx;
      const rightX = pivotX + dx;
      const ballY = pivotY + dy;
      const distance = 2 * ropeLength * Math.sin(angle);
      const force = mass * gravity * Math.tan(angle);
      const set = (id, attributes) => {
        const element = $(id);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
      };

      set('#hangRopeLeft', { x2: leftX, y2: ballY });
      set('#hangRopeRight', { x2: rightX, y2: ballY });
      set('#hangBallLeft', { cx: leftX, cy: ballY });
      set('#hangBallRight', { cx: rightX, cy: ballY });
      set('#hangBallLeftCharge', { x: leftX, y: ballY + 6 });
      set('#hangBallRightCharge', { x: rightX, y: ballY + 6 });
      set('#hangForceLeft', { x1: leftX - 26, y1: ballY, x2: leftX - 80, y2: ballY });
      set('#hangForceRight', { x1: rightX + 26, y1: ballY, x2: rightX + 80, y2: ballY });
      set('#hangForceTextLeft', { x: leftX - 90, y: ballY - 10 });
      set('#hangForceTextRight', { x: rightX + 73, y: ballY - 10 });
      set('#hangGravityLeft', { x1: leftX, y1: ballY + 27, x2: leftX, y2: ballY + 77 });
      set('#hangGravityRight', { x1: rightX, y1: ballY + 27, x2: rightX, y2: ballY + 77 });
      set('#hangGravityTextLeft', { x: leftX + 10, y: ballY + 68 });
      set('#hangGravityTextRight', { x: rightX + 10, y: ballY + 68 });
      set('#hangTensionLeft', { x1: leftX + 11, y1: ballY - 22, x2: leftX + dx * 0.43, y2: ballY - dy * 0.43 });
      set('#hangTensionRight', { x1: rightX - 11, y1: ballY - 22, x2: rightX - dx * 0.43, y2: ballY - dy * 0.43 });
      set('#hangTensionTextLeft', { x: leftX + dx * 0.35 - 24, y: ballY - dy * 0.35 });
      set('#hangTensionTextRight', { x: rightX - dx * 0.35 + 16, y: ballY - dy * 0.35 });
      set('#hangDistance', { x1: leftX, x2: rightX });
      set('#hangDistanceText', { x: pivotX });
      const arcX = pivotX - 40 * Math.sin(angle);
      const arcY = pivotY + 40 * Math.cos(angle);
      $('#hangAngleArc').setAttribute('d', `M ${pivotX} ${pivotY + 40} A 40 40 0 0 0 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`);
      set('#hangAngleLabel', { x: pivotX - 48 * Math.sin(angle / 2) - 4, y: pivotY + 48 * Math.cos(angle / 2) + 4 });

      $('#hangingChargeValue').textContent = `${qMicro.toFixed(2)} μC`;
      $('#hangingAngleValue').textContent = `θ = ${(angle * 180 / Math.PI).toFixed(1)}°`;
      $('#hangingDistanceValue').textContent = `r = ${distance.toFixed(3)} m`;
      $('#hangingForceValue').textContent = `F电 = ${(force * 1000).toFixed(2)} mN`;
    }

    chargeInput.addEventListener('input', updateHangingScene);
    updateHangingScene();
  }

  const contactStage = $('#sphereContactStage');
  if (contactStage) {
    const presetButtons = $$('[data-contact-preset]');
    const stepButtons = $$('[data-contact-step]');
    let charges = [6, -2];
    let contactStep = 1;
    const signed = value => `${value > 0 ? '＋' : value < 0 ? '−' : ''}${Math.abs(value)} μC`;

    function renderContact() {
      const average = (charges[0] + charges[1]) / 2;
      const shown = contactStep === 1 ? charges : [average, average];
      contactStage.dataset.step = String(contactStep);
      contactStage.dataset.flow = charges[0] <= charges[1] ? 'right' : 'left';
      $('#sphereACharge').textContent = signed(shown[0]);
      $('#sphereBCharge').textContent = signed(shown[1]);
      $('#contactTotalFormula').textContent = `Q总 = ${signed(charges[0]).replace(' μC', '')} + (${signed(charges[1]).replace(' μC', '')}) = ${signed(charges[0] + charges[1])}`;
      $('#contactAverageFormula').textContent = `Q′ = Q总/2 = ${signed(average)}`;
      if (contactStep === 1) {
        $('#contactStageCaption').textContent = '初始：两球分开，各自保持原来的电荷量。';
      } else if (contactStep === 2) {
        const from = charges[0] < charges[1] ? 'A' : 'B';
        const to = from === 'A' ? 'B' : 'A';
        $('#contactStageCaption').textContent = charges[0] === charges[1]
          ? '两球原本电荷相同，接触后没有净电荷转移。'
          : `接触：电子从 ${from} 球流向 ${to} 球，直到两球电势相等。`;
      } else {
        $('#contactStageCaption').textContent = `再次分开：每个球都稳定为 ${signed(average)}，总电荷没有改变。`;
      }
      stepButtons.forEach(button => {
        const active = Number(button.dataset.contactStep) === contactStep;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    presetButtons.forEach(button => button.addEventListener('click', () => {
      charges = button.dataset.contactPreset.split(',').map(Number);
      contactStep = 1;
      presetButtons.forEach(item => item.classList.toggle('active', item === button));
      renderContact();
    }));
    stepButtons.forEach(button => button.addEventListener('click', () => {
      contactStep = Number(button.dataset.contactStep);
      renderContact();
    }));
    renderContact();
  }
}

function initStorageMotion() {
  const lab = $('#storageMotionLab');
  const buttons = $$('[data-storage-mode]');
  if (!lab || !buttons.length) return;

  function selectMode(mode) {
    const charging = mode === 'charge';
    lab.dataset.mode = mode;
    $('#capMotionDevice').textContent = charging ? '电源' : '小灯泡';
    $('#batteryMotionDevice').textContent = charging ? '充电器' : '手机电路';
    $('#capMotionEnergy').textContent = charging ? '电能 → 电场能' : '电场能 → 电能';
    $('#batteryMotionEnergy').textContent = charging ? '电能 → 化学能' : '化学能 → 电能';
    $('#capMotionText').textContent = charging
      ? '电源把电子从左极板搬到右极板。两板出现等量异号电荷，板间电场逐渐建立。'
      : '电子从负极板经过小灯泡回到正极板。电荷分离逐渐消失，电场能转化为电能、光和热。';
    $('#batteryMotionText').textContent = charging
      ? '充电器推动电子走外电路，同时锂离子在电池内部迁移，使材料进入较高能量的化学状态。'
      : '电池内部自发发生化学反应，推动电子经过手机电路，同时锂离子向相反方向迁移。';
    $('#storageModeTitle').textContent = charging ? '充电时' : '放电时';
    $('#storageModeSummary').textContent = charging
      ? '两者都从外部接收电能，但电容器建立电场，手机电池改变内部化学状态。'
      : '两者都向外部电路供能，但电容器削弱电场，手机电池进行化学反应。';
    buttons.forEach(button => {
      const active = button.dataset.storageMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  buttons.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.storageMode)));
  selectMode('charge');
}

const situationQuestions = [
  {
    topic: '静电感应', difficulty: '基础',
    question: '冬天，把摩擦过毛衣的气球靠近没有带电的墙面，气球能暂时贴在墙上。对此解释正确的是：',
    options: ['墙面被摩擦后整体带上了与气球异号的电荷', '墙内电荷发生微小分离，靠近气球的一侧异号电荷偏多', '气球把墙内所有电子都吸走了', '气球与墙之间产生了万有引力以外的新力'],
    answer: 1,
    explanation: '墙整体仍近似电中性，但其中的正、负电荷发生微小偏移；近端异号电荷距离更近，吸引作用占优势。这就是静电感应（或极化）。'
  },
  {
    topic: '静电与湿度', difficulty: '基础',
    question: '同样用塑料梳子梳头，干燥的冬天比潮湿天气更容易出现静电。主要原因是：',
    options: ['冬天电子的电荷量更大', '潮湿空气会完全阻止摩擦起电', '潮湿表面形成较易导电的水膜，电荷更容易泄漏', '干燥时库仑常量会明显变大'],
    answer: 2,
    explanation: '潮湿环境会使物体表面更容易导电，积累的电荷会逐渐流走，所以不容易保持明显的净电荷。电子的电荷量和库仑常量并未因此改变。'
  },
  {
    topic: '带电体吸引轻小物体', difficulty: '基础',
    question: '带电梳子能吸起原本不带电的小纸屑。在纸屑尚未接触梳子时，最合理的判断是：',
    options: ['纸屑一定已经带上与梳子等量的异号电荷', '纸屑内部电荷重新分布，近端受到的吸引强于远端的排斥', '纸屑中的质子移动到了靠近梳子的一端', '纸屑和梳子之间没有电场'],
    answer: 1,
    explanation: '纸屑可以保持总电荷为零。带电梳子的电场使纸屑发生极化，近端异号电荷更近，库仑力更大，因此合力表现为吸引。固体中的质子不会整体搬家。'
  },
  {
    topic: '静电安全', difficulty: '基础',
    question: '油罐车装卸燃油时常用导线把车体接地。这样做的主要目的是什么？',
    options: ['让车体获得更多电子以增加重量', '把积累的静电缓慢导入大地，避免火花放电', '增大车体与地面之间的摩擦力', '利用大地给燃油加热'],
    answer: 1,
    explanation: '燃油流动和摩擦可能使车体积累静电。接地提供持续、缓慢的泄放通道，减小电势差，从而降低火花引燃油气的风险。'
  },
  {
    topic: '尖端放电', difficulty: '基础',
    question: '高层建筑上的避雷针做得很尖，并通过导体与大地连接。按静电学模型，尖端的主要特点是：',
    options: ['尖端附近电荷密度较小，电场较弱', '尖端附近电荷密度较大，电场较强，空气更容易被电离', '尖端内部电场永远最大', '尖端可以把雷电储存在内部'],
    answer: 1,
    explanation: '导体尖端曲率大，表面电荷更容易密集，附近电场较强，可能发生尖端放电；接地导体还为电荷提供通向大地的路径。'
  },
  {
    topic: '静电屏蔽', difficulty: '基础',
    question: '汽车遭遇雷击时，车内人员通常比站在车外更安全。从静电屏蔽角度看，关键原因是：',
    options: ['橡胶轮胎能挡住一切电流', '金属车壳上的电荷主要分布在外表面，车内区域电场很弱', '车内没有任何自由电子', '雷电只会选择最高的树木'],
    answer: 1,
    explanation: '封闭金属外壳达到静电平衡时，多余电荷主要分布在外表面，壳内电场接近零。现实中仍应避免触碰金属车身，并听从安全指引。'
  },
  {
    topic: '静电除尘', difficulty: '基础',
    question: '静电空气净化器先使灰尘颗粒带电，再让它们经过带异号电荷的集尘板。灰尘被收集主要因为：',
    options: ['带电灰尘在电场中受到电场力', '灰尘的质量在电场中消失', '集尘板只产生磁场', '电场把灰尘变成了电子'],
    answer: 0,
    explanation: '颗粒带电后，在集尘板形成的电场中受到 F=qE 的作用，运动到集尘板并被吸附。电场改变的是颗粒运动状态，不会消除其质量。'
  },
  {
    topic: '静电喷涂', difficulty: '基础',
    question: '汽车零件进行静电喷漆时，让雾化漆滴带同种电荷，并使工件接地。这样的好处是：',
    options: ['漆滴相互吸引并聚成大液滴', '漆滴相互排斥而分散，并在电场力作用下趋向工件', '工件接地后一定不受任何电场力', '漆滴带电后不再受重力'],
    answer: 1,
    explanation: '同号漆滴相互排斥，有利于喷雾分散；带电漆滴又会受到工件附近电场的作用，更多地沉积到工件表面，提高覆盖率。'
  },
  {
    topic: '同种电荷排斥', difficulty: '基础',
    question: '体验静电起电机时，人的头发会一根根张开。最主要的原因是：',
    options: ['每根头发带有同种电荷，彼此排斥', '头发中的质子全部离开了头发', '头发受到的重力突然消失', '空气只对头发产生向外的压力'],
    answer: 0,
    explanation: '人体和头发获得同种净电荷后，各根头发之间存在排斥力，于是尽量相互远离。头发仍然受到重力，只是静电力足以改变其形状。'
  },
  {
    topic: '静电复印', difficulty: '进阶',
    question: '激光打印机中，带电墨粉会有选择地附着在感光鼓的某些区域。这个过程主要利用：',
    options: ['电荷在电场中的受力及异号电荷吸引', '墨粉在真空中自动寻找文字', '所有导体内部电场都无限大', '电荷守恒说明墨粉一定落到纸上'],
    answer: 0,
    explanation: '感光鼓表面形成与图像对应的电荷分布，带电墨粉在电场力作用下被选择性吸附，再转移到纸面。核心仍是电场对电荷的作用。'
  },
  {
    topic: '电容式触摸屏', difficulty: '基础',
    question: '手指靠近电容式触摸屏后，控制芯片能够判断触摸位置，主要依据是：',
    options: ['手指使屏幕局部电容发生变化', '手指给屏幕施加的压力一定相同', '手指放出的光改变了屏幕亮度', '人体只会产生磁场，不会影响电场'],
    answer: 0,
    explanation: '人体可以影响电场分布。手指靠近透明电极时，局部等效电容发生微小变化，芯片测出哪些电极的 C 改变，从而定位触摸点。'
  },
  {
    topic: '电容传感器', difficulty: '进阶',
    question: '电容式麦克风中，一块薄膜会随声音振动，它与固定极板组成电容器。声音主要通过改变哪个量引起电容变化？',
    options: ['两板间距 d', '电子的元电荷 e', '真空中的光速 c', '库仑常量 k'],
    answer: 0,
    explanation: '薄膜振动使两板间距 d 改变。由 C∝S/d 可知，d 的变化会转化成 C 的变化，随后电路把这种变化转换为电信号。'
  },
  {
    topic: '电容储能', difficulty: '基础',
    question: '相机闪光灯由小电池供电，却能在短时间内发出很强的光。电容器在其中的主要作用是：',
    options: ['先储存电场能，再在短时间内放出', '永久制造电荷而不消耗能量', '把所有电能转化为重力势能', '使电池电压永远保持为零'],
    answer: 0,
    explanation: '电池先较慢地给电容器充电，能量储存在电场中；触发闪光时电容器快速放电，于是短时间内输出较大的功率。'
  },
  {
    topic: '电容放电', difficulty: '基础',
    question: '某充电器拔下插座后，指示灯仍亮了一小会儿再逐渐熄灭。合理解释是：',
    options: ['电网仍通过空气持续供电', '内部电容器继续放电，Q 减少使 U=Q/C 逐渐减小', '拔下插头后电容自动增大到无限大', '指示灯不需要能量也能发光'],
    answer: 1,
    explanation: '断开外部电源后，电容器可能仍带电。它通过内部电路放电，Q 逐渐减小；结构不变时 C 近似不变，因此 U 逐渐降低。'
  },
  {
    topic: '接电源的电容器', difficulty: '进阶',
    question: '平行板电容器始终连接恒压电源。保持正对面积和介质不变，将板间距增大，则：',
    options: ['C 增大，Q 增大，E 增大', 'C 减小，Q 减小，E 减小', 'C 减小，Q 不变，E 不变', 'C 不变，Q 减小，E 增大'],
    answer: 1,
    explanation: '连接恒压电源时 U 不变。d 增大使 C∝1/d 减小；Q=CU 因而减小；E=U/d 也减小。'
  },
  {
    topic: '断开电源的电容器', difficulty: '进阶',
    question: '理想平行板电容器充电后与电源断开。保持面积和介质不变，将板间距增大，则：',
    options: ['Q 不变，C 减小，U 增大，E 近似不变', 'Q 减小，C 增大，U 不变，E 增大', 'Q 不变，C 不变，U 减小，E 减小', 'Q 增大，C 减小，U 不变，E 不变'],
    answer: 0,
    explanation: '断开电源后没有电荷交换通道，所以 Q 不变。d 增大使 C 减小，U=Q/C 增大；理想模型中 E=Q/(εS)，因此 E 近似不变。'
  },
  {
    topic: '介质与电容', difficulty: '进阶',
    question: '平行板电容器连接恒压电源，板间距不变。把介电常数更大的材料完全插入两板之间，则：',
    options: ['C 增大，U 不变，Q 增大', 'C 减小，U 增大，Q 不变', 'C 不变，U 不变，Q 减小', 'C 增大，U 减小，Q 不变'],
    answer: 0,
    explanation: '插入介质使 C 增大；电源仍连接，所以 U 被锁定；由 Q=CU 可知电源会继续搬运电荷，使 Q 增大。'
  },
  {
    topic: '滤波电容', difficulty: '基础',
    question: '手机充电器中的滤波电容可以使整流后的输出电压更平稳。其工作方式主要是：',
    options: ['电压较高时充电，电压回落时向电路放电', '只在电压为零时吸收全部电荷', '不断改变电子所带的电荷量', '把交流电场完全变成磁场'],
    answer: 0,
    explanation: '电压较高时电容器储存能量，电压回落时再释放能量，相当于填补电压的低谷，从而减小输出电压的波动。'
  },
  {
    topic: '防静电措施', difficulty: '基础',
    question: '维修电脑芯片时常佩戴带电阻的防静电手环，并把它可靠接地。手环中串联较大电阻主要是为了：',
    options: ['让积累电荷较缓慢、安全地泄放，限制瞬时电流', '让人体迅速获得大量电荷', '完全阻止任何电荷移动', '增大人体与芯片之间的库仑力'],
    answer: 0,
    explanation: '接地用于释放静电；串联电阻可以限制电流，使电荷以较缓慢的方式泄放，既保护器件，也提高人员安全性。'
  },
  {
    topic: '电容式检测', difficulty: '进阶',
    question: '电容式土壤湿度传感器可以根据电容变化估计含水量。湿土通常比干土使传感器电容更大，主要因为：',
    options: ['水使周围介质的等效介电常数增大', '水使电子的质量变为零', '湿土一定让两电极正对面积减小', '水会使所有电场立即消失'],
    answer: 0,
    explanation: '水的介电性质与空气、干土不同。含水量增加会改变电极周围的等效介电常数，从而改变电容 C；电路再把 C 的变化换算成湿度。'
  }
];

function initSituationQuiz() {
  const questionElement = $('#quizQuestion');
  const optionsElement = $('#quizOptions');
  if (!questionElement || !optionsElement) return;

  let current = 0;
  let answers = Array(situationQuestions.length).fill(null);
  const letters = ['A', 'B', 'C', 'D'];

  function renderQuiz() {
    const item = situationQuestions[current];
    const answered = answers[current];
    $('#quizCounter').textContent = `第 ${current + 1} / ${situationQuestions.length} 题`;
    $('#quizTopic').textContent = item.topic;
    $('#quizDifficulty').textContent = item.difficulty;
    questionElement.textContent = item.question;
    optionsElement.replaceChildren();

    item.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      const letter = document.createElement('b');
      letter.textContent = letters[index];
      const copy = document.createElement('span');
      copy.textContent = option;
      button.append(letter, copy);
      if (answered !== null) {
        button.disabled = true;
        if (index === item.answer) button.classList.add('correct');
        if (index === answered && answered !== item.answer) button.classList.add('wrong');
      }
      button.addEventListener('click', () => {
        if (answers[current] !== null) return;
        answers[current] = index;
        renderQuiz();
      });
      optionsElement.appendChild(button);
    });

    const explanation = $('#quizExplanation');
    if (answered === null) {
      explanation.hidden = true;
      explanation.replaceChildren();
    } else {
      const heading = document.createElement('strong');
      heading.textContent = answered === item.answer ? `回答正确 · ${letters[item.answer]}` : `回答错误 · 正确答案 ${letters[item.answer]}`;
      const copy = document.createElement('p');
      copy.textContent = item.explanation;
      explanation.replaceChildren(heading, copy);
      explanation.className = `quiz-explanation ${answered === item.answer ? 'correct' : 'wrong'}`;
      explanation.hidden = false;
    }

    const answeredCount = answers.filter(answer => answer !== null).length;
    const correctCount = answers.reduce((total, answer, index) => total + (answer === situationQuestions[index].answer ? 1 : 0), 0);
    $('#quizScore').textContent = answeredCount === situationQuestions.length
      ? `完成 · ${correctCount} / ${situationQuestions.length} 题正确`
      : `已答 ${answeredCount} 题 · 答对 ${correctCount} 题`;
    $('#quizProgressBar').style.width = `${answeredCount / situationQuestions.length * 100}%`;
    $('.quiz-progress').setAttribute('aria-valuenow', answeredCount);
    $('#quizPrevious').disabled = current === 0;
    $('#quizNext').disabled = current === situationQuestions.length - 1;
  }

  $('#quizPrevious').addEventListener('click', () => { current = Math.max(0, current - 1); renderQuiz(); });
  $('#quizNext').addEventListener('click', () => { current = Math.min(situationQuestions.length - 1, current + 1); renderQuiz(); });
  $('#quizReset').addEventListener('click', () => { current = 0; answers = Array(situationQuestions.length).fill(null); renderQuiz(); });
  renderQuiz();
}

$('#sourceSign')?.addEventListener('change', drawInduction);
$('#inductionDistance')?.addEventListener('input', drawInduction);
window.addEventListener('resize', drawInduction);
window.addEventListener('resize', drawField);
window.addEventListener('resize', drawPotential);
window.addEventListener('resize', drawCapacitor);
window.addEventListener('scroll', updateNav, { passive: true });
drawInduction();
initCoulomb();
initField();
initTestCharge();
initPotential();
initEnergyAnalogy();
initParticle();
initCapacitor();
initWorkedExamples();
initChargeLedger();
initLifeCases();
initGroundingLab();
initElectroscopeLab();
initCoulombScenarios();
initStorageMotion();
initSituationQuiz();
updateNav();
